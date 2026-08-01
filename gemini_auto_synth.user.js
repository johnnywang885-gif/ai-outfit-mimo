// ==UserScript==
// @name         VESTIS AI Gemini 穿搭合成助手自動化腳本
// @namespace    http://tampermonkey.net/
// @version      2.5
// @description  自動化上傳 VESTIS 穿搭素材與提示詞至 Gemini 網頁前端，並自動將合成圖片帶回系統！
// @author       Antigravity
// @match        https://gemini.google.com/*
// @grant        GM_xmlhttpRequest
// @connect      googleusercontent.com
// @connect      *
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    // 確保只在最頂層視窗執行，避免在交叉域廣告或登入的子框架 (iframe) 中重疊執行
    if (window.self !== window.top) {
        return;
    }

    // 檢查是否為 VESTIS 發起之自動化視窗。若非 VESTIS 發起，則直接退出不執行任何代碼，確保一般 Gemini 使用不受干擾。
    const hasVestis = window.location.search.includes('vestis') || window.location.hash.includes('vestis') || window.location.href.includes('vestis=');
    if (!hasVestis) {
        console.log("[VESTIS] 一般 Gemini 網頁，不啟動自動化腳本。");
        return;
    }

    // 1. 立即注入 CSS，隱藏 Gemini 原始的所有元件（採用不影響 JS 與排版的 opacity: 0，避免破壞自動化流程與 API 初始），並定義 VESTIS 遮罩與載入樣式
    const style = document.createElement('style');
    style.textContent = `
        /* 隱藏 Gemini 原始介面與對話框，但保持 DOM 存在以防框架 JS 引擎出錯 */
        body > :not(#vestis-full-screen-mask):not(#vestis-automation-bar) {
            opacity: 0 !important;
            pointer-events: none !important;
            transition: opacity 0.3s ease;
        }
        
        /* 全螢幕 VESTIS AI 渲染遮罩 */
        #vestis-full-screen-mask {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: #0b0f19 !important; /* 暗黑背景 */
            z-index: 2147483640 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            color: #ffffff !important;
            font-family: system-ui, -apple-system, sans-serif !important;
            gap: 25px !important;
        }

        /* 旋轉的 AI 核心動畫 */
        .vestis-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid rgba(6, 182, 212, 0.1);
            border-top-color: #06b6d4;
            border-radius: 50%;
            animation: vestis-spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
            box-shadow: 0 0 15px rgba(6, 182, 212, 0.15);
        }

        @keyframes vestis-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .vestis-mask-title {
            font-size: 16px;
            font-weight: 800;
            background: linear-gradient(135deg, #06b6d4, #0891b2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: 1px;
            margin-bottom: 5px;
        }

        .vestis-mask-status-text {
            font-size: 13px;
            color: #94a3b8;
            max-width: 80%;
            text-align: center;
            line-height: 1.6;
        }
    `;
    document.documentElement.appendChild(style);

    let bar, statusSpan, manualBtn, closeBtn, mask, maskStatusEl;

    // 建立頂部美麗的黑玻璃懸浮狀態列與遮罩，以完全遮蔽 Gemini 原始畫面
    function initUI() {
        if (document.getElementById('vestis-automation-bar')) return;

        // 修改視窗標題，防止用戶看到 "Gemini" 字樣
        document.title = "VESTIS AI Core Engine";

        // 懸浮狀態列
        bar = document.createElement('div');
        bar.id = 'vestis-automation-bar';
        bar.style.cssText = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(15, 23, 42, 0.9);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(6, 182, 212, 0.3);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), 0 0 10px rgba(6, 182, 212, 0.2);
            padding: 10px 20px;
            border-radius: 100px;
            z-index: 999999;
            display: flex;
            align-items: center;
            gap: 15px;
            font-family: system-ui, -apple-system, sans-serif;
            color: #fff;
            font-size: 13px;
            transition: all 0.3s ease;
        `;

        const titleSpan = document.createElement('span');
        titleSpan.style.cssText = 'font-weight: 800; color: #06b6d4;';
        titleSpan.textContent = '🧬 VESTIS AI 助手 v2.2';
        bar.appendChild(titleSpan);

        statusSpan = document.createElement('span');
        statusSpan.id = 'vestis-status';
        statusSpan.style.cssText = 'color: #cbd5e1;';
        statusSpan.textContent = '🔌 正在等待 VESTIS 網頁端傳遞穿搭素材...';
        bar.appendChild(statusSpan);

        manualBtn = document.createElement('button');
        manualBtn.id = 'vestis-btn-manual-get';
        manualBtn.style.cssText = `
            background: linear-gradient(135deg, #06b6d4, #0891b2);
            color: white; border: none; padding: 4px 12px;
            border-radius: 20px; cursor: pointer; font-size: 11px;
            font-weight: 700; display: none;
        `;
        manualBtn.textContent = '📥 帶回最新合成圖';
        bar.appendChild(manualBtn);

        closeBtn = document.createElement('button');
        closeBtn.id = 'vestis-btn-close';
        closeBtn.style.cssText = `
            background: transparent; color: #94a3b8; border: none;
            cursor: pointer; font-size: 14px; font-weight: 700;
        `;
        closeBtn.textContent = '✕';
        closeBtn.onclick = () => {
            bar.remove();
            if (mask) mask.remove();
        };
        bar.appendChild(closeBtn);

        // 建立全螢幕遮罩
        mask = document.createElement('div');
        mask.id = 'vestis-full-screen-mask';
        
        const spinner = document.createElement('div');
        spinner.className = 'vestis-spinner';
        mask.appendChild(spinner);

        const maskTitle = document.createElement('div');
        maskTitle.className = 'vestis-mask-title';
        maskTitle.textContent = '🧬 VESTIS AI 渲染引擎';
        mask.appendChild(maskTitle);

        maskStatusEl = document.createElement('div');
        maskStatusEl.id = 'vestis-mask-status';
        maskStatusEl.className = 'vestis-mask-status-text';
        maskStatusEl.textContent = '🔌 正在等待 VESTIS 網頁端傳遞穿搭素材...';
        mask.appendChild(maskStatusEl);

        document.body.prepend(mask);
        document.body.appendChild(bar);
    }

    function updateStatus(text, color = '#cbd5e1') {
        if (statusSpan) {
            statusSpan.innerText = text;
            statusSpan.style.color = color;
        }
        if (maskStatusEl) {
            maskStatusEl.innerText = text;
            maskStatusEl.style.color = color;
        }
    }

    // 輔助：Base64 轉 File 物件
    function base64ToFile(base64Data, filename) {
        if (!base64Data || typeof base64Data !== 'string' || !base64Data.startsWith('data:')) {
            console.error('[base64ToFile] Invalid data URL format:', base64Data ? base64Data.substring(0, 100) : 'null');
            return new File([], filename, { type: 'image/png' });
        }
        try {
            const arr = base64Data.split(',');
            const match = arr[0].match(/:(.*?);/);
            const mime = match ? match[1] : 'image/png';
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bstr.charCodeAt(n);
            }
            return new File([u8arr], filename, { type: mime });
        } catch (e) {
            console.error('[base64ToFile] Error parsing base64:', e);
            return new File([], filename, { type: 'image/png' });
        }
    }

    // 深度尋找 Shadow DOM 內部的元素
    function querySelectorDeep(selector, root = document) {
        const el = root.querySelector(selector);
        if (el) return el;
        
        const allElements = root.querySelectorAll('*');
        for (const host of allElements) {
            if (host.shadowRoot) {
                const found = querySelectorDeep(selector, host.shadowRoot);
                if (found) return found;
            }
        }
        return null;
    }

    // 尋找 Gemini 輸入框
    function findInputBox() {
        const richTextarea = document.querySelector('rich-textarea');
        if (richTextarea && richTextarea.shadowRoot) {
            const el = richTextarea.shadowRoot.querySelector('div[contenteditable="true"]') ||
                       richTextarea.shadowRoot.querySelector('.ql-editor') ||
                       richTextarea.shadowRoot.querySelector('textarea');
            if (el) return el;
        }
        return querySelectorDeep('div[contenteditable="true"]') ||
               querySelectorDeep('.ql-editor') ||
               querySelectorDeep('textarea') ||
               document.querySelector('rich-textarea div[contenteditable="true"]') ||
               document.querySelector('[contenteditable="true"]');
    }

    // 尋找圖片上傳元素
    function findFileInput() {
        const richTextarea = document.querySelector('rich-textarea');
        if (richTextarea && richTextarea.shadowRoot) {
            const el = richTextarea.shadowRoot.querySelector('input[type="file"]') ||
                       richTextarea.shadowRoot.querySelector('input[accept*="image"]');
            if (el) return el;
        }
        return querySelectorDeep('input[type="file"]') ||
               querySelectorDeep('input[accept*="image"]');
    }

    // 尋找送出按鈕
    function findSendButton() {
        const richTextarea = document.querySelector('rich-textarea');
        if (richTextarea && richTextarea.shadowRoot) {
            const el = richTextarea.shadowRoot.querySelector('button[aria-label="傳送訊息"]') ||
                       richTextarea.shadowRoot.querySelector('button[aria-label="Send message"]') ||
                       richTextarea.shadowRoot.querySelector('button.send-button');
            if (el) return el;
        }
        return querySelectorDeep('button[aria-label="傳送訊息"]') ||
               querySelectorDeep('button[aria-label="Send message"]') ||
               querySelectorDeep('button.send-button') ||
               querySelectorDeep('.send-button-container button') ||
               querySelectorDeep('button:has(gux-icon[name="send"])') ||
               querySelectorDeep('button:has(mat-icon)') ||
               querySelectorDeep('button:has(.send-icon)') ||
               querySelectorDeep('.send-icon') ||
               querySelectorDeep('rich-textarea + button') ||
               querySelectorDeep('rich-textarea ~ button');
    }

    // 輪詢等待元件載入的輔助函式
    function pollElement(findFn, timeoutMs = 20000) {
        return new Promise((resolve) => {
            const start = Date.now();
            const timer = setInterval(() => {
                const el = findFn();
                if (el) {
                    clearInterval(timer);
                    resolve(el);
                } else if (Date.now() - start > timeoutMs) {
                    clearInterval(timer);
                    resolve(null);
                }
            }, 300);
        });
    }

    // 監聽來自 VESTIS 的 postMessage 穿搭資料
    window.addEventListener("message", async (event) => {
        if (event.data && event.data.type === "VESTIS_DATA") {
            updateStatus("📥 已成功接收穿搭素材，開始執行自動合成...", "#06b6d4");
            try {
                await automateWorkflow(event.data);
            } catch (err) {
                console.error("[VESTIS Automation] Error:", err);
                updateStatus("❌ 自動填入失敗: " + err.message, "#f43f5e");
            }
        }
    });

    // 從本地伺服器讀取穿搭資料的 Fallback 函式
    function fetchPayloadFromLocalServer() {
        GM_xmlhttpRequest({
            method: "GET",
            url: "http://localhost:8000/api/get_payload",
            onload: function(response) {
                try {
                    const data = JSON.parse(response.responseText);
                    if (data && data.prompt && data.images) {
                        updateStatus("📥 從本地伺服器成功獲取資料，開始自動合成...", "#06b6d4");
                        automateWorkflow(data);
                    } else {
                        updateStatus("⚠️ 本地伺服器中沒有待處理的穿搭資料，請回 VESTIS 重新點擊。", "#eab308");
                    }
                } catch(e) {
                    updateStatus("❌ 讀取本地伺服器資料失敗: " + e.message, "#f43f5e");
                }
            },
            onerror: function(err) {
                updateStatus("❌ 連接本地伺服器失敗，請確認伺服器已開啟。", "#f43f5e");
            }
        });
    }

    // 從 Supabase 雲端資料庫讀取穿搭資料
    function fetchPayloadFromSupabase(sbUrl, sbKey, userId, sessionId) {
        updateStatus("🌐 偵測到雲端連線，正從 Supabase 載入穿搭素材...", "#3b82f6");
        const url = sessionId
            ? `${sbUrl}/rest/v1/gemini_payloads?session_id=eq.${encodeURIComponent(sessionId)}&select=*`
            : `${sbUrl}/rest/v1/gemini_sessions?user_id=eq.${userId}&select=*`;
        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            headers: {
                "apikey": sbKey,
                "Authorization": `Bearer ${sbKey}`,
                "Content-Type": "application/json"
            },
            onload: function(response) {
                try {
                    const list = JSON.parse(response.responseText);
                    const session = list?.[0];
                    if (session && session.payload) {
                        updateStatus("📥 從雲端成功獲取資料，開始自動合成...", "#06b6d4");
                        window.vestisCloud = { sbUrl, sbKey, userId, sessionId };
                        automateWorkflow(session.payload);
                    } else {
                        updateStatus("⚠️ 雲端資料庫中沒有待處理的穿搭資料，請回主頁重試。", "#eab308");
                    }
                } catch(e) {
                    updateStatus("❌ 解析雲端資料失敗: " + e.message, "#f43f5e");
                }
            },
            onerror: function(err) {
                updateStatus("❌ 連接雲端資料庫失敗，請檢查網路連線。", "#f43f5e");
            }
        });
    }

    // 初始化與 VESTIS 網頁端的連線
    async function initConnection() {
        updateStatus("⏳ 正在等待 Gemini 網頁介面完全載入...", "#eab308");
        
        // 唯獨等待輸入框載入即可 (因為圖片上傳可以改走拖曳通道，不卡死於 uploader)
        const inputEl = await pollElement(findInputBox, 20000);

        if (!inputEl) {
            updateStatus("❌ 載入逾時，找不到 Gemini 輸入框，請確認網頁完全載入並重試。", "#f43f5e");
            return;
        }

        // 優先判斷是否為雲端模式 (從 URL 參數獲取 Supabase 資訊)
        const params = new URLSearchParams(window.location.search);
        const sbUrl = params.get('sb_url');
        const sbKey = params.get('sb_key');
        const userId = params.get('user_id');
        const sessionId = params.get('session_id');

        if (sbUrl && sbKey && (userId || sessionId)) {
            fetchPayloadFromSupabase(sbUrl, sbKey, userId, sessionId);
        } else if (window.opener) {
            updateStatus("🔗 已建立視窗連接，正向 VESTIS 要求穿搭資料...", "#22c55e");
            window.opener.postMessage({ type: "GEMINI_READY" }, "*");
        } else {
            updateStatus("🌐 window.opener 為空 (COOP 限制)，正透過本地伺服器載入穿搭素材...", "#3b82f6");
            fetchPayloadFromLocalServer();
        }
    }

    // 啟動靜音音訊播放，欺騙瀏覽器該分頁正有音訊活動，從而免除 Chromium 對背景分頁的計時器與 CPU 限制 (Tab Throttling)
    let silentAudioCtx = null;
    function startSilentAudio() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            silentAudioCtx = new AudioContext();
            
            // 建立一個持續播放的極微弱振盪器，幾乎為靜音但足以讓瀏覽器標記為有音訊活動
            const osc = silentAudioCtx.createOscillator();
            const gainNode = silentAudioCtx.createGain();
            gainNode.gain.setValueAtTime(0.0001, silentAudioCtx.currentTime);
            osc.connect(gainNode);
            gainNode.connect(silentAudioCtx.destination);
            osc.start();
            console.log("[VESTIS] Background silent audio activated successfully.");
            
            if (silentAudioCtx.state === 'suspended') {
                silentAudioCtx.resume();
            }
            
            // 監聽可能的使用者點擊/鍵盤手勢，以確保能在第一時間啟用 AudioContext
            const resumeCtx = () => {
                if (silentAudioCtx && silentAudioCtx.state === 'suspended') {
                    silentAudioCtx.resume().then(() => {
                        console.log("[VESTIS] AudioContext resumed by user gesture.");
                        cleanup();
                    });
                } else {
                    cleanup();
                }
            };
            const cleanup = () => {
                window.removeEventListener('click', resumeCtx);
                window.removeEventListener('keydown', resumeCtx);
                window.removeEventListener('mousemove', resumeCtx);
            };
            window.addEventListener('click', resumeCtx);
            window.addEventListener('keydown', resumeCtx);
            window.addEventListener('mousemove', resumeCtx);
        } catch (err) {
            console.warn("[VESTIS] Background silent audio activation failed:", err);
        }
    }

    // 啟動 WebRTC 連線，藉此讓瀏覽器判定本分頁具有即時通訊活動，防止背景休眠
    function keepAliveWebRTC() {
        try {
            const pc = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
            });
            // 建立虛擬 DataChannel 觸發連線狀態
            pc.createDataChannel("vestis-keepalive");
            pc.createOffer().then(offer => pc.setLocalDescription(offer)).catch(()=>{});
            console.log("[VESTIS] Background WebRTC keep-alive activated.");
        } catch (err) {
            console.warn("[VESTIS] Background WebRTC keep-alive failed:", err);
        }
    }

    // 啟動連線初始化
    async function startApp() {
        while (!document.body) {
            await new Promise(r => setTimeout(r, 30));
        }
        initUI();
        startSilentAudio();
        keepAliveWebRTC();
        initConnection();
    }
    startApp();

    // 核心自動化流程
    async function automateWorkflow(data) {
        // 重置狀態，確保多次執行自動合成時能夠正確捕捉最新生成的圖片
        resultSent = false;
        initialResponseCount = 999;

        const { prompt, images } = data;

        // 1. 填入提示詞
        const inputBox = findInputBox();
        if (!inputBox) {
            throw new Error("找不到 Gemini 輸入框，請確認網頁已完全載入。");
        }
        inputBox.focus();
        document.execCommand('insertText', false, prompt);
        inputBox.dispatchEvent(new Event('input', { bubbles: true }));
        updateStatus("📝 提示詞已輸入...", "#a855f7");

        // 延遲 500ms 後進行圖片上傳，讓 Angular/React 框架完成狀態更新
        await new Promise(r => setTimeout(r, 500));

        // 2. 上傳所有圖片 (混和策略：優先使用 file input，否則採用雙重事件模擬：Paste 剪貼簿 + Drag/Drop 拖曳)
        const fileInput = findFileInput();
        const fileObjs = images.map(img => base64ToFile(img.src, img.filename));

        if (fileInput) {
            updateStatus("🖼️ 偵測到上傳入口，正在上傳 5 張穿搭素材...", "#eab308");
            const dt = new DataTransfer();
            for (const fileObj of fileObjs) {
                dt.items.add(fileObj);
            }
            fileInput.files = dt.files;
            fileInput.dispatchEvent(new Event('change', { bubbles: true }));
            fileInput.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
            updateStatus("🪂 未偵測到隱藏上傳入口，啟動雙重模擬拖曳/貼上上傳...", "#eab308");
            
            const dispatchUploadEvents = (target, files) => {
                if (!target) return;
                
                // A. 模擬貼上 (Paste Event)
                const cb = new DataTransfer();
                for (const f of files) cb.items.add(f);
                target.dispatchEvent(new ClipboardEvent('paste', {
                    bubbles: true,
                    cancelable: true,
                    clipboardData: cb
                }));

                // B. 模擬拖曳 (Drag/Drop Event)
                const dt = new DataTransfer();
                for (const f of files) dt.items.add(f);
                target.dispatchEvent(new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer: dt }));
                target.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: dt }));
                target.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
            };

            // 嘗試向多個潛在的目標元件派發上傳事件，實施地毯式覆蓋
            dispatchUploadEvents(inputBox, fileObjs);
            
            const richTextarea = document.querySelector('rich-textarea');
            if (richTextarea) {
                dispatchUploadEvents(richTextarea, fileObjs);
                if (richTextarea.shadowRoot) {
                    dispatchUploadEvents(richTextarea.shadowRoot.querySelector('div[contenteditable="true"]'), fileObjs);
                    dispatchUploadEvents(richTextarea.shadowRoot.querySelector('.textarea-wrapper'), fileObjs);
                    dispatchUploadEvents(richTextarea.shadowRoot.querySelector('textarea'), fileObjs);
                }
            }
            dispatchUploadEvents(document.body, fileObjs);
        }

        // 3. 等待圖片上傳完成 (多圖上傳，設為 4 秒以防漏圖)
        let secondsLeft = 4;
        const countdownInterval = setInterval(() => {
            secondsLeft--;
            if (secondsLeft > 0) {
                updateStatus(`⏳ 素材上傳中，預計 ${secondsLeft} 秒後送出...`, "#eab308");
            } else {
                clearInterval(countdownInterval);
            }
        }, 1000);

        await new Promise(r => setTimeout(r, 4000));

        // 4. 按下送出按鈕
        const existingResponses = document.querySelectorAll('model-response, .model-response, message-content, .message-content');
        initialResponseCount = existingResponses.length;
        console.log("[VESTIS Automation] Initial response count set to:", initialResponseCount);

        const sendBtn = findSendButton();
        if (sendBtn) {
            sendBtn.click();
            updateStatus("🚀 已自動送出！正在等待 Gemini 進行智慧合成穿搭...", "#3b82f6");
            
            // 通知主網頁素材與指令已成功送出，並嘗試切換焦點回主網頁
            if (window.opener) {
                try {
                    window.opener.postMessage({ type: "GEMINI_SENT" }, "*");
                    window.opener.focus();
                } catch(e) {}
            }
            
            startResultObserver();
        } else {
            updateStatus("⚠️ 未找到傳送按鈕，請手動按下 Enter 送出！", "#eab308");
            
            // 即使未找到送出按鈕也通知，讓使用者手動按
            if (window.opener) {
                try {
                    window.opener.postMessage({ type: "GEMINI_SENT" }, "*");
                    window.opener.focus();
                } catch(e) {}
            }
            
            startResultObserver();
        }
    }

    // 觀察並偵測生成的合成圖片
    function startResultObserver() {
        const manualBtn = document.getElementById('vestis-btn-manual-get');
        if (manualBtn) manualBtn.style.display = 'inline-block';

        // 點擊手動帶回按鈕時的備用邏輯
        document.getElementById('vestis-btn-manual-get').onclick = () => {
            captureAndSendResult(true);
        };

        // 自動觀察 DOM 變化
        const observer = new MutationObserver(() => {
            captureAndSendResult(false);
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    let resultSent = false;
    let initialResponseCount = 999; // 預設高值，避免在送出前誤判歷史紀錄

    // 擷取生成的最新圖片並送回
    function captureAndSendResult(isManual = false) {
        if (resultSent && !isManual) return;

        // 尋找最後一個 model-response 或 message-content 中產生的 img
        const responses = document.querySelectorAll('model-response, .model-response, message-content, .message-content');
        if (responses.length === 0) return;
        
        // 確保目前回應數量大於送出前的數量，否則代表還是舊的歷史紀錄
        if (responses.length <= initialResponseCount && !isManual) {
            return;
        }
        
        const latestResponse = responses[responses.length - 1];
        
        // 確保 Gemini 已經完成回答 (沒有正在載入或打字中)
        const isGenerating = document.querySelector('mat-progress-bar, .query-in-progress, .generating');
        if (isGenerating && !isManual) {
            return; // 仍在生成中，先不截取
        }

        const img = latestResponse.querySelector('img');
        if (!img || !img.src) return;

        // 排除非合成圖像 (例如頭像或小圖標)
        if (img.src.includes('avatar') || img.width < 100) return;

        resultSent = true;
        updateStatus("🎨 偵測到合成圖！正在安全帶回 VESTIS 系統...", "#22c55e");

        // 使用 GM_xmlhttpRequest 避開 Google CDN 的 CORS 限制
        GM_xmlhttpRequest({
            method: "GET",
            url: img.src,
            responseType: "arraybuffer",
            onload: function(response) {
                const blob = new Blob([response.response], { type: "image/png" });
                const reader = new FileReader();
                reader.onloadend = function() {
                    const base64 = reader.result;
                    
                    // 1. 同時嘗試 window.opener postMessage 發送 (雙通道備用)
                    let sentViaPostMessage = false;
                    if (window.opener) {
                        try {
                            window.opener.postMessage({ type: "VESTIS_SYNTH_RESULT", data: base64 }, "*");
                            sentViaPostMessage = true;
                        } catch(e) {}
                    }
                    
                    // 2. 依模式傳送：雲端模式寫入 Supabase，本地模式傳送至本地伺服器
                    if (window.vestisCloud) {
                        const { sbUrl, sbKey, userId, sessionId } = window.vestisCloud;
                        const patchUrl = sessionId
                            ? `${sbUrl}/rest/v1/gemini_payloads?session_id=eq.${encodeURIComponent(sessionId)}`
                            : `${sbUrl}/rest/v1/gemini_sessions?user_id=eq.${userId}`;
                        GM_xmlhttpRequest({
                            method: "PATCH",
                            url: patchUrl,
                            headers: {
                                "apikey": sbKey,
                                "Authorization": `Bearer ${sbKey}`,
                                "Content-Type": "application/json"
                            },
                            data: JSON.stringify({
                                result: base64,
                                status: "completed",
                                updated_at: new Date().toISOString()
                            }),
                            onload: function() {
                                updateStatus("🎉 合成圖已成功上傳雲端資料庫！本視窗即將自動關閉...", "#22c55e");
                                setTimeout(() => {
                                    window.close();
                                }, 2000);
                            },
                            onerror: function(err) {
                                console.error("[VESTIS Cloud] PATCH failed:", err);
                                updateStatus("⚠️ 上傳至雲端資料庫失敗，請嘗試手動右鍵複製。", "#f43f5e");
                                if (!sentViaPostMessage) {
                                    resultSent = false;
                                }
                            }
                        });
                    } else {
                        GM_xmlhttpRequest({
                            method: "POST",
                            url: "http://localhost:8000/api/store_result",
                            headers: { "Content-Type": "application/json" },
                            data: JSON.stringify({ data: base64 }),
                            onload: function() {
                                updateStatus("🎉 合成圖已成功帶回 VESTIS 系統！本視窗即將自動關閉...", "#22c55e");
                                setTimeout(() => {
                                    window.close();
                                }, 2000);
                            },
                            onerror: function() {
                                updateStatus("⚠️ 透過本地伺服器傳回失敗，請嘗試手動右鍵複製。", "#f43f5e");
                                if (!sentViaPostMessage) {
                                    resultSent = false;
                                }
                            }
                        });
                    }
                };
                reader.readAsDataURL(blob);
            },
            onerror: function(err) {
                console.error("[VESTIS Automation] Image fetch failed:", err);
                updateStatus("❌ 獲取圖片失敗，請手動右鍵複製圖片帶回系統。", "#f43f5e");
                resultSent = false; // 允許重試
            }
        });
    }
})();
