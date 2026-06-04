
const fs = require("fs");
const file = "D:/johnny-D/Gemini設計/AI穿搭/ai_outfit_prototype.html";
let content = fs.readFileSync(file, "utf8");

// We need to cut the file right before `const webBatches = {`
const startIdx = content.indexOf("const webBatches = {");
// And cut the file right after `<div style="width: 100%;">` inside showItemDetail
const endStr = "<div style=\"width: 100%;\">\r\n                    <div style=\"font-weight:800; font-size:1.15rem; margin-bottom:6px; color:var(--text-h);\">${item.name || \x27時尚單品\x27}</div>";
const normEndStr = endStr.replace(/\r\n/g, "\n");
const normalizedContent = content.replace(/\r\n/g, "\n");

let endIdx = content.indexOf(endStr);
if (endIdx === -1) endIdx = normalizedContent.indexOf(normEndStr);
if (endIdx !== -1) {
    endIdx += endStr.length; // Keep the div
} else {
    // try a shorter match
    const altEnd = "margin-bottom:6px; color:var(--text-h);\">${item.name || \x27時尚單品\x27}</div>";
    endIdx = content.indexOf(altEnd);
    if (endIdx !== -1) {
        endIdx += altEnd.length;
    } else {
        console.error("Could not find end index");
        process.exit(1);
    }
}

// Generate webBatches
const topIds = ["00003aeb-ace5-43bf-9a0c-dc31a03e9cd2.jpg", "00805d0e-7fe5-4251-b577-86065e4f6587.jpg", "00d9cc6e-2564-4813-9d68-4bc4d562107b.jpg", "0144d8a2-0d3b-4bee-b137-324129e746a8.jpg", "01ace8a7-7621-478e-af83-cd4fac4cb157.jpg", "01d1fed7-996d-496b-b3ae-73ab724f29cc.jpg", "0285f2a0-ff21-43de-9762-6454faa5eef8.jpg", "02ef828a-a7d5-4475-bf44-3907b3a977ff.jpg", "03103065-f445-44a5-b707-53b73534f57d.jpg", "0373fc11-3fca-4b92-8ae5-e208d53135a0.jpg"];
const botIds = ["0098b991-e36e-4ef1-b5ee-4154b21e2a92.jpg", "027c81f2-c6e1-498a-8f69-823ce631438e.jpg", "030a5708-f6d7-441f-86ee-0b51b33f3f51.jpg", "03383314-4e34-4604-8ba0-f5d75371204f.jpg", "03a43dea-405e-4a11-9716-2f790a95f699.jpg", "03b5fa92-c65d-4b45-820b-967e85f41ee2.jpg", "041cea74-d96a-45ff-a8e2-d311ee0f21d8.jpg", "05e280ef-53d9-497f-be09-e83c549f0a14.jpg", "062752a8-2cbd-434f-b850-4a4f85c32cb3.jpg", "06697086-d232-4c13-a5ea-ebd759b53bc6.jpg"];
const outIds = ["00149032-3dd6-426e-9bc0-d53032536a42.jpg", "00208c77-ee58-4b63-bc1a-b9b3aa4f1be0.jpg", "01420fed-89b3-4801-9d91-af5507322fa3.jpg", "01e42413-5514-46d0-8e44-8060d5410dee.jpg", "025b653a-8b58-44e8-a40a-1ec259ed0441.jpg", "05a71d78-84e9-46b5-bfd8-e30b22a84320.jpg", "091f88df-2b5e-4779-941b-bec945e96d9f.jpg", "0976f46d-d278-4f99-9929-418e60d42d3d.jpg", "097b9af0-483a-4b41-991c-3468877db077.jpg", "0c6f89cd-30f6-4b44-bda5-0ba8d90e6717.jpg"];

