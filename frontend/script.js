 document.addEventListener("DOMContentLoaded", () => {
  const chatBox = document.getElementById("chat-box");
  const input = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");
  const toggleBtn = document.getElementById("theme-toggle");

  toggleBtn.onclick = () => {
    document.body.classList.toggle("dark");
    toggleBtn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
  };

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
    }
    catch (error) {
      console.error("Error sending message:", error);
    }
  }

  function addMessage(text, sender) {
    const new_user_msg_div = document.createElement("div");
    new_user_msg_div.className = `message ${sender}`;
    new_user_msg_div.textContent = text;
    chatBox.appendChild(new_user_msg_div);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function typeBotMessage(text) {
    const new_bot_msg_div = document.createElement("div");
    new_bot_msg_div.className = "message bot";
    new_bot_msg_div.style.whiteSpace = "pre-wrap";
    new_bot_msg_div.textContent = text;
    chatBox.appendChild(new_bot_msg_div);
  }

  sendBtn.onclick = sendMessage;

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); 
      sendMessage();
    }
  });
});

