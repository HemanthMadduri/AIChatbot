# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()
OLLAMA_URL = os.getenv("OLLAMA_HOST", "http://127.0.0.1:11434") + "/api/generate"
MODEL = "llama3:8b"  # Use MODEL here, not sMODEL

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Chat history
messages = [
    {"role": "system", "content": "You are a helpful AI assistant. Respond in multiple lines if possible."}
]

# -----------------------------
# Chat route
# -----------------------------
@app.route("/chat", methods=["POST"])
def chat():
    try:
        data = request.json
        if not data or "message" not in data:
            return jsonify({"error": "Message is required"}), 400

        user_message = data["message"]
        messages.append({"role": "user", "content": user_message})

        # Combine chat history into a single prompt
        prompt_text = ""
        for msg in messages:
            role = msg["role"].capitalize()
            content = msg["content"]
            prompt_text += f"{role}: {content}\n"
        prompt_text += "Assistant:"

        # Send request to Ollama
        payload = {
            "model": MODEL,
            "prompt": prompt_text,
            "temperature": 0.7,
            "max_tokens": 1024,
            "stream": False
        }

        response = requests.post(OLLAMA_URL, json=payload)
        reply = response.json().get("response", "No response from Ollama")

        # Save AI reply
        messages.append({"role": "assistant", "content": reply})

        return jsonify({"reply": reply})

    except Exception as e:
        print("Error in /chat:", e)
        return jsonify({"error": str(e)}), 500

# -----------------------------
# Run Flask app
# -----------------------------
if __name__ == "__main__":
    app.run(debug=True)

1