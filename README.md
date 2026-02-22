# AI Chatbot with Multi-Modal Support 🤖

A powerful AI chatbot that supports text, images, videos, and documents (PDF, Word, PowerPoint). Built with Flask backend and vanilla JavaScript frontend.

## ✨ Features

- 💬 **Text Chat**: Natural conversations with AI
- 🖼️ **Image Analysis**: Upload and analyze images
- 🎬 **Video Understanding**: Extract frames and summarize video content
- 📄 **Document Processing**: Read and answer questions from PDFs, Word docs, PowerPoint presentations
- 🎤 **Voice Input**: Speech-to-text for hands-free interaction
- 🔊 **Text-to-Speech**: Listen to AI responses
- 🌓 **Dark/Light Theme**: Toggle between themes
- ⚡ **Fast Responses**: Powered by Groq API (free and fast!)

## 🚀 Deployment Options

### Option 1: Free Cloud Deployment (Recommended for Public Use)
- **Frontend**: GitHub Pages (free)
- **Backend**: Render.com (free tier)
- **AI**: Groq API (free, very fast)
- ✅ **No installation needed** - Anyone can use it!

### Option 2: Local Development
- Run everything on your computer
- Supports Ollama for local AI models
- Supports image/video analysis with llava model

---

## 📦 Quick Start - Cloud Deployment

### Step 1: Get a Free Groq API Key

1. Visit [https://console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Go to API Keys section
4. Create a new API key and copy it

### Step 2: Fork & Clone Repository

```bash
# Fork this repository on GitHub (click Fork button)
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/AIChatbot.git
cd AIChatbot
```

### Step 3: Deploy Backend to Render

1. **Create Render Account**: Go to [render.com](https://render.com) and sign up
2. **New Web Service**: Click "New +" → "Web Service"
3. **Connect Repository**: Connect your GitHub account and select your forked repo
4. **Configure Service**:
   - **Name**: `ai-chatbot-backend` (or your choice)
   - **Environment**: `Python`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && gunicorn app:app`
   - **Instance Type**: `Free`

5. **Add Environment Variables**:
   - Click "Environment" tab
   - Add these variables:
     - `API_PROVIDER` = `groq`
     - `GROQ_API_KEY` = `your_groq_api_key_here` (from Step 1)
     - `GROQ_MODEL` = `llama-3.3-70b-versatile`

6. **Deploy**: Click "Create Web Service"
7. **Copy URL**: Once deployed, copy your backend URL (e.g., `https://ai-chatbot-backend.onrender.com`)

### Step 4: Configure Frontend

1. Edit `frontend/config.js`:
   ```javascript
   const CONFIG = {
     API_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
       ? 'http://127.0.0.1:5000'
       : 'https://YOUR-BACKEND-URL.onrender.com'  // Replace with your Render URL
   };
   ```

2. Commit and push:
   ```bash
   git add .
   git commit -m "Configure backend URL"
   git push origin main
   ```

### Step 5: Deploy Frontend to GitHub Pages

1. **Go to Repository Settings**:
   - Click "Settings" tab in your GitHub repo
   - Scroll to "Pages" section

2. **Configure Pages**:
   - **Source**: Deploy from a branch
   - **Branch**: `main`
   - **Folder**: `/frontend`
   - Click "Save"

3. **Wait 1-2 minutes**: GitHub will build and deploy

4. **Access Your Chatbot**: Visit `https://YOUR_USERNAME.github.io/AIChatbot/`

🎉 **Done!** Your chatbot is now live and anyone can use it!

---

## 🛠️ Local Development Setup

### Prerequisites
- Python 3.8+
- Node.js (optional, for development)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy ..\.env.example .env  # Windows
# or
cp ../.env.example .env    # Mac/Linux

# Edit .env and add your GROQ_API_KEY

# Run the server
python app.py
```

Backend will run on `http://127.0.0.1:5000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Open index.html in your browser
# Or use a simple HTTP server:
python -m http.server 8000
```

Visit `http://localhost:8000` in your browser.

---

## 🔧 Configuration Options

### Using Ollama (Local AI)

If you want to use Ollama for local AI with image/video support:

1. Install [Ollama](https://ollama.ai)
2. Pull llava model: `ollama pull llava`
3. Update `.env`:
   ```
   API_PROVIDER=ollama
   OLLAMA_HOST=http://127.0.0.1:11434
   OLLAMA_MODEL=llava
   ```
4. Restart backend

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `API_PROVIDER` | AI provider: `groq` or `ollama` | `groq` |
| `GROQ_API_KEY` | Your Groq API key | Required for Groq |
| `GROQ_MODEL` | Groq model name | `llama-3.3-70b-versatile` |
| `OLLAMA_HOST` | Ollama server URL | `http://127.0.0.1:11434` |
| `OLLAMA_MODEL` | Ollama model name | `llava` |

---

## 📝 Usage Notes

### With Groq (Cloud Deployment)
- ✅ Fast text responses
- ✅ Document processing (PDF, Word, PowerPoint)
- ❌ Image/video analysis not supported (text models only)

### With Ollama (Local)
- ✅ Full multi-modal support (text, images, videos)
- ✅ Complete privacy (runs offline)
- ⚠️ Requires local installation and resources

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

---

## 📄 License

MIT License - feel free to use this project however you like!

---

## 🆘 Troubleshooting

### Backend Issues
- **Error connecting to backend**: Check if backend is running and URL is correct
- **CORS errors**: Make sure CORS is enabled in backend
- **Groq API errors**: Verify your API key is correct

### Frontend Issues
- **Can't connect**: Check `config.js` has correct backend URL
- **File upload not working**: Check file size (max 200MB)

### Render Free Tier Limitations
- Service spins down after 15 minutes of inactivity
- First request after idle may take 30-60 seconds
- 750 hours/month free (enough for personal projects)

---

## 🌟 Acknowledgments

- [Groq](https://groq.com) for fast, free AI API
- [Ollama](https://ollama.ai) for local AI models
- [Render](https://render.com) for free backend hosting
- [GitHub Pages](https://pages.github.com) for free frontend hosting

---

**Made with ❤️ - Free to use for everyone!**
