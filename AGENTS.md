# AGENTS.md

## Architecture

Stateful VESTIS AI Try-on System consisting of:
1. **Frontend Monolith:** `ai_outfit_prototype.html` (~3400 lines, 205KB). Contains all UI, CSS, and main logic. No build, bundler, or dependencies.
2. **Local Relay Server:** `vestis_server.py` (Python HTTP server on port 8000). Serves static files and implements stateful endpoints (`/api/store_payload`, `/api/get_payload`, `/api/store_result`, `/api/get_result`) to bypass browser Cross-Origin-Opener-Policy (COOP) and CORS restrictions.
3. **Automated Userscript:** `gemini_auto_synth.user.js` (v2.4). Automates Google Gemini Gem interface (`gemini.google.com`) for outfit synthesis, featuring recursive Shadow DOM selectors, simulated drag-and-drop file upload, and a response count guard.

**Layout:** Three-column CSS Grid — `col-left` (wardrobe/upload), `col-main` (try-on display), `col-right` (profile/favorites/logs). Mobile ≤768px uses fixed bottom nav bar.

**JS structure (single `<script>` block):**
- VTON engines:
  - Local/Classic API: `startVTON()`, `executeVTON()`, `mergeOutfitCanvas()`
  - Gemini automation: `triggerGeminiQuickSynth()`, `startResultPolling()`, `loadSynthesizedImageFromBase64()`
- Wardrobe & Drag-and-drop: `render()`, `wearItem()`, `clearItem()`, `processImage(..., shouldWear)`, `dz.ondrop`, `saveWardrobe()`, `initWardrobe()`
- Face swap & Twin: `triggerFaceSwap()`, `generateDigitalTwin()`, `applyCurrentModelToQuickSynth()`
- Weather: `initWeather()`, `updateWeatherByCity()` (Open-Meteo API)
- Camera/upload: `triggerUpload()`, `openCamera()`, `openFaceCamera()`
- Favorites/logs: `toggleFavorite()`, `findItemById()`, `openLogsModal()`

## Running

```bash
python vestis_server.py
# Open http://localhost:8000/ai_outfit_prototype.html
```

Requires Python in PATH. `一鍵啟動_VESTIS_AI.bat` automatically launches the `vestis_server.py` server.

## External APIs

- **fal.ai** (3 endpoints): `fashn/tryon/v1.5`, `idm-vton`, `cat-vton` for VTON rendering; `face-swap` for digital twin; `pixelcut/background-removal` for image processing. Hardcoded fallback key at `executeVTON():1613` and `triggerFaceSwap():1774`.
- **Open-Meteo** (`api.open-meteo.com`): real-time weather by GPS coordinates.
- **BigDataCloud** (`api.bigdatacloud.net`): reverse geocode for city name.
- **Google Shopping** (`google.com/search?tbm=shop`): purchase link redirects.
- **GitHub raw** (`raw.githubusercontent.com/alexeygrigorev/clothing-dataset-small`): 90 web recommendation images. Uses `onerror` placeholder fallback at `render():2155-2163`.
- **Gemini Gem Uploader / Local server endpoint** for auto-synthesis automation.

## State (all `localStorage`)

| Key | Content |
|---|---|
| `vestis_custom_wardrobe` | User-uploaded items (id > 1000000) |
| `vestis_profile` | Digital twin: `{img, type, h, w}` |
| `vestis_outfit_log` | Array of try-on log entries |
| `vestis_vton_engine` | `"fashn"` or `"classic"` |
| `fal_api_key` | User's fal.ai API key |
| `vestis_favorites` | Array of favorite item IDs |

## Item ID ranges

- Built-in defaults: `1`–`13`
- Web recommendation items: `2001`–`4430`
- User uploads: `> 1000000` (from `Date.now()`)

## Critical gotchas

