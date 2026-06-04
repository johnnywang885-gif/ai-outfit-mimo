# AGENTS.md

## Architecture

Single-file monolith: `ai_outfit_prototype.html` (~3350 lines, 200KB).
All HTML, CSS, JavaScript inline. No build, bundler, framework, or dependencies.

**Layout:** Three-column CSS Grid — `col-left` (wardrobe/upload), `col-main` (try-on display), `col-right` (profile/favorites/logs). Mobile ≤768px uses fixed bottom nav bar.

**JS structure (single `<script>` block):**
- VTON engine: `startVTON()`, `executeVTON()`, `mergeOutfitCanvas()`
- Wardrobe: `render()`, `wearItem()`, `clearItem()`, `saveWardrobe()`, `initWardrobe()`
- Face swap: `triggerFaceSwap()`, `generateDigitalTwin()`
- Weather: `initWeather()`, `updateWeatherByCity()` (Open-Meteo API)
- Camera/upload: `triggerUpload()`, `openCamera()`, `openFaceCamera()`
- Favorites/logs: `toggleFavorite()`, `findItemById()`, `openLogsModal()`

## Running

```bash
python -m http.server 8000
# Open http://localhost:8000/ai_outfit_prototype.html
```

Requires Python in PATH. `一鍵啟動_VESTIS_AI.bat` automates this.

## External APIs

- **fal.ai** (3 endpoints): `fashn/tryon/v1.5`, `idm-vton`, `cat-vton` for VTON rendering; `face-swap` for digital twin; `pixelcut/background-removal` for image processing. Hardcoded fallback key at `executeVTON():1613` and `triggerFaceSwap():1774`.
- **Open-Meteo** (`api.open-meteo.com`): real-time weather by GPS coordinates.
- **BigDataCloud** (`api.bigdatacloud.net`): reverse geocode for city name.
- **Google Shopping** (`google.com/search?tbm=shop`): purchase link redirects.
- **GitHub raw** (`raw.githubusercontent.com/alexeygrigorev/clothing-dataset-small`): 90 web recommendation images. Uses `onerror` placeholder fallback at `render():2155-2163`.

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
- **9 Node.js patch scripts** (`*.js` at root) target old path `D:/johnny-D/Gemini設計/AI穿搭/` (without `-Mimo`). They are NOT part of the app; run manually only. Multiple scripts redundantly modify `webBatches` and may conflict if run in sequence.
- **`mergeOutfitCanvas()`** uses a 52% split line with 6% feathering. Image sources loaded with `crossOrigin="Anonymous"` — if the server lacks CORS headers, the merge fails. Wrap API results with `getBase64()` before merging to avoid this.
- **`faceSwappedJpgUrl`** is `null` until `triggerFaceSwap()` succeeds. `startVTON()` guards this: falls back to the base model image when null.
- **Layer CSS** uses `right: 5%` for positioning (was `-36%`, which put items outside the viewport). If layers appear off-screen, check these values.
- **Web items** are NOT in the `wardrobe[]` array — they live in `webBatches{}`. Use `findItemById()` (searches both) instead of `wardrobe.find()` for favorites and other cross-references.
- **`getBase64()`** compresses images to max 768px at JPEG 0.8. fal.ai result URLs expire in minutes — always convert to base64 immediately.
- **`analyzeStyles()`** is debounced (150ms) in `wearItem()`/`clearItem()` but called synchronously in `randomize()`.
- **`mobileNav(section, btn)`** requires the button element as second parameter (passed via `onclick` as `this`).
- **Trash zone** only deletes items with `id > 1000000`. Built-in and web items are protected.
- **`showToast()`** is the reusable toast mechanism — do not create ad-hoc toast `<div>` elements.
- **Dark glass-morphism CSS** uses custom properties: `--bg-deep`, `--glass-bg`, `--accent`, `--cyan`. Responsive breakpoints: mobile ≤768px, tablet 769–1024px, desktop >1440px. Touch devices get `@media (hover: none)` treatment.
- **Weather** falls back to `mockWeather` object with local background images when Open-Meteo fails.
