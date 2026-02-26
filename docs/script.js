 document.addEventListener("DOMContentLoaded", () => {
  const chatBox = document.getElementById("chat-box");
  const input = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const toggleBtn = document.getElementById("theme-toggle");
  const voiceBtn = document.getElementById("voice-btn");
  const ttsToggle = document.getElementById("tts-toggle");
  
  // File input elements
  const imageInput = document.getElementById("image-input");
  const videoInput = document.getElementById("video-input");
  const fileInput = document.getElementById("file-input");
  const mediaPreview = document.getElementById("media-preview");
  
  // Store selected files
  let selectedFiles = [];
  
  // Voice: speech-to-text and text-to-speech
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let isListening = false;
  let speakReplies = false;
  let currentUtterance = null;

  toggleBtn.onclick = () => {
    document.body.classList.toggle("dark");
    toggleBtn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
  };

  // Handle image selection
  imageInput.addEventListener("change", (e) => {
    handleFileSelection(e.target.files[0], "image");
    imageInput.value = "";
  });

  // Handle video selection
  videoInput.addEventListener("change", (e) => {
    handleFileSelection(e.target.files[0], "video");
    videoInput.value = "";
  });

  // Handle file selection
  fileInput.addEventListener("change", (e) => {
    handleFileSelection(e.target.files[0], "file");
    fileInput.value = "";
  });

  function handleFileSelection(file, type) {
    if (!file) return;
    
    selectedFiles.push({ file, type });
    addMediaPreview(file, type, selectedFiles.length - 1);
  }

  function addMediaPreview(file, type, index) {
    const mediaItem = document.createElement("div");
    mediaItem.className = "media-item";
    mediaItem.id = `media-${index}`;

    if (type === "image") {
      const reader = new FileReader();
      reader.onload = (e) => {
        mediaItem.innerHTML = `
          <img src="${e.target.result}" alt="Image preview" />
          <span class="file-name">${file.name}</span>
          <button class="remove-btn">✕</button>
        `;
        mediaItem.querySelector(".remove-btn").onclick = () => removeMedia(index);
        mediaPreview.appendChild(mediaItem);
      };
      reader.readAsDataURL(file);
    } else if (type === "video") {
      const reader = new FileReader();
      reader.onload = (e) => {
        mediaItem.innerHTML = `
          <video controls style="max-width: 80px; max-height: 80px;">
            <source src="${e.target.result}" type="${file.type}">
          </video>
          <span class="file-name">${file.name}</span>
          <button class="remove-btn">✕</button>
        `;
        mediaItem.querySelector(".remove-btn").onclick = () => removeMedia(index);
        mediaPreview.appendChild(mediaItem);
      };
      reader.readAsDataURL(file);
    } else {
      mediaItem.innerHTML = `
        <div style="font-size: 32px;">📄</div>
        <span class="file-name">${file.name}</span>
        <button class="remove-btn">✕</button>
      `;
      mediaItem.querySelector(".remove-btn").onclick = () => removeMedia(index);
      mediaPreview.appendChild(mediaItem);
    }
  }

  function removeMedia(index) {
    selectedFiles.splice(index, 1);
    document.getElementById(`media-${index}`)?.remove();
    // Re-index remaining items
    const allItems = mediaPreview.querySelectorAll(".media-item");
    allItems.forEach((item, i) => {
      item.id = `media-${i}`;
      const removeBtn = item.querySelector(".remove-btn");
      removeBtn.onclick = () => removeMedia(i);
    });
  }

  async function sendMessage() {
    const message = input.value.trim();
    const hasFiles = selectedFiles.length > 0;
    
    if (!message && !hasFiles) return;
    
    // Display user message with file info
    if (message) {
      addMessage(message, "user");
    }
    
    // Display media attachments in chat
    if (hasFiles) {
      selectedFiles.forEach(item => {
        if (item.type === "image") {
          const reader = new FileReader();
          reader.onload = (e) => {
            addMediaMessage(e.target.result, "image", item.file.name, "user");
          };
          reader.readAsDataURL(item.file);
        } else if (item.type === "video") {
          const reader = new FileReader();
          reader.onload = (e) => {
            addMediaMessage(e.target.result, "video", item.file.name, "user");
          };
          reader.readAsDataURL(item.file);
        } else {
          addMessage(`📄 ${item.file.name}`, "user");
        }
      });
    }
    
    input.value = "";

    const loaderEl = addLoaderMessage();
    try {
      const formData = new FormData();
      formData.append("message", message);
      formData.append("stream", "0");

      selectedFiles.forEach((item, index) => {
        formData.append(`file_${index}`, item.file);
      });

      const res = await fetch(`${CONFIG.API_URL}/chat`, {
        method: "POST",
        body: formData
      });

      const contentType = res.headers.get("Content-Type") || "";
      if (contentType.includes("text/event-stream") && res.ok) {
        loaderEl.remove();
        const msgEl = createStreamingBotMessage();
        let fullText = "";
        const ttsState = { spanOffset: 0, queue: [], speaking: false };
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.delta) {
                  fullText += data.delta;
                  appendStreamDelta(msgEl, data.delta);
                  if (speakReplies) tryQueueStreamingSegment(ttsState, fullText, msgEl);
                }
                if (data.done && data.reply) fullText = data.reply;
              } catch (_) {}
            }
          }
        }
        if (buffer.startsWith("data: ")) {
          try {
            const data = JSON.parse(buffer.slice(6));
            if (data.delta) {
              fullText += data.delta;
              appendStreamDelta(msgEl, data.delta);
              if (speakReplies) tryQueueStreamingSegment(ttsState, fullText, msgEl);
            }
            if (data.done && data.reply) fullText = data.reply;
          } catch (_) {}
        }
        flushStreamBuffer(msgEl);
        if (speakReplies) {
          while (msgEl.querySelectorAll(".word-span").length > (ttsState.spanOffset || 0)) {
            tryQueueStreamingSegment(ttsState, fullText, msgEl);
          }
          processStreamingTTS(ttsState, msgEl);
        }
      } else {
        loaderEl.remove();
        let data;
        try {
          data = await res.json();
        } catch (_) {
          data = {};
        }
        const replyText = res.ok
          ? (data.reply || "No response")
          : (data.message || data.error || `Error ${res.status}: ${res.statusText}`);
        const msgEl = typeBotMessage(replyText);
        if (speakReplies) speakReply(replyText, msgEl);
      }

      selectedFiles = [];
      mediaPreview.innerHTML = "";
    }
    catch (error) {
      loaderEl.remove();
      console.error("Error sending message:", error);
      const errMsg = "Error: Could not send message. Please try again.";
      const errEl = typeBotMessage(errMsg);
      if (speakReplies) speakReply(errMsg, errEl);
    }
  }

  function createStreamingBotMessage() {
    const div = document.createElement("div");
    div.className = "message bot";
    div.style.whiteSpace = "pre-wrap";
    div.style.wordBreak = "break-word";
    div._streamBuffer = "";
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
    return div;
  }

  function appendStreamDelta(msgEl, delta) {
    msgEl._streamBuffer = (msgEl._streamBuffer || "") + delta;
    let buf = msgEl._streamBuffer;
    const lastSpace = buf.lastIndexOf(" ");
    if (lastSpace === -1) return;
    const complete = buf.slice(0, lastSpace + 1);
    msgEl._streamBuffer = buf.slice(lastSpace + 1);
    const tokens = complete.split(/(\s+)/);
    tokens.forEach((t) => {
      if (/^\s+$/.test(t)) msgEl.appendChild(document.createTextNode(t));
      else {
        const span = document.createElement("span");
        span.className = "word-span";
        span.textContent = t;
        msgEl.appendChild(span);
      }
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function flushStreamBuffer(msgEl) {
    let buf = msgEl._streamBuffer || "";
    if (!buf) return;
    msgEl._streamBuffer = "";
    const tokens = buf.split(/(\s+)/);
    tokens.forEach((t) => {
      if (/^\s+$/.test(t)) msgEl.appendChild(document.createTextNode(t));
      else if (t.length) {
        const span = document.createElement("span");
        span.className = "word-span";
        span.textContent = t;
        msgEl.appendChild(span);
      }
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function tryQueueStreamingSegment(ttsState, fullText, msgEl) {
    const allSpans = msgEl.querySelectorAll(".word-span");
    const available = allSpans.length - (ttsState.spanOffset || 0);
    if (available < 1) return;
    const segmentWordCount = 1;
    const startIdx = ttsState.spanOffset;
    const endIdx = startIdx + segmentWordCount;
    const segmentSpans = Array.from(allSpans).slice(startIdx, endIdx);
    const text = segmentSpans.map((s) => s.textContent).join(" ");
    if (!text.trim()) return;
    ttsState.spanOffset = endIdx;
    ttsState.queue.push({
      text: text,
      startSpanIndex: startIdx,
      endSpanIndex: endIdx
    });
    processStreamingTTS(ttsState, msgEl);
  }

  function processStreamingTTS(ttsState, msgEl) {
    if (ttsState.speaking || ttsState.queue.length === 0) return;
    if (!("speechSynthesis" in window)) return;
    const item = ttsState.queue.shift();
    const text = (item.text || "").trim();
    if (!text) {
      processStreamingTTS(ttsState, msgEl);
      return;
    }
    ttsState.speaking = true;
    const wordSpans = msgEl.querySelectorAll(".word-span");
    const startIdx = Math.max(0, item.startSpanIndex);
    const endIdx = Math.min(wordSpans.length, item.endSpanIndex);
    const segmentSpans = Array.from(wordSpans).slice(startIdx, endIdx);
    segmentSpans.forEach((s) => s.classList.remove("highlight"));
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    let highlightInterval = null;
    let boundaryEventFired = false;
    if (segmentSpans.length === 1) {
      segmentSpans[0].classList.add("highlight");
      msgEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    } else {
      const wordBoundaries = getWordBoundaries(text);
      const startTime = Date.now();
      const estimatedDurationSec = Math.max(1, wordBoundaries.length * 0.32);
      highlightInterval = setInterval(() => {
        if (boundaryEventFired) {
          clearInterval(highlightInterval);
          return;
        }
        const elapsed = (Date.now() - startTime) / 1000;
        if (elapsed >= estimatedDurationSec || segmentSpans.length === 0) return;
        const wordIndex = Math.min(
          Math.floor((elapsed / estimatedDurationSec) * wordBoundaries.length),
          segmentSpans.length - 1
        );
        if (wordIndex >= 0) {
          segmentSpans.forEach((span, i) =>
            span.classList.toggle("highlight", i === wordIndex)
          );
          msgEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }, 100);
      utterance.onboundary = (e) => {
        if (!boundaryEventFired) {
          boundaryEventFired = true;
          if (highlightInterval) {
            clearInterval(highlightInterval);
            highlightInterval = null;
          }
        }
        if (segmentSpans.length === 0 || !wordBoundaries.length) return;
        const charIndex = typeof e.charIndex === "number" ? e.charIndex : e.charLength;
        if (charIndex == null) return;
        const wordIndex = getWordIndexAtChar(wordBoundaries, charIndex);
        if (wordIndex >= 0 && wordIndex < segmentSpans.length) {
          segmentSpans.forEach((span, i) =>
            span.classList.toggle("highlight", i === wordIndex)
          );
          msgEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      };
    }
    utterance.onend = () => {
      if (highlightInterval) clearInterval(highlightInterval);
      segmentSpans.forEach((s) => s.classList.remove("highlight"));
      ttsState.speaking = false;
      currentUtterance = null;
      processStreamingTTS(ttsState, msgEl);
    };
    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  function addLoaderMessage() {
    const loaderDiv = document.createElement("div");
    loaderDiv.className = "message bot chat-loader";
    loaderDiv.innerHTML = '<div class="loader-dots"><span></span><span></span><span></span></div>';
    chatBox.appendChild(loaderDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return loaderDiv;
  }

  function addMessage(text, sender) {
    const new_user_msg_div = document.createElement("div");
    new_user_msg_div.className = `message ${sender}`;
    new_user_msg_div.textContent = text;
    chatBox.appendChild(new_user_msg_div);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function addMediaMessage(src, type, filename, sender) {
    const mediaDiv = document.createElement("div");
    mediaDiv.className = `message ${sender} media-message`;
    
    if (type === "image") {
      const img = document.createElement("img");
      img.src = src;
      img.style.maxWidth = "300px";
      img.style.maxHeight = "300px";
      img.style.borderRadius = "10px";
      img.style.marginBottom = "8px";
      mediaDiv.appendChild(img);
    } else if (type === "video") {
      const video = document.createElement("video");
      video.src = src;
      video.controls = true;
      video.style.maxWidth = "300px";
      video.style.maxHeight = "300px";
      video.style.borderRadius = "10px";
      video.style.marginBottom = "8px";
      mediaDiv.appendChild(video);
    }
    
    const filenameSpan = document.createElement("span");
    filenameSpan.textContent = filename;
    filenameSpan.style.fontSize = "12px";
    filenameSpan.style.opacity = "0.8";
    mediaDiv.appendChild(filenameSpan);
    
    chatBox.appendChild(mediaDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function typeBotMessage(text) {
    const new_bot_msg_div = document.createElement("div");
    new_bot_msg_div.className = "message bot";
    new_bot_msg_div.style.whiteSpace = "pre-wrap";
    const parts = text.split(/(\s+)/);
    parts.forEach((part) => {
      if (/\S/.test(part)) {
        const span = document.createElement("span");
        span.className = "word-span";
        span.textContent = part;
        new_bot_msg_div.appendChild(span);
      } else {
        new_bot_msg_div.appendChild(document.createTextNode(part));
      }
    });
    chatBox.appendChild(new_bot_msg_div);
    chatBox.scrollTop = chatBox.scrollHeight;
    return new_bot_msg_div;
  }

  // --- Voice input (speech-to-text) ---
  let voiceNoSpeechRetries = 0;
  const VOICE_NO_SPEECH_MAX_RETRIES = 1;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;
    recognition.onresult = (e) => {
      const result = e.results[0];
      const transcript = result[0].transcript;
      if (result.isFinal && transcript.trim()) {
        voiceNoSpeechRetries = 0;
        input.value = transcript;
        sendMessage();
      }
    };
    recognition.onend = () => {
      isListening = false;
      voiceBtn.classList.remove("listening");
    };
    recognition.onerror = (e) => {
      if (e.error === "no-speech") {
        if (voiceNoSpeechRetries < VOICE_NO_SPEECH_MAX_RETRIES) {
          voiceNoSpeechRetries++;
          recognition.start();
          return;
        }
        voiceNoSpeechRetries = 0;
        typeBotMessage("No speech detected. Click the mic again and speak clearly.");
      } else {
        voiceNoSpeechRetries = 0;
        isListening = false;
        voiceBtn.classList.remove("listening");
        if (e.error === "not-allowed") {
          typeBotMessage("Microphone access was denied. Allow mic access to use voice input.");
        } else if (e.error !== "aborted") {
          typeBotMessage("Voice error. Try again or type your message.");
        }
      }
    };
  }

  let micPermissionRequested = false;

  voiceBtn.onclick = async () => {
    if (!recognition) {
      typeBotMessage("Voice input is not supported in this browser. Try Chrome or Edge.");
      return;
    }
    if (isListening) {
      recognition.abort();
      return;
    }
    if (!micPermissionRequested && navigator.mediaDevices?.getUserMedia) {
      micPermissionRequested = true;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      } catch (err) {
        micPermissionRequested = false;
        typeBotMessage("Microphone access was denied. Allow mic access to use voice input.");
        return;
      }
    }
    voiceNoSpeechRetries = 0;
    isListening = true;
    voiceBtn.classList.add("listening");
    recognition.start();
  };

  // --- Voice output (text-to-speech) with word highlight ---
  function getWordBoundaries(text) {
    const boundaries = [];
    const regex = /\S+/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      boundaries.push({ start: match.index, end: match.index + match[0].length });
    }
    return boundaries;
  }

  function getWordIndexAtChar(wordBoundaries, charIndex) {
    const idx = wordBoundaries.findIndex(
      (w) => charIndex >= w.start && charIndex < w.end
    );
    if (idx >= 0) return idx;
    const atEnd = wordBoundaries.findIndex((w) => w.end === charIndex);
    if (atEnd >= 0) return atEnd;
    if (charIndex === 0 && wordBoundaries.length > 0) return 0;
    return -1;
  }

  function speakReply(text, messageElement) {
    if (!text || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const wordBoundaries = getWordBoundaries(text);
    const wordSpans = messageElement ? messageElement.querySelectorAll(".word-span") : [];
    if (messageElement) {
      wordSpans.forEach((span) => span.classList.remove("highlight"));
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    const startTime = Date.now();
    const estimatedDurationSec = Math.max(1, wordBoundaries.length * 0.32);
    let boundaryEventFired = false;
    let highlightInterval = setInterval(() => {
      if (boundaryEventFired) {
        clearInterval(highlightInterval);
        return;
      }
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed >= estimatedDurationSec || wordSpans.length === 0) return;
      const wordIndex = Math.min(
        Math.floor((elapsed / estimatedDurationSec) * wordBoundaries.length),
        wordSpans.length - 1
      );
      if (wordIndex >= 0) {
        wordSpans.forEach((span, i) =>
          span.classList.toggle("highlight", i === wordIndex)
        );
        messageElement?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }, 100);
    utterance.onboundary = (e) => {
      if (!boundaryEventFired) {
        boundaryEventFired = true;
        if (highlightInterval) {
          clearInterval(highlightInterval);
          highlightInterval = null;
        }
      }
      if (wordSpans.length === 0 || wordBoundaries.length === 0) return;
      const charIndex = typeof e.charIndex === "number" ? e.charIndex : e.charLength;
      if (charIndex == null) return;
      const wordIndex = getWordIndexAtChar(wordBoundaries, charIndex);
      if (wordIndex >= 0 && wordIndex < wordSpans.length) {
        wordSpans.forEach((span, i) =>
          span.classList.toggle("highlight", i === wordIndex)
        );
        messageElement?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    };
    utterance.onend = () => {
      clearInterval(highlightInterval);
      wordSpans.forEach((span) => span.classList.remove("highlight"));
    };
    currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  ttsToggle.onclick = () => {
    speakReplies = !speakReplies;
    ttsToggle.classList.toggle("active", speakReplies);
  };

  sendBtn.onclick = sendMessage;

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); 
      sendMessage();
    }
  });
});