- **No tests, lint, or typecheck** — any syntax error breaks the entire app.
- **`test.js` is NOT a test** — it's a scratch backup of copied functions.
- **9 Node.js patch scripts** (`*.js` at root) target old path `D:/johnny-D/Gemini設計/AI穿搭/` (without `-Mimo`). They are NOT part of the app; run manually only.
- **`mergeOutfitCanvas()`** uses a 52% split line with 6% feathering. Image sources loaded with `crossOrigin="Anonymous"` — if the server lacks CORS headers, the merge fails. Wrap API results with `getBase64()` before merging to avoid this.
- **`faceSwappedJpgUrl`** is `null` until `triggerFaceSwap()` succeeds. It is reset to `null` on model switch (`nextModel()`) to ensure default models are used cleanly. Do NOT overwrite it with final VTON synthesized images, ensuring subsequent try-ons always use clean, garment-free model bases.
- **Layer CSS** uses `right: 5%` for positioning (was `-36%`, which put items outside the viewport). If layers appear off-screen, check these values.
- **Web items** are NOT in the `wardrobe[]` array — they live in `webBatches{}`. Use `findItemById()` (searches both) instead of `wardrobe.find()` for favorites and other cross-references.
- **`getBase64()`** compresses images to max 768px at JPEG 0.8. fal.ai result URLs expire in minutes — always convert to base64 immediately.
- **`analyzeStyles()`** is debounced (150ms) in `wearItem()`/`clearItem()` but called synchronously in `randomize()`.
- **`mobileNav(section, btn)`** requires the button element as second parameter (passed via `onclick` as `this`).
- **Trash zone** only deletes items with `id > 1000000`. Built-in and web items are protected.
- **`showToast()`** is the reusable toast mechanism — do not create ad-hoc toast `<div>` elements.
- **Dark glass-morphism CSS** uses custom properties: `--bg-deep`, `--glass-bg`, `--accent`, `--cyan`. Responsive breakpoints: mobile ≤768px, tablet 769–1024px, desktop >1440px. Touch devices get `@media (hover: none)` treatment.
- **Weather** falls back to `mockWeather` object with local background images when Open-Meteo fails.
- **Tampermonkey duplicate scripts** will crash on TrustedHTML policies. Always delete old versions and ensure only the latest `v2.1` userscript is active.
- **Gemini Auto-Synthesis Observer Guard:** The userscript uses a response count difference (`responses.length > initialResponseCount`) to ignore old generated images in chat history. If this count check is bypassed, the script will return the first historical synthesis image instead of waiting for the new one.
- **`clearItemSilent(cat)`** clears the selected item from the main model viewer silently. Whenever you apply a new synthesized image to the base-model, call `clearItemSilent()` for all item categories, followed by `updateCancelButtonsVisibility()` and `analyzeStyles()` to keep the UI clean.
- **HUD 「vton渲染付費」警示引導區**：為了提升付費功能能見度，將原先在日誌動態滾動印出的「vton渲染付費」提示，移至 HUD 計時標題區下方作為常駐 Banner。採用 `.hud-payment-warning` 類別，字體加大（`0.85rem`），具金黃色霓虹效果，且移除原 `triggerGeminiQuickSynth()` 中的動態 `addHUDLine` 以免訊息重複。
- **`modelFiles` 模特兒底圖陣列**：目前從資料夾 `穿搭照片/模特兒/` 中載入全部共 23 張模特兒底圖（型號包含 model1 到 model44）。主畫面上新增了半透明磨砂玻璃風格的左右切換按鈕（`.model-switch-btn`，`z-index: 25`），點選即可透過 `nextModel()` / `prevModel()` 和 `updateModelDisplay()` 進行順暢切換。
- **Gemini 彈出視窗與焦點切換機制**：自動合成在螢幕中央開啟 `900x700` 尺寸的視窗展示 VESTIS 黑色讀取畫面。上傳完成並送出指令時，使用者腳本會對主視窗發送 `GEMINI_SENT` 訊息，促使主視窗調用 `window.focus()` 奪回焦點並將彈出視窗推至背景（防休眠運作中）。合成完畢後該視窗會透過 `window.close()` 自動關閉，不干擾使用者操作。
- **Gemini 自動化視窗安全標記與防護隔離機制**：為防範使用者在系統關閉或日常手動開啟 Gemini 分頁時誤觸發自動化腳本導致頁面卡死，`ai_outfit_prototype.html` 的 `window.open` 網址會帶有 `&vestis=1` 參數。`gemini_auto_synth.user.js` (v2.4) 在載入之初會進行此標記檢查，若非 VESTIS 自動化調用則立刻退出，確保日常 Gemini 使用完全不受影響。

