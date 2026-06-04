
const fs = require("fs");

const file = "D:/johnny-D/Gemini設計/AI穿搭/ai_outfit_prototype.html";
let content = fs.readFileSync(file, "utf8");

// Generate Unsplash Items
const topIds = ["1521572163474-6864f9cf17ab", "1583743814966-8936f5b7be1a", "1598032895344-fc06dbc30e42", "1596755095601-8b066063d80a", "1617137911636-f00de63b651d", "1588117260148-b478152c1952", "1523381210434-271e8be1f52b", "1603252109303-275144cb808f", "1576566588028-4147f3842f27", "1503342394128-c104d54dba01"];
const botIds = ["1624378439575-d10cabc07fa1", "1541099649105-f69ad21f3246", "1591195853828-11db590169c1", "1584865288642-4ce262f1c080", "1475178626620-a2608b472012", "1584865288642-4ce262f1c080", "1506629082955-520e7e174b12", "1473966968600-fa804b228f4a", "1555680202-c86f0e12f086", "1515886657613-9f3515f0bf95"];
const outIds = ["1551028719-0c15971f118f", "1520975954732-38dd512ba24e", "1591047139829-051f6920f182", "1487222477894-8943e31ef7b2", "1521223890158-5d62057d6e4b", "1495105787522-5334e320f1ce", "1509539662397-116cb90542f1", "1542272201434-20a7b4578f24", "1500454378546-d25d194514ba", "1550246140-5119ae4790b3"];

const sources = ["質感男裝", "極簡風格", "街頭選物"];
const topNames = ["重磅純棉寬版 T 恤", "涼感親膚短袖上衣", "復古印花短袖 T 恤", "法蘭絨長袖襯衫", "亞麻混紡休閒襯衫", "寬鬆版型大學 T", "日系條紋五分袖", "簡約立領長袖上衣", "水洗做舊休閒 T 恤", "機能透氣短袖 POLO"];
const botNames = ["直筒修身牛仔褲", "錐形休閒長褲", "機能防潑水短褲", "日系寬版繭型褲", "棉麻休閒短褲", "工作風多口袋長褲", "抽繩鬆緊休閒褲", "彈性九分西裝褲", "重磅棉質短褲", "復古水洗直筒牛仔褲"];
const outNames = ["防風機能連帽外套", "輕量防潑水夾克", "燈芯絨休閒外套", "復古牛仔外套", "雙排扣長版大衣", "極簡西裝外套", "保暖鋪棉飛行夾克", "日系工裝背心", "機能軟殼外套", "立領防風短大衣"];

function getLink(name) { return "https://www.google.com/search?tbm=shop&q=" + encodeURIComponent("男裝 " + name); }
function getImg(id) { return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=400&q=80`; }
const sizeChart = `{XS:[150,158,42,50],S:[155,163,48,58],M:[162,170,56,67],L:[168,177,65,77],XL:[174,183,75,88],XXL:[180,188,85,98]}`;

let output = "const webBatches = {\n";

const cats = [
    { key: "top", prefix: 2, ids: topIds, names: topNames, subtypes: ["短袖","長袖"] },
    { key: "bottom", prefix: 3, ids: botIds, names: botNames, subtypes: ["長褲","短褲"] },
    { key: "outerwear", prefix: 4, ids: outIds, names: outNames, subtypes: ["正式","休閒"] }
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
            let img = getImg(c.ids[i]);
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
    console.log("Success");
} else {
    console.log("Could not find boundaries");
}

