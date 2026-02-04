document.addEventListener("DOMContentLoaded", () => {
  const chatBox = document.getElementById("chat-box");
  const input = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const toggleBtn = document.getElementById("theme-toggle");

  // Dark mode toggle
  toggleBtn.onclick = () => {
    document.body.classList.toggle("dark");
    toggleBtn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
  };

  // Send message function
  async function sendMessage() {
    const message = input.value.trim();
    if (!message) return;

    addMessage(message, "user");
    input.value = "";

    try {
      const res = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      const data = await res.json();
      typeBotMessage(data.reply || "No response");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  // Add message
  function addMessage(text, sender) {
    const msg = document.createElement("div");
    msg.className = `message ${sender}`;
    msg.textContent = text;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Typing animation
  function typeBotMessage(text) {
    const msg = document.createElement("div");
    msg.className = "message bot";
    msg.style.whiteSpace = "pre-wrap";
    chatBox.appendChild(msg);

    const lines = text.split("\n");
    let i = 0;
    const interval = setInterval(() => {
      if (i < lines.length) {
        msg.innerHTML += lines[i] + "<br>";
        chatBox.scrollTop = chatBox.scrollHeight;
        i++;
      } else clearInterval(interval);
    }, 100);
  }

  // Click send button
  sendBtn.onclick = sendMessage;

  // **Enter key support (robust)**
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // prevents line break
      sendMessage();
    }
  });
});

