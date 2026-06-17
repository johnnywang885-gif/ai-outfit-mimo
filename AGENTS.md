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
| `vestis_deleted_default_items` | Array of deleted default item IDs (id <= 1000000) |
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
- **Trash zone** delegates to `deleteWardrobeItem(id)` and can delete both custom uploaded items (`id > 1000000`) and default wardrobe items (`id <= 1000000`). Web recommended items live in `webBatches{}` and remain protected.
- **`showToast()`** is the reusable toast mechanism — do not create ad-hoc toast `<div>` elements.
- **Dark glass-morphism CSS** uses custom properties: `--bg-deep`, `--glass-bg`, `--accent`, `--cyan`. Responsive breakpoints: mobile ≤768px, tablet 769–1024px, desktop >1440px. Touch devices get `@media (hover: none)` treatment.
- **Weather** falls back to `mockWeather` object with local background images when Open-Meteo fails.
- **Tampermonkey duplicate scripts** will crash on TrustedHTML policies. Always delete old versions and ensure only the latest `v2.1` userscript is active.
- **Gemini Auto-Synthesis Observer Guard:** The userscript uses a response count difference (`responses.length > initialResponseCount`) to ignore old generated images in chat history. If this count check is bypassed, the script will return the first initial response image instead of waiting for the new one.
- **`clearItemSilent(cat)`** clears the selected item from the main model viewer silently. Whenever you apply a new synthesized image to the base-model, call `clearItemSilent()` for all item categories, followed by `updateCancelButtonsVisibility()` and `analyzeStyles()` to keep the UI clean.
- **HUD 「vton渲染付費」警示引導區**：為了提升付費功能能見度，將原先在日誌動態滾動印出的「vton渲染付費」提示，移至 HUD 計時標題區下方作為常駐 Banner。採用 `.hud-payment-warning` 類別，字體加大（`0.85rem`），具金黃色霓虹效果，且移除原 `triggerGeminiQuickSynth()` 中的動態 `addHUDLine` 以免訊息重複。
- **`modelFiles` 模特兒底圖陣列**：目前從資料夾 `穿搭照片/女模特兒/` 中載入全部共 54 張女模特兒底圖。主畫面上新增了半透明磨砂玻璃風格的左右切換按鈕（`.model-switch-btn`，`z-index: 25`），點選即可透過 `nextModel()` / `prevModel()` 和 `updateModelDisplay()` 進行順暢切換。
- **Gemini 彈出視窗與焦點切換及防休眠機制**：自動合成開啟一個微小 (`200x200`) 視窗，並將坐標定位於螢幕可用寬高邊緣外 (`availWidth - 50, availHeight - 50`)，使僅有 `50x50` 像素留在螢幕內，其餘部分隱藏在邊界外以規避 Chrome 座標重設並達到極致隱形效果。同時，腳本內建了 WebRTC 連線 (`keepAliveWebRTC`) 與靜音音訊模擬 (`startSilentAudio`) 雙重機制，防止瀏覽器因為視窗被最小化或置於背景而進行 Tab Throttling CPU 節流限制。
- **Gemini 自動化視窗安全標記與防護隔離機制**：為防範使用者在系統關閉或日常手動開啟 Gemini 分頁時誤觸發自動化腳本導致頁面卡死，`ai_outfit_prototype.html` 的 `window.open` 網址會帶有 `&vestis=1` 參數。`gemini_auto_synth.user.js` (v2.4) 在載入之初會進行此標記檢查，若非 VESTIS 自動化調用則立刻退出，確保日常 Gemini 使用完全不受影響。
- **Supabase 全域變數衝突防護**：`index.html` 中原先宣告的 `let supabase` 變數會與 CDN 載入的 `window.supabase` 衝突，導致瀏覽器拋出 `SyntaxError: Identifier 'supabase' has already been declared` 進而中斷整個 JS 腳本執行。全域變數已統一改名為 `supabaseClient` 解決此衝突。
- **訪客衣櫃雲端同步防遺失保護**：訪客狀態下拖曳上傳的 `localStorage` 單品（`vestis_custom_wardrobe`）在登入同步時，改為上傳至雲端 Storage 與資料庫確認成功後才從本地刪除。若發生任何上傳失敗，單品會安全保留於本地瀏覽器，防止在同步時永久遺失。
- **Vercel 靜態專案部署與偵測干擾**：本專案為無建置步驟的純靜態 HTML 網頁。請勿將 `package.json` 與 `package-lock.json` 或 `node_modules` 上傳至 Vercel，否則 Vercel 偵測器會誤判為 Node.js 專案並啟動建置，導致部署卡死在 `UNKNOWN` 狀態。已在 `.gitignore` 排除相關檔案以實現極速靜態部署。
- **Supabase 儲存空間（Storage）預設需求**：專案雲端儲存需要手動在 Supabase Dashboard 建立一個名稱為 **`wardrobe`**（區分大小寫）的 **Public** 儲存桶。若儲存桶不存在或權限未開，單品上傳與同步將會失敗。
- **Supabase CDN 套件名稱致命錯誤**：`index.html` 的 CDN script 標籤必須為 `@supabase/supabase-js@2`，**不可**誤寫為 `@supabase/supabaseClient-js@2`（後者不存在）。若 CDN 載入失敗，`window.supabase` 為 undefined，整個 Auth / Storage / DB 功能全部癱瘓，且不報錯，極難診斷。
- **`vercel.json` 靜態部署設定必要**：專案根目錄必須存在 `vercel.json` 並設定 `@vercel/static` builder，否則 Vercel 無法正確偵測靜態網站，導致所有新部署卡死在 `UNKNOWN` 狀態，永遠回滾至最後一個成功的舊版本。

