# 🚀 Quick Deployment Guide - Host Your Chatbot for FREE!

## Current Status ✅
Your project is now ready for deployment! All files have been configured and committed to Git.

## Next Steps (30 minutes total)

### STEP 1: Push to GitHub (5 minutes)

1. **Create a new repository on GitHub**:
   - Go to https://github.com/new
   - Name it: `AIChatbot` (or your preferred name)
   - Make it Public
   - **Don't** initialize with README (we already have one)
   - Click "Create repository"

2. **Push your code**:
   ```powershell
   cd C:\Users\pavan\OneDrive\Documents\Pavani\Projects\AIChatbot
   
   # Add remote (replace YOUR_USERNAME with your GitHub username)
   git remote add origin https://github.com/YOUR_USERNAME/AIChatbot.git
   
   # Push code
   git branch -M main
   git push -u origin main
   ```

### STEP 2: Get Free Groq API Key (2 minutes)

1. Visit https://console.groq.com
2. Sign up with Google/GitHub
3. Go to "API Keys" section
4. Click "Create API Key"
5. Copy the key (starts with "gsk_...")
6. Save it somewhere safe!

### STEP 3: Deploy Backend to Render (10 minutes)

1. **Sign up**: Go to https://render.com and sign up with GitHub

2. **New Web Service**:
   - Click "New +" button → "Web Service"
   - Click "Connect a repository"
   - Select your `AIChatbot` repository

3. **Configure**:
   - **Name**: `ai-chatbot-backend` (or your choice)
   - **Environment**: Python 3
   - **Branch**: main
   - **Root Directory**: Leave empty
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && gunicorn app:app`
   - **Instance Type**: Free

4. **Environment Variables** (click "Advanced" → "Add Environment Variable"):
   ```
   API_PROVIDER = groq
   GROQ_API_KEY = [paste your Groq API key here]
   GROQ_MODEL = llama-3.3-70b-versatile
   ```

5. **Create Web Service** (wait 3-5 minutes for deployment)

6. **Copy your backend URL**:
   - It will look like: `https://ai-chatbot-backend-xxxx.onrender.com`
   - Save this URL!

### STEP 4: Configure Frontend (3 minutes)

1. **Edit `frontend/config.js`**:
   - Open the file
   - Replace `https://your-backend-url.onrender.com` with your actual Render URL
   - Example:
     ```javascript
     const CONFIG = {
       API_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
         ? 'http://127.0.0.1:5000'
         : 'https://ai-chatbot-backend-xxxx.onrender.com'  // Your Render URL
     };
     ```

2. **Commit and push**:
   ```powershell
   git add frontend/config.js
   git commit -m "Update backend URL for production"
   git push
   ```

### STEP 5: Deploy Frontend to GitHub Pages (5 minutes)

1. **Go to your GitHub repository** in browser

2. **Settings** → **Pages** (left sidebar)

3. **Configure**:
   - Source: "Deploy from a branch"
   - Branch: `main`
   - Folder: `/frontend`
   - Click "Save"

4. **Wait 1-2 minutes**, then refresh the page

5. **Your chatbot is live!** 🎉
   - URL: `https://YOUR_USERNAME.github.io/AIChatbot/`

### STEP 6: Test Your Deployment (5 minutes)

1. Visit your GitHub Pages URL
2. Try sending a message
3. Test file upload (documents work, images won't with Groq)
4. Share with friends!

---

## 🎯 Your Live URLs

After deployment, you'll have:
- **Frontend (Public Chatbot)**: `https://YOUR_USERNAME.github.io/AIChatbot/`
- **Backend (API)**: `https://ai-chatbot-backend-xxxx.onrender.com`

---

## ⚠️ Important Notes

### Render Free Tier
- Spins down after 15 minutes of inactivity
- First request after idle takes ~30 seconds to wake up
- 750 hours/month free (plenty for personal use)

### Groq Free Tier
- Very generous limits
- Very fast responses
- Text only (no image/video analysis)

### Custom Domain (Optional)
- You can add a custom domain to both GitHub Pages and Render
- GitHub Pages: Settings → Pages → Custom domain
- Render: Settings → Custom domains

---

## 🐛 Troubleshooting

### "Cannot connect to backend"
- Check if Render service is running (dashboard.render.com)
- Verify frontend/config.js has correct URL
- Check Render logs for errors

### "GROQ_API_KEY error"
- Verify API key in Render environment variables
- Check if key is valid at console.groq.com
- Make sure there are no extra spaces

### GitHub Pages not showing
- Wait 2-3 minutes after enabling
- Check branch is `main` and folder is `/frontend`
- Hard refresh browser (Ctrl+Shift+R)

---

## 🔄 Making Updates

Whenever you change code:
```powershell
git add .
git commit -m "Description of changes"
git push
```

- **Frontend changes**: Auto-deploy to GitHub Pages (1-2 min)
- **Backend changes**: Auto-deploy to Render (3-5 min)

---

## 📊 Monitoring

- **Render Dashboard**: https://dashboard.render.com - Check backend health, logs
- **GitHub Actions**: Repository → Actions - Check Pages deployment
- **Groq Console**: https://console.groq.com - Monitor API usage

---

## 💡 Next Steps (Optional)

- Add custom domain
- Customize chatbot name/branding
- Add more LLM models
- Implement user authentication
- Add chat history persistence

---

**Questions?** Check the [full README.md](../README.md) for detailed documentation!

**Ready to deploy?** Start with STEP 1 above! 🚀
