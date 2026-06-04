
const fs = require("fs");

const file = "D:/johnny-D/Gemini設計/AI穿搭/ai_outfit_prototype.html";
let content = fs.readFileSync(file, "utf8");

// Generate Github dataset Items
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
output += "};";

// Replace old webBatches
const startIdx = content.indexOf("const webBatches = {");
const endIdx = content.indexOf("function getRecommendedSize", startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    const before = content.substring(0, startIdx);
    const after = content.substring(endIdx);
    fs.writeFileSync(file, before + output + "\n\n        " + after, "utf8");
    console.log("Success replacing with GitHub isolated images");
} else {
    console.log("Could not find boundaries");
}

