
const fs = require("fs");
const file = "D:/johnny-D/Gemini設計/AI穿搭/ai_outfit_prototype.html";
let content = fs.readFileSync(file, "utf8");
content = content.replace("let stream = null;", "");
content = content.replace("let faceStream = null;", "");
fs.writeFileSync(file, content, "utf8");

const jsFile = "D:/johnny-D/Gemini設計/AI穿搭/test.js";
let jsContent = fs.readFileSync(jsFile, "utf8");
jsContent = jsContent.replace("let stream = null;", "");
jsContent = jsContent.replace("let faceStream = null;", "");
fs.writeFileSync(jsFile, jsContent, "utf8");

