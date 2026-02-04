import requests
import os
from dotenv import load_dotenv

load_dotenv()
LLAMA_MODEL = os.getenv("LLAMA_MODEL", "llama3:8b-instruct-q4_K_M")
OLLAMA_URL = "http://127.0.0.1:11434/api/generate"

payload = {
    "model": LLAMA_MODEL,
    "prompt": "Hello! Introduce yourself in 3 lines.",
    "stream": False
}

response = requests.post(OLLAMA_URL, json=payload)
data = response.json()
print("Full JSON from Ollama:", data)
print("AI Reply:", data.get("response"))
