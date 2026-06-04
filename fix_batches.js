
const fs = require("fs");
const file = "D:/johnny-D/Gemini設計/AI穿搭/ai_outfit_prototype.html";
let content = fs.readFileSync(file, "utf8");

const startIdx = content.indexOf("const webBatches = {");
const endStr = "function getWebItems(cat) {";
const endIdx = content.indexOf(endStr);

if (startIdx === -1 || endIdx === -1) {
    console.error("Could not find boundaries!");
    process.exit(1);
}

const topIds = ["00003aeb-ace5-43bf-9a0c-dc31a03e9cd2.jpg","00805d0e-7fe5-4251-b577-86065e4f6587.jpg","00d9cc6e-2564-4813-9d68-4bc4d562107b.jpg","0144d8a2-0d3b-4bee-b137-324129e746a8.jpg","01ace8a7-7621-478e-af83-cd4fac4cb157.jpg","01d1fed7-996d-496b-b3ae-73ab724f29cc.jpg","0285f2a0-ff21-43de-9762-6454faa5eef8.jpg","02ef828a-a7d5-4475-bf44-3907b3a977ff.jpg","03103065-f445-44a5-b707-53b73534f57d.jpg","0373fc11-3fca-4b92-8ae5-e208d53135a0.jpg","0386a2d3-d7c2-42d4-b348-2525e6659743.jpg","0406b620-a3a1-4de2-8b4d-747c8bcbd57a.jpg","0422c599-712c-47c9-b8eb-70dd2c9759cc.jpg","04520051-6197-4561-a721-8e73c0d4116a.jpg","0486260d-9355-4958-a7c8-1e672ef27a16.jpg","0528632c-f54d-4511-bf2b-632bd5da2ad9.jpg","061b697e-086b-48c9-80db-9ecb9b82c64b.jpg","0637d9a1-60fa-4b26-86db-f2511a17db62.jpg","06a5caaa-f9db-45a1-9bc1-e3e1c525a216.jpg","06e4b3cf-bb53-482a-98e3-a4cc0f470b2d.jpg","0702f1cb-0096-491e-9267-ee4f3c331fe6.jpg","07349830-408d-42b7-baeb-35ad9a21c6bf.jpg","07384634-05b2-4eae-8251-794855910d46.jpg","074e0101-337d-404e-9288-44902cc0f0b9.jpg","075a38a7-674a-4382-a1d6-6316edc1cf3b.jpg","07928474-c6fe-415f-9cb0-6418e497ce56.jpg","07adbe68-f902-4819-8a74-420cf4745253.jpg","07de80f6-00a3-40eb-8eb4-17890f75c08f.jpg","0809f68f-44bf-4eb4-bf09-dd50446f96cf.jpg","0881dd9e-aa51-456a-a623-287a93894224.jpg"];
const botIds = ["0098b991-e36e-4ef1-b5ee-4154b21e2a92.jpg","027c81f2-c6e1-498a-8f69-823ce631438e.jpg","030a5708-f6d7-441f-86ee-0b51b33f3f51.jpg","03383314-4e34-4604-8ba0-f5d75371204f.jpg","03a43dea-405e-4a11-9716-2f790a95f699.jpg","03b5fa92-c65d-4b45-820b-967e85f41ee2.jpg","041cea74-d96a-45ff-a8e2-d311ee0f21d8.jpg","05e280ef-53d9-497f-be09-e83c549f0a14.jpg","062752a8-2cbd-434f-b850-4a4f85c32cb3.jpg","06697086-d232-4c13-a5ea-ebd759b53bc6.jpg","08973288-3d8b-4c07-9f2d-ce1392da54be.jpg","08f602bc-a030-4f73-b0fb-0ddd986840aa.jpg","0982f691-f2ce-469b-b81e-6842b914632c.jpg","09cd286c-0fab-45b9-9152-322f32275ef7.jpg","0a7e5fe0-d592-40e6-b9b8-75aac9a2d685.jpg","0ad5bfb5-0f2b-4396-8c05-39ca0a9a2960.jpg","0c224954-0e0f-4caa-82c8-cf9581e89336.jpg","0c2eb9ff-7f26-492d-9957-0d845669685f.jpg","0c99f0b4-3a0d-4d24-bfdd-e9e98914892c.jpg","0ccc318a-7d69-4d7f-a442-aac1f88bc453.jpg","0db5a848-2066-436f-bd21-8b3585b391a5.jpg","0e27351a-13d0-41a6-b731-4090b368d656.jpg","0e3d71f8-7677-4cd4-ba24-4788c3890ac1.jpg","0e684087-83bf-4153-90f4-6f7ba6f25338.jpg","0fe5eeb6-316f-4f60-b604-8a1b25e23433.jpg","1015f2a4-265d-4d43-b697-17c5735cf46d.jpg","1042a9df-2411-4f6c-b156-1d0d94e2f6ed.jpg","10f4ac8d-9d8d-4a59-88dc-5e085d61aa48.jpg","10fb1c4a-a2ab-4f43-848e-d8a1a41dff8c.jpg","119518b0-abfc-49a1-88dc-016f2dbd17ff.jpg"];
const outIds = ["00149032-3dd6-426e-9bc0-d53032536a42.jpg","00208c77-ee58-4b63-bc1a-b9b3aa4f1be0.jpg","01420fed-89b3-4801-9d91-af5507322fa3.jpg","01e42413-5514-46d0-8e44-8060d5410dee.jpg","025b653a-8b58-44e8-a40a-1ec259ed0441.jpg","05a71d78-84e9-46b5-bfd8-e30b22a84320.jpg","091f88df-2b5e-4779-941b-bec945e96d9f.jpg","0976f46d-d278-4f99-9929-418e60d42d3d.jpg","097b9af0-483a-4b41-991c-3468877db077.jpg","0c6f89cd-30f6-4b44-bda5-0ba8d90e6717.jpg","0cb3a527-be77-4ba9-9430-c097a45d4db5.jpg","0d047b70-c53a-463d-946f-c8758c2af391.jpg","12905752-4891-4593-bec1-7b0fa8db00f4.jpg","12e39792-ffb7-4b21-b62e-842a4cc9f2f3.jpg","12f9e1b9-6ef2-4d56-b91f-4a068a6e1a96.jpg","14ca9980-a105-41be-adbd-ac337db9b829.jpg","14f765fd-d3f6-4c9f-8f91-df9562102171.jpg","1604e827-c957-4677-a63f-180f3279d766.jpg","172a91db-cadc-4c64-85bb-4ac704ea686d.jpg","18ed7f47-b091-4eb0-ae81-89f2ef139a9b.jpg","1b2ace0a-382e-4b87-8e9d-35cbcfac636b.jpg","1c8e4388-c6db-42d7-9f9d-3311b1f9204d.jpg","1c9f16a4-85cf-4c4a-ae3c-52f14270128d.jpg","1ca6b60f-add8-4cb6-a51f-168fffd27992.jpg","1d419bc1-c0a7-40b3-b0c3-c36bc62a0f47.jpg","1fe43e89-0e78-4667-881b-3feb27a63ce3.jpg","2026abeb-26d8-4607-93a3-cd1cdf850616.jpg","2057e208-3431-4fc7-91e6-b1b5dee502fb.jpg","21c78c7e-a927-49ea-94d4-9ceeaa847bb2.jpg","22010881-1ce3-4244-91de-e32574240a3e.jpg"];

