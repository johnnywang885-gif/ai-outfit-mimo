
const fs = require("fs");
const file = "D:/johnny-D/Gemini設計/AI穿搭/ai_outfit_prototype.html";
let content = fs.readFileSync(file, "utf8");

const startStr = "        function getWebItems(cat) {\r\n            const group = webBatches[cat];\r\n            if (group && group.batches[group.batchIndex]) {\r\n                return group.batches[group.batchIndex];\r\n            }\r\n            return [];\r\n        }";
const endStr = "                <div style=\"width: 100%;\">\r\n                    <div style=\"font-weight:800; font-size:1.15rem; margin-bottom:6px; color:var(--text-h);\">${item.name || \x27時尚單品\x27}</div>";

// Normalize line endings for search
const normalizedContent = content.replace(/\r\n/g, "\n");
const normStart = startStr.replace(/\r\n/g, "\n");
const normEnd = endStr.replace(/\r\n/g, "\n");

let idx1 = normalizedContent.indexOf(normStart);
let idx2 = normalizedContent.indexOf(normEnd);

if (idx1 > -1 && idx2 > -1) {
    let before = content.substring(0, content.indexOf(startStr) > -1 ? content.indexOf(startStr) + startStr.length : normalizedContent.indexOf(normStart) + normStart.length);
    let after = content.substring(content.indexOf(endStr) > -1 ? content.indexOf(endStr) : normalizedContent.indexOf(normEnd));

    const missing = `

        // ── 動態尺碼計算邏輯（基於 6 種標準版型） ──
        function getRecommendedSize(sizeChart) {
            const h = parseInt(document.getElementById("p-height")?.value) || 175;
            const w = parseInt(document.getElementById("p-weight")?.value) || 70;
            const order = ["XS","S","M","L","XL","XXL"];
            let best = "L";
            for (const sz of order) {
                const r = sizeChart[sz];
                if (!r) continue;
                if (h >= r[0] && h <= r[1] && w >= r[2] && w <= r[3]) { best = sz; break; }
                if (h <= r[1] && w <= r[3]) { best = sz; break; }
            }
            const desc = { XS:"偏嬌小體型適用", S:"纖細身形適用", M:"中等身形適用", L:"標準壯型適用", XL:"魁梧高壯適用", XXL:"大碼適用" };
            return \`✅ 推薦尺碼：<strong style="color:var(--cyan);font-size:1.1em;">\${best}</strong>（\${desc[best]}，您的身高 \${h}cm／體重 \${w}kg）\`;
        }

        function saveWardrobe() {
            const customs = wardrobe.filter(i => i.id > 1000000);
            localStorage.setItem("vestis_custom_wardrobe", JSON.stringify(customs));
        }

        function initWardrobe() {
            const saved = localStorage.getItem("vestis_custom_wardrobe");
            wardrobe = [...defaultWardrobe];
            if (saved) {
                try {
                    const customs = JSON.parse(saved);
                    wardrobe = [...customs, ...wardrobe];
                } catch(e) { console.error("Wardrobe load fail", e); }
            }
            render();
        }

        let categories = ["top", "outerwear", "bottom", "shoes", "accessory"];
        let lastClippedUrl = "", stream = null, faceStream = null, favorites = [];
        let currentTab = "top";

        function switchTab(tab) {
            currentTab = tab;
            document.querySelectorAll(".tab-btn").forEach(btn => {
                if (btn.getAttribute("data-tab") === tab) {
                    btn.classList.add("active");
                } else {
                    btn.classList.remove("active");
                }
            });
            render();
        }

        function render() {
            const container = document.getElementById("wardrobe-content");
            container.innerHTML = "";
            const catsToRender = currentTab === "all" ? ["top", "bottom", "outerwear", "shoes", "accessory"] : [currentTab];

            for (const c of catsToRender) {
                const ownItems = wardrobe.filter(i => i.cat === c && !i.isExternal);
                if (ownItems.length > 0) {
                    const ownGroup = document.createElement("div");
                    ownGroup.className = "cat-group";
                    ownGroup.innerHTML = \`<div class="cat-title">👔 個人衣櫃（\${ownItems.length} 件）</div><div class="item-grid" id="grid-own-\${c}"></div>\`;
                    container.appendChild(ownGroup);
                    const ownGrid = ownGroup.querySelector(".item-grid");
                    ownItems.forEach(item => {
                        const card = document.createElement("div");
                        card.className = "item-card";
                        card.draggable = true;
                        card.style.position = "relative";
                        card.innerHTML = \`<img src="\${item.img}">\`;
                        card.ondragstart = (e) => { e.dataTransfer.setData("text", item.id); e.dataTransfer.setData("from_grid", "true"); };
                        card.onclick = () => showItemDetail(item);
                        card.ondblclick = (e) => { e.stopPropagation(); wearItem(item); };
                        ownGrid.appendChild(card);
                    });
                    ownGrid.ondragover = e => e.preventDefault();
                    ownGrid.ondrop = e => {
                        if (e.dataTransfer.getData("from_grid")) {
                            const id = parseInt(e.dataTransfer.getData("text"));
                            const item = wardrobe.find(i => i.id === id);
                            if (item && item.cat !== c) { item.cat = c; render(); saveWardrobe(); showToast(\`移至 「\${catLabels[c]}」\`); }
                        }
                    };
                }

                if (webBatches[c]) {
                    const webItems = getWebItems(c);
                    const batchIdx = webBatches[c].batchIndex;
                    const totalBatches = webBatches[c].batches.length;

                    const webGroup = document.createElement("div");
                    webGroup.className = "cat-group";
                    
                    const headerDiv = document.createElement("div");
                    headerDiv.style.cssText = "display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;";
                    headerDiv.innerHTML = \`
                        <div class="cat-title" style="margin-bottom:0;">🌐 WEB 推薦（第 \${batchIdx+1}/\${totalBatches} 批・共 \${webItems.length} 件）</div>
                        <button onclick="rotateWebBatch(\x27\${c}\x27)" style="
                            background:linear-gradient(135deg,rgba(99,102,241,0.3),rgba(6,182,212,0.3));
                            border:1px solid rgba(99,102,241,0.5); color:#fff; border-radius:20px;
                            padding:5px 12px; font-size:0.72rem; font-weight:800; cursor:pointer;
                            letter-spacing:0.5px; white-space:nowrap; flex-shrink:0;
                            transition:all 0.2s ease;
                        " onmouseover="this.style.background=\x27linear-gradient(135deg,rgba(99,102,241,0.6),rgba(6,182,212,0.6))\x27" onmouseout="this.style.background=\x27linear-gradient(135deg,rgba(99,102,241,0.3),rgba(6,182,212,0.3))\x27"
                        >🔄 換一批</button>
                    \`;
                    webGroup.appendChild(headerDiv);

                    const srcCounts = {};
                    webItems.forEach(it => { srcCounts[it.source] = (srcCounts[it.source]||0)+1; });
                    const srcBar = document.createElement("div");
                    srcBar.style.cssText = "display:flex; gap:6px; flex-wrap:wrap; margin-bottom:8px;";
                    Object.entries(srcCounts).forEach(([src, cnt]) => {
                        const tag = document.createElement("span");
                        tag.style.cssText = "font-size:0.65rem; padding:2px 8px; border-radius:10px; background:rgba(255,255,255,0.06); color:var(--text-p); font-weight:700;";
                        tag.textContent = \`\${src} ×\${cnt}\`;
                        srcBar.appendChild(tag);
                    });
                    webGroup.appendChild(srcBar);

                    const webGrid = document.createElement("div");
                    webGrid.className = "item-grid";
                    webGrid.id = \`grid-web-\${c}\`;

                    const allWebPool = webBatches[c].batches.flat();
                    const usedIds = new Set(webItems.map(i => i.id));
                    const fallbackPool = allWebPool.filter(i => !usedIds.has(i.id));

                    function createWebCard(item, grid) {
                        const card = document.createElement("div");
                        card.className = "item-card";
                        card.style.position = "relative";
                        card.draggable = true;

                        const srcColor = "#3b82f6";
                        const srcShort = item.source.substring(0,2);
                        const subBadge = item.subtype ? \`<span style="position:absolute;top:4px;left:4px;background:rgba(0,0,0,0.7);color:#fff;font-size:8px;padding:2px 5px;border-radius:6px;font-weight:800;">\${item.subtype}</span>\` : "";

                        const img = document.createElement("img");
                        img.src = item.img;
                        img.style.cssText = "width:100%;height:100%;object-fit:cover;";
                        img.onerror = function() {
                            img.src = "";
                            img.style.display = "none";
                            const errorDiv = document.createElement("div");
                            errorDiv.style.cssText = "width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(255,255,255,0.04);padding:4px;box-sizing:border-box;";
                            errorDiv.innerHTML = \`<span style="font-size:0.55rem;color:var(--text-p);text-align:center;margin-bottom:4px;">(尚無圖片)</span><strong style="font-size:0.6rem;color:var(--text-h);text-align:center;line-height:1.2;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;">\${item.name}</strong>\`;
                            card.insertBefore(errorDiv, card.firstChild);
                            img.onerror = null;
                        };

                        card.appendChild(img);
                        card.insertAdjacentHTML("beforeend", \`
                            \${subBadge}
                            <span class="src-badge" style="position:absolute;bottom:18px;right:4px;background:\${srcColor};color:#fff;font-size:8px;padding:2px 5px;border-radius:6px;font-weight:900;">\${srcShort}</span>
                            <div style="position:absolute;bottom:0;left:0;right:0;background:rgba(6,182,212,0.92);color:#000;font-size:9px;padding:3px 0;text-align:center;font-weight:800;letter-spacing:0.5px;">🌐 WEB 推薦</div>
                        \`);
                        card._webItem = item;
                        card.ondragstart = (e) => { e.dataTransfer.setData("text", item.id); e.dataTransfer.setData("from_grid","true"); };
                        card.onclick = () => showItemDetail(card._webItem);
                        card.ondblclick = (e) => { e.stopPropagation(); wearItem(card._webItem); };
                        grid.appendChild(card);
                    }

                    webItems.forEach(item => createWebCard(item, webGrid));
                    webGroup.appendChild(webGrid);
                    container.appendChild(webGroup);
                }
            }
        }

        // --- SHOW ITEM DETAILS IN POPUP MODAL ---
        function showItemDetail(item) {
            window.currentModalItem = item;
            let html = \`<div style="display:flex; flex-direction:column; gap:1.25rem; align-items:center; text-align:center;">
                <div style="width:160px; height:180px; background:white; border-radius:18px; display:flex; align-items:center; justify-content:center; padding:10px; border:1px solid var(--glass-border); box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <img src="\${item.img}" style="max-width:100%; max-height:100%; object-fit:contain;">
                </div>
`;

    fs.writeFileSync(file, before + missing + after, "utf8");
    console.log("Restored perfectly!");
} else {
    let startTag2 = "function getWebItems(cat) {";
    let endTag2 = "<div style=\"width: 100%;\">";
    let ix1 = normalizedContent.indexOf(startTag2);
    let ix2 = normalizedContent.indexOf(endTag2);
    console.log("Failed exact match. Tried fallback:", ix1, ix2);
    if (ix1 > -1 && ix2 > -1) {
        // Fallback matching logic if spacing was different
        let before2 = content.substring(0, ix1);
        let blockStart = content.substring(ix1, content.indexOf("}", ix1) + 1); // getWebItems block
        let after2 = content.substring(ix2 - 20); // capture end
        // write to console to debug
        console.log("Will not overwrite to avoid second mess. Fix manually");
    }
}

