# AGENTS.md

## Architecture

Stateful VESTIS AI Try-on System:
1. **Frontend Monolith:** `index.html` (~458KB, 6596 lines). All UI, CSS, and JS in one file. No build tool or dependencies.
2. **Local Relay Server:** `vestis_server.py` (Python, port 8000). Serves static files + stateful endpoints (`/api/store_payload`, `/api/get_payload`, `/api/store_result`, `/api/get_result`) to bypass COOP/CORS.
3. **Automated Userscript:** `gemini_auto_synth.user.js` (v2.5). Automates `gemini.google.com` for outfit synthesis.

**Layout:** Two-column CSS Grid — `col-left` (360px, wardrobe/upload/twin/assets/account), `col-main` (flex, try-on display). `col-right` is `display: none`. Mobile ≤768px uses single-column stacked layout with fixed bottom nav.

## Running

- **Use `py`, not `python`** — on this machine `python` is a Microsoft Store stub; `py` is the real launcher (Python 3.13).
  ```bash
  py vestis_server.py
  # Open http://localhost:8000/index.html
  ```
- Or double-click `一鍵啟動_VESTIS_AI.bat` (already uses `py`, portable `cd /d "%~dp0"`, starts server then opens `index.html`).

## Vercel Deployment

- `vercel.json` uses `@vercel/static` builder for `index.html`, `web_images/**`, `穿搭照片/**`
- Do NOT commit `package.json`, `package-lock.json`, or `node_modules` — Vercel misdetects as Node.js and fails to deploy
- Deployed at: `https://ai-outfit-mimo.vercel.app` — auto-deploys on push to `main`
- Repo is PUBLIC → `raw.githubusercontent.com/johnnywang885-gif/ai-outfit-mimo/main/...` serves the userscript and image fallbacks without auth

## External APIs

- **fal.ai**: `fashn/tryon/v1.5`, `idm-vton`, `cat-vton` (VTON); `face-swap` (digital twin); `pixelcut/background-removal`. Hardcoded fallback key at `executeVTON()` and `triggerFaceSwap()`.
- **Open-Meteo**: real-time weather by GPS coordinates.
- **BigDataCloud**: reverse geocode for city name.
- **Supabase**: Auth, Storage (`wardrobe` bucket), DB. CDN script: `@supabase/supabase-js@2`.
- **GitHub raw**: 90 web recommendation image fallbacks.

## State (all `localStorage`)

| Key | Content |
|---|---|
| `vestis_custom_wardrobe` | User-uploaded items (id > 1000000) |
| `vestis_deleted_default_items` | Deleted default item IDs (id ≤ 1000000) |
| `vestis_profile` | Digital twin: `{img, type, h, w}` |
| `vestis_outfit_log` | Try-on log entries |
| `vestis_vton_engine` | `"fashn"` or `"classic"` |
| `fal_api_key` | User's fal.ai API key |
| `vestis_favorites` | Favorite item IDs |
| `vestis_guest_credits` | Guest trial remaining count |

## Item ID ranges

- Built-in defaults: `1`–`13`
- Web recommendations: `2001`–`5059` (tops/bottoms/outerwear/shoes/accessories)
- User uploads: `> 1000000` (from `Date.now()`)

## Critical gotchas

