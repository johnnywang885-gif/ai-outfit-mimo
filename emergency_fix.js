
const fs = require("fs");
const file = "D:/johnny-D/Gemini設計/AI穿搭/ai_outfit_prototype.html";
let content = fs.readFileSync(file, "utf8");

// 1. Fix the broken HTML string literal and missing updateCancelButtonsVisibility declaration
const brokenAnchor = `<div style="display:flex; gap:10px; width:100%;">\`;\r\n            cats.forEach(cat => {`;
const brokenAnchor2 = `<div style="display:flex; gap:10px; width:100%;">\`;\n            cats.forEach(cat => {`;

const missingChunk = `
            if (item.isExternal) {
                html += \`<a href="\${item.link}" target="_blank" class="btn-prime" style="flex:1.2; padding:10px; font-size:0.8rem; background:linear-gradient(45deg, #10b981, #059669); text-decoration:none; margin-bottom:0; display:flex; align-items:center; justify-content:center;">🛍️ 前往購買</a>\`;
            }
            
            const isFav = favorites.includes(item.id);
            html += \`<button class="btn-prime" style="flex:1; padding:10px; font-size:0.8rem; margin-bottom:0; background:\${isFav ? \x27rgba(239, 68, 68, 0.15)\x27 : \x27rgba(255,255,255,0.05)\x27}; border:\${isFav ? \x271px solid var(--danger)\x27 : \x271px solid var(--glass-border)\x27}; color:\${isFav ? \x27var(--danger)\x27 : \x27white\x27}; box-shadow:none;" onclick="toggleFavorite(\${item.id})">\${isFav ? \x27❤️ 已收藏\x27 : \x27🤍 加入收藏\x27}</button>
                    </div>
                </div>
            </div>\`;
            document.getElementById(\x27item-detail-content\x27).innerHTML = html;
            document.getElementById(\x27item-detail-overlay\x27).style.display = \x27flex\x27;
        }

        // --- 更新取消/清除按鈕的顯示狀態 ---
        function updateCancelButtonsVisibility() {
            const cats = [\x27top\x27, \x27outerwear\x27, \x27bottom\x27, \x27shoes\x27, \x27accessory\x27];
            cats.forEach(cat => {`;

if (content.includes(brokenAnchor)) {
    content = content.replace(brokenAnchor, `<div style="display:flex; gap:10px; width:100%;">\`;` + missingChunk.substring(missingChunk.indexOf("\n")));
} else if (content.includes(brokenAnchor2)) {
    content = content.replace(brokenAnchor2, `<div style="display:flex; gap:10px; width:100%;">\`;` + missingChunk.substring(missingChunk.indexOf("\n")));
} else {
    console.error("Could not find the broken chunk to restore.");
}

// 2. Fix trash.ondrop precisely
const trashOnDropRegex = /trash\.ondrop\s*=\s*e\s*=>\s*\{\s*e\.preventDefault\(\);\s*trash\.classList\.remove\(\x27drag-over\x27\);\s*if\s*\(e\.dataTransfer\.getData\(\x27from_grid\x27\)\s*===\s*\x27true\x27\)\s*\{\s*const\s*id\s*=\s*parseInt\(e\.dataTransfer\.getData\(\x27text\x27\)\);\s*let\s*item\s*=\s*wardrobe\.find\(i\s*=>\s*i\.id\s*===\s*id\);\s*if\s*\(!item\)\s*\{\s*for\s*\(const\s*cat\s*in\s*webBatches\)\s*\{\s*item\s*=\s*webBatches\[cat\]\.batches\.flat\(\)\.find\(i\s*=>\s*i\.id\s*===\s*id\);\s*if\s*\(item\)\s*break;\s*\}\s*\}\s*if\s*\(item\)\s*\{\s*wearItem\(item\);\s*\}\s*return;\s*\}/g;

const correctTrashOnDrop = `trash.ondrop = e => {
            e.preventDefault(); trash.classList.remove(\x27drag-over\x27);
            if (e.dataTransfer.getData(\x27from_grid\x27) === \x27true\x27) {
                const id = parseInt(e.dataTransfer.getData(\x27text\x27));
                const idx = wardrobe.findIndex(i => i.id === id);
                if (idx > -1 && id > 1000000) {
                    wardrobe.splice(idx, 1);
                    saveWardrobe();
                    render();
                    showToast("🗑️ 單品已從衣櫃刪除");
                } else if (id <= 1000000) {
                    showToast("⚠️ 內建單品或 Web 推薦單品無法刪除");
                }
                return;
            }`;

content = content.replace(trashOnDropRegex, correctTrashOnDrop);

fs.writeFileSync(file, content, "utf8");
console.log("Fixed!");