const sources = ["質感男裝", "極簡風格", "街頭選物"];
const topNames = ["重磅純棉寬版 T 恤", "涼感親膚短袖上衣", "復古印花短袖 T 恤", "法蘭絨長袖襯衫", "亞麻混紡休閒襯衫", "寬鬆版型大學 T", "日系條紋五分袖", "簡約立領長袖上衣", "水洗做舊休閒 T 恤", "機能透氣短袖 POLO", "雙口袋工裝襯衫", "網眼透氣短袖", "街頭塗鴉T恤", "針織短袖POLO衫", "寬版純棉背心", "厚磅連帽上衣", "素色百搭短袖", "休閒條紋襯衫", "機能排汗上衣", "撞色領T恤", "水洗棉質長袖T", "刺繡LOGO短袖", "重磅落肩T恤", "日系棉麻襯衫", "透氣涼感背心", "純棉圓領長袖", "休閒寬鬆POLO", "復古條紋短袖", "立體剪裁T恤", "簡約素色帽T"];
const botNames = ["直筒修身牛仔褲", "錐形休閒長褲", "機能防潑水短褲", "日系寬版繭型褲", "棉麻休閒短褲", "工作風多口袋長褲", "抽繩鬆緊休閒褲", "彈性九分西裝褲", "重磅棉質短褲", "復古水洗直筒牛仔褲", "燈芯絨寬褲", "機能防曬薄長褲", "多口袋工裝短褲", "休閒束口褲", "素色西裝短褲", "日系修身工作褲", "寬版直筒褲", "水洗牛仔短褲", "透氣運動長褲", "棉質抽繩短褲", "復古刷色牛仔褲", "極簡修身休閒褲", "彈性修身九分褲", "工裝休閒短褲", "亞麻混紡長褲", "針織休閒長褲", "街頭風寬褲", "涼感抽繩短褲", "重磅斜紋長褲", "休閒彈性短褲"];
const outNames = ["防風機能連帽外套", "輕量防潑水夾克", "燈芯絨休閒外套", "復古牛仔外套", "雙排扣長版大衣", "極簡西裝外套", "保暖鋪棉飛行夾克", "日系工裝背心", "機能軟殼外套", "立領防風短大衣", "多口袋工裝外套", "休閒教練外套", "羊毛混紡大衣", "翻領休閒夾克", "防風抗UV薄外套", "復古燈芯絨背心", "重磅單寧外套", "軍風M65外套", "保暖搖粒絨外套", "防水連帽夾克", "日系寬版西裝外套", "工裝多口袋背心", "休閒棒球外套", "輕薄透氣防曬外套", "水洗做舊牛仔外套", "極簡立領夾克", "厚磅連帽大衣", "街頭風教練夾克", "保暖鋪棉背心", "休閒防風短版外套"];

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
            let globalIndex = b * 10 + i;
            let idNum = c.prefix * 1000 + globalIndex + 1;
            let name = c.names[globalIndex];
            let price = "NT$" + (Math.floor(Math.random() * 10 + 5) * 100 + 90);
            let src = sources[i % 3];
            let sub = c.subtypes[i % 2];
            let img = getImg(c.url, c.ids[globalIndex]);
            let link = getLink(name);
            output += `            { id:${idNum}, cat:"${c.key}", name:"${name}", price:"${price}", source:"${src}", subtype:"${sub}", img:"${img}", link:"${link}", isExternal:true, sizeChart:${sizeChart} }${i<9?",":""}\n`;
        }
        output += `        ]${b<2?",":""}\n`;
    }
    output += `    ]}${c.key !== "outerwear" ? "," : ""}\n`;
}
output += "};\n\n        ";

let before = content.substring(0, startIdx);
let after = content.substring(endIdx);
fs.writeFileSync(file, before + output + after, "utf8");
console.log("Batches replaced with 90 distinct items.");