- **No tests, lint, or typecheck** — any syntax error breaks the entire app.
- **`test.js` is NOT a test** — scratch backup of copied functions.
- **9 root `*.js` scripts** target old path `D:/johnny-D/Gemini設計/AI穿搭/` (no `-Mimo`). NOT part of the app; run manually only.
- **`getBase64()`** compresses images to max 768px at JPEG 0.8. fal.ai result URLs expire in minutes — always convert to base64 immediately.
- **Web items** are NOT in `wardrobe[]` — they live in `webBatches{}`. Use `findItemById()` (searches both) instead of `wardrobe.find()`.
- **`faceSwappedJpgUrl`** is `null` until `triggerFaceSwap()` succeeds. Reset to `null` on model switch. Do NOT overwrite with VTON results.
- **`sideSwappedJpgUrl`** is `null` until `triggerFaceSwap()` succeeds. It is stored separately for side-by-side preview.
- **On Vercel**, localStorage persists per browser but no server-side relay exists. Gemini auto-synthesis (local relay endpoints) and `list_models` API will NOT work. Model images load from hardcoded array.
- **Gemini cloud channel (`gemini_payloads`)**: New `session_id`-keyed Supabase table lets GUESTS and logged-in users exchange payload/result on Vercel (no localhost relay, no `window.opener` dependency). `triggerGeminiQuickSynth` writes `gemini_payloads` + passes `session_id` in the Gemini URL whenever `supabaseClient` exists; `startResultPolling(sessionId)` polls it; userscript v2.5 reads/patch-es it. Legacy `gemini_sessions` (user_id keyed) still supported as fallback.
- **Chinese-character paths** (`穿搭照片/`, `web_images/`) must be `encodeURIComponent`-encoded when constructing URLs on Vercel. Handled in `getBase64()`, `initRandomModel()`, `updateModelDisplay()`.
- **`switchSidebarTab('account')`** requires a defined case in the switch statement (was missing, causing silent no-op on member tab click and credit-exhaustion redirect).
- **`mobileNav('account')`** similarly requires a defined switch case.
- **`handleEmailSignIn()` / `handleEmailSignUp()`** must guard `supabaseClient` null (CDN may fail) — missing check crashes auth.
- **`showToast(msg, severity)`** accepts `severity = 'error' | 'warning'` for colored toasts. Do not create ad-hoc toast divs.
- **`analyzeStyles()`** is debounced (150ms) in `wearItem()`/`clearItem()` but synchronous in `randomize()`.
- **Trash zone** deletes both custom uploads (id > 1000000) and defaults (id ≤ 1000000). Web items in `webBatches{}` are protected.
- **`clearItemSilent(cat)`** clears model viewer overlay silently. Always follow with `updateCancelButtonsVisibility()` + `analyzeStyles()`.
- **`mergeOutfitCanvas()`** uses 52% split line with 6% feathering. Requires `crossOrigin="Anonymous"` — wrap API results with `getBase64()` first.
- **Gemini userscript (`v2.5`)** uses `&vestis=1` URL param as safety marker. Without it, the script exits immediately to avoid interfering with manual Gemini use.
- **Userscript versioning**: `@version` drives Tampermonkey auto-update (`@updateURL`/`@downloadURL` → raw GitHub, works because repo is public). ALWAYS bump `@version` when editing the userscript, then commit+push; also update the on-screen title `🧬 VESTIS AI 助手 vX.Y` (~line 130).
- **Supabase DB direct access**: project `ncxzvbsrsiabcfjufpob` lives on pooler cluster `aws-1-ap-northeast-1.pooler.supabase.com` (port 6543, user `postgres.<ref>`) — NOT the documented default `aws-0-*`; `db.<ref>.supabase.co` does not resolve (IPv6-only). Edge function `vton-proxy` source lives in `supabase/functions/`.
- **Supabase**: Storage bucket named `wardrobe` (case-sensitive, public) must exist. CDN URL must be `@supabase/supabase-js@2` (not `@supabase/supabaseClient-js@2`). Global variable must be `supabaseClient` (not `supabase`) to avoid redeclaration conflict with `window.supabase`.
- **`modelFiles` array**: Hardcoded default female model list contains exactly 51 files. Ensure all items in the array exist in `穿搭照片/女模特兒/` to prevent broken switcher images.
- **`startVTON()` fallback base model**: When `hasTwin` is false, always use the clean `modelFiles[currentModelIndex]` as the base image for VTON instead of `document.getElementById('base-model').src` (which contains previously fused clothes).