
const fs = require("fs");
const file = "D:/johnny-D/Gemini設計/AI穿搭/ai_outfit_prototype.html";
let content = fs.readFileSync(file, "utf8");

const missingCode = `
        // --- FILE & CAMERA UPLOAD LOGIC ---
        function triggerUpload() { document.getElementById("file-input").click(); }
        
        document.getElementById("file-input").onchange = e => {
            if(e.target.files && e.target.files[0]){
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = ev => { processImage(ev.target.result, file.name); };
                reader.readAsDataURL(file);
            }
        };

        document.getElementById("face-upload").onchange = e => {
            if(e.target.files && e.target.files[0]){
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = ev => {
                    const data = { 
                        img: ev.target.result, 
                        type: "head", 
                        w: parseInt(document.getElementById("p-weight").value), 
                        h: parseInt(document.getElementById("p-height").value) 
                    };
                    loadProfile(data);
                    localStorage.setItem("vestis_profile", JSON.stringify(data));
                    closeProfileModal();
                };
                reader.readAsDataURL(file);
            }
        };

        function processImage(dataUrl, name) {
            const item = {
                id: Date.now(),
                cat: currentTab === "all" ? "top" : currentTab,
                name: name,
                price: "私有單品",
                img: dataUrl,
                isExternal: false
            };
            wardrobe.unshift(item);
            saveWardrobe();
            render();
            showToast(\`📸 單品 \${name} 已成功加入衣櫃\`);
        }

        let stream = null;
        function openCamera() {
            document.getElementById("camera-overlay").style.display="flex";
            navigator.mediaDevices.getUserMedia({video:true}).then(s => {
                stream = s;
                document.getElementById("camera-preview").srcObject = stream;
            }).catch(err => {
                showToast("無法存取相機", "error");
                closeCamera();
            });
        }
        function closeCamera() {
            document.getElementById("camera-overlay").style.display="none";
            if(stream) { stream.getTracks().forEach(t=>t.stop()); stream=null; }
        }
        function snapCamera() {
            const video = document.getElementById("camera-preview");
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth; canvas.height = video.videoHeight;
            canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
            closeCamera();
            processImage(dataUrl, "Camera_Shot.jpg");
        }

        let faceStream = null;
        function openFaceCamera() {
            document.getElementById("face-camera-overlay").style.display="flex";
            navigator.mediaDevices.getUserMedia({video:true}).then(s => {
                faceStream = s;
                document.getElementById("face-camera-preview").srcObject = faceStream;
            }).catch(err => {
                showToast("無法存取相機", "error");
                closeFaceCamera();
            });
        }
        function closeFaceCamera() {
            document.getElementById("face-camera-overlay").style.display="none";
            if(faceStream) { faceStream.getTracks().forEach(t=>t.stop()); faceStream=null; }
        }
        function snapFaceCamera() {
            const video = document.getElementById("face-camera-preview");
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth; canvas.height = video.videoHeight;
            canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
            closeFaceCamera();
            const data = { 
                img: dataUrl, 
                type: "head", 
                w: parseInt(document.getElementById("p-weight").value), 
                h: parseInt(document.getElementById("p-height").value) 
            };
            loadProfile(data);
            localStorage.setItem("vestis_profile", JSON.stringify(data));
            closeProfileModal();
        }

        function openProfileModal() { document.getElementById("profile-modal").style.display="flex"; }
        function closeProfileModal() { document.getElementById("profile-modal").style.display="none"; }
        
        function manualFaceSwap() {
            const saved = localStorage.getItem("vestis_profile");
            if (!saved) {
                showToast("請先建立分身", "error");
                return;
            }
            const data = JSON.parse(saved);
            triggerFaceSwap(data.img, modelFiles[currentModelIndex], data.type || "head");
        }

        // --- INTERACTION GRID TRIAL & EXTERNAL DRAG ---`;

content = content.replace("// --- INTERACTION GRID TRIAL & EXTERNAL DRAG ---", missingCode);
fs.writeFileSync(file, content, "utf8");
console.log("Restored missing functions.");

