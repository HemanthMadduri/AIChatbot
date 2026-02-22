// API Configuration
// For local development: http://127.0.0.1:5000
// For deployment: Replace with your deployed backend URL (e.g., https://your-app.onrender.com)

const CONFIG = {
  API_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:5000'  // Local development
    : 'https://ai-chatbot-backend-2tlo.onrender.com'  // Production backend
};
