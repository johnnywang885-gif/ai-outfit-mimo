// supabase/functions/vton-proxy/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // 1. Handle CORS Preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 2. Parse request payload
    const { cat, garmentUrl, humanUrl, itemName, engine } = await req.json();

    if (!garmentUrl || !humanUrl) {
      return new Response(
        JSON.stringify({ error: "Missing garmentUrl or humanUrl" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Read API key from secure environment variable
    const apiKey = Deno.env.get("FAL_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Server error: FAL_API_KEY environment variable is not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let resultUrl = "";

    // 4. Dispatch based on VTON engine selection
    if (engine === "fashn") {
      // ===== FASHN v1.5 API Call =====
      const fashnCategory = (cat === "bottom") ? "bottoms" : "tops";
      const requestPayload = {
        model_image: humanUrl,
        garment_image: garmentUrl,
        category: fashnCategory,
        mode: "balanced",
      };

      console.log(`[VTON PROXY] Calling fashn/tryon/v1.5, category=${fashnCategory}`);
      const response = await fetch("https://fal.run/fal-ai/fashn/tryon/v1.5", {
        method: "POST",
        headers: {
          "Authorization": `Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[VTON PROXY] Fashn API Error:`, errText);
        return new Response(
          JSON.stringify({ error: `Fashn API error: ${errText}` }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result = await response.json();
      resultUrl = result.output?.[0] || result.image?.url || result.images?.[0]?.url || (Array.isArray(result) && result[0]);
    } else {
      // ===== Classic VTON API Call (IDM-VTON / CatVTON) =====
      const gType = (cat === "top" || cat === "outerwear") ? "upper_body" : "lower_body";
      let apiUrl = "https://fal.run/fal-ai/idm-vton";
      let finalDesc = (cat === "bottom") ? "lower body garment, pants or skirt" : "upper body garment, shirt or jacket";
      if (itemName) finalDesc += `: ${itemName}`;
      finalDesc += ", high quality, fashion photography";

      let requestPayload: any = {
        human_image_url: humanUrl,
        garment_image_url: garmentUrl,
        description: finalDesc,
        category: gType,
        garment_type: gType,
      };

      if (cat === "bottom") {
        apiUrl = "https://fal.run/fal-ai/cat-vton";
        requestPayload = {
          human_image_url: humanUrl,
          garment_image_url: garmentUrl,
          cloth_type: "lower",
          description: finalDesc,
        };
      }

      console.log(`[VTON PROXY] Calling ${apiUrl}`);
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[VTON PROXY] Classic VTON API Error:`, errText);
        return new Response(
          JSON.stringify({ error: `VTON API error: ${errText}` }),
          { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const result = await response.json();
      resultUrl = (result.image && result.image.url) || (result.images && result.images[0] && result.images[0].url);
    }

    // 5. Return success response
    return new Response(
      JSON.stringify({ outputUrl: resultUrl }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error("[VTON PROXY] Internal error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
