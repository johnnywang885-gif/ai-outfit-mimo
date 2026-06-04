
const fs = require("fs");
const content = fs.readFileSync("D:/johnny-D/Gemini設計/AI穿搭/ai_outfit_prototype.html", "utf8");
const matches = content.match(/function\s+([a-zA-Z0-9_]+)\s*\(/g);
if (matches) {
    console.log(matches.map(m => m.replace("function ", "").replace("(", "").trim()).join(", "));
}

