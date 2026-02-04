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