const sources = ["質感男裝", "極簡風格", "街頭選物"];
const topNames = ["重磅純棉寬版 T 恤", "涼感親膚短袖上衣", "復古印花短袖 T 恤", "法蘭絨長袖襯衫", "亞麻混紡休閒襯衫", "寬鬆版型大學 T", "日系條紋五分袖", "簡約立領長袖上衣", "水洗做舊休閒 T 恤", "機能透氣短袖 POLO"];
const botNames = ["直筒修身牛仔褲", "錐形休閒長褲", "機能防潑水短褲", "日系寬版繭型褲", "棉麻休閒短褲", "工作風多口袋長褲", "抽繩鬆緊休閒褲", "彈性九分西裝褲", "重磅棉質短褲", "復古水洗直筒牛仔褲"];
const outNames = ["防風機能連帽外套", "輕量防潑水夾克", "燈芯絨休閒外套", "復古牛仔外套", "雙排扣長版大衣", "極簡西裝外套", "保暖鋪棉飛行夾克", "日系工裝背心", "機能軟殼外套", "立領防風短大衣"];

function getLink(name) { return "https://www.google.com/search?tbm=shop&q=" + encodeURIComponent("男裝 " + name); }
function getImg(catUrl, id) { return `https://raw.githubusercontent.com/alexeygrigorev/clothing-dataset-small/master/train/${catUrl}/${id}`; }
const sizeChart = `{XS:[150,158,42,50],S:[155,163,48,58],M:[162,170,56,67],L:[168,177,65,77],XL:[174,183,75,88],XXL:[180,188,85,98]}`;

let output = "const webBatches = {\n";
const cats = [
    { key: "top", prefix: 2, ids: topIds, url: "t-shirt", names: topNames, subtypes: ["短袖","長袖"] },
    { key: "bottom", prefix: 3, ids: botIds, url: "pants", names: botNames, subtypes: ["長褲","短褲"] },
    { key: "outerwear", prefix: 4, ids: outIds, url: "outwear", names: outNames, subtypes: ["正式","休閒"] }
];
for (let c of cats) {
    output += `    ${c.key}: { batchIndex: 0, batches: [\n`;
    for (let b = 0; b < 3; b++) {
        output += `        [\n`;
        for (let i = 0; i < 10; i++) {
            let idNum = c.prefix * 1000 + (b * 10) + i + 1;
            let name = c.names[(b*3 + i) % 10];
            let price = "NT$" + (Math.floor(Math.random() * 10 + 5) * 100 + 90);
            let src = sources[i % 3];
            let sub = c.subtypes[i % 2];
            let img = getImg(c.url, c.ids[i]);
            let link = getLink(name);
            output += `            { id:${idNum}, cat:"${c.key}", name:"${name}", price:"${price}", source:"${src}", subtype:"${sub}", img:"${img}", link:"${link}", isExternal:true, sizeChart:${sizeChart} }${i<9?",":""}\n`;
        }
        output += `        ]${b<2?",":""}\n`;
    }
    output += `    ]}${c.key !== "outerwear" ? "," : ""}\n`;
}
output += "};\n";

const missing = `
        function getWebItems(cat) {
            const group = webBatches[cat];
            if (group && group.batches[group.batchIndex]) {
                return group.batches[group.batchIndex];
            }
            return [];
        }

        function rotateWebBatch(cat) {
            const group = webBatches[cat];
            if (!group) return;
            group.batchIndex = (group.batchIndex + 1) % group.batches.length;
            render(); 
            
            const toast = document.createElement("div");
            toast.textContent = \`已為您更新推薦清單 (第 \${group.batchIndex+1} 批)\`;
            toast.style.cssText = "position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:white;padding:10px 20px;border-radius:20px;z-index:9999;font-size:14px;";
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2000);
        }

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
        let currentTab = "top"; // Default to top, the user asked to fix the tab!

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

        function showItemDetail(item) {
            window.currentModalItem = item;
            let html = \`<div style="display:flex; flex-direction:column; gap:1.25rem; align-items:center; text-align:center;">
                <div style="width:160px; height:180px; background:white; border-radius:18px; display:flex; align-items:center; justify-content:center; padding:10px; border:1px solid var(--glass-border); box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    <img src="\${item.img}" style="max-width:100%; max-height:100%; object-fit:contain;">
                </div>
                <div style="width: 100%;">
                    <div style="font-weight:800; font-size:1.15rem; margin-bottom:6px; color:var(--text-h);">\${item.name || \x27時尚單品\x27}</div>\`;
`;

let before = content.substring(0, startIdx);
let after = content.substring(endIdx);
fs.writeFileSync(file, before + output + missing + after, "utf8");
console.log("Success");

