# 🚗 AUTO-EXPERT

**AI-Powered Vehicle Diagnosis Web Application**

Auto-Expert is a modern, intelligent web application that uses Google's Gemini AI to provide comprehensive vehicle diagnostics, recommendations, and maintenance tips. Built with React and Node.js, it offers a premium user experience with beautiful UI/UX design.

![Auto-Expert](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![Gemini AI](https://img.shields.io/badge/AI-Google_Gemini-4285F4?style=for-the-badge&logo=google)

## ✨ Features

- 🤖 **AI-Powered Diagnostics** - Gemini-backed diagnosis with structured, actionable results
- 📷 **Image-Assisted Diagnosis** - Optional photo upload for visual context
- 🧠 **AI Chat Assistant** - Vehicle-specific conversational troubleshooting
- 🎥 **Live AI Video Call** - Real-time audio/video guidance over WebSocket
- 🚗 **Garage Management** - Add, view, and manage multiple vehicles
- 🗓️ **Service History Logs** - Track maintenance and repair entries
- ⛽ **Fuel Logs & Efficiency** - Log fill-ups and calculate real-world efficiency
- 🧰 **Maintenance Schedule** - Status cards with service intervals and health signals
- 🚨 **Emergency Guides** - Step-by-step safety actions for common issues
- 🛒 **Parts & Product Links** - Quick access to recommended parts and kits
- 📊 **Fleet Analytics** - Totals for vehicles, mileage, and estimated spend
- 📝 **Markdown Rendering** - Rich formatting for AI analysis and repair steps
- 🎨 **Modern UI/UX** - Glassmorphism, gradients, and smooth motion
- 📱 **Responsive Design** - Optimized for desktop, tablet, and mobile
- ⚡ **Fast & Efficient** - Real-time results with loading and error states

## 🛠️ Technology Stack

**Frontend:**
- React 18.2.0
- React Markdown with GitHub Flavored Markdown
- Modern CSS with animations and transitions

**Backend:**
- Node.js with Express
- Google Generative AI (Gemini)
- CORS for cross-origin requests

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (comes with Node.js)
- A Google API Key with access to Gemini AI

## 🚀 Getting Started

### 1. Clone or Navigate to the Project

```bash
cd "c:\Users\gshre\OneDrive\Desktop\AUTO Expert\auto-expert-web"
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy the example file
copy .env.example .env
```

Then edit `.env` and add your Google API key:

```env
GOOGLE_API_KEY=your_actual_google_api_key_here
SERVER_PORT=5000
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_WS_BASE_URL=ws://localhost:5000
```

**How to get a Google API Key:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key and paste it in your `.env` file

### 4. Run the Application

**Option A: Run Frontend and Backend Concurrently (Recommended)**

```bash
npm run dev
```

This will start both the React development server (port 3000) and the Express backend (port 5000).

**Option B: Run Separately**

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm start
```

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## 📖 Usage

1. **Enter Vehicle Information:**
   - Make (e.g., Toyota)
   - Model (e.g., Corolla)
   - Year (e.g., 2015)
   - Mileage in KM (e.g., 60000)

2. **Describe the Problem:**
   - Enter a detailed description of the issue
   - List any symptoms you've observed

3. **Get Diagnosis:**
   - Click "Get Recommendations"
   - Wait for the AI to analyze the problem
   - Review the comprehensive diagnosis report

## 🏗️ Project Structure

```
auto-expert-web/
├── public/
│   ├── index.html          # HTML template with SEO meta tags
│   └── ...
├── src/
│   ├── components/
│   │   ├── DiagnosisForm.js    # Vehicle information form
│   │   └── ResultDisplay.js    # Diagnosis result display
│   ├── App.js              # Main application component
│   ├── App.css             # Application styles
│   ├── index.js            # React entry point
│   └── index.css           # Global styles
├── server.js               # Express backend server
├── package.json            # Dependencies and scripts
├── .env.example            # Environment variables template
└── README.md              # This file
```

## 🎨 Design Features

- **Gradient Backgrounds** - Vibrant purple-blue gradient scheme
- **Glassmorphism** - Modern frosted glass effect on cards
- **Smooth Animations** - Fade-in, slide-up, and hover effects
- **Responsive Grid** - Adaptive layout for all screen sizes
- **Custom Scrollbar** - Styled scrollbar matching the theme
- **Loading States** - Visual feedback during API calls
- **Error Handling** - User-friendly error messages

## 📡 API Endpoints

### `POST /api/diagnosis`

Generates vehicle diagnosis based on provided information.

**Request Body:**
```json
{
  "make": "Toyota",
  "model": "Corolla",
  "year": "2015",
  "mileage": "60000",
  "problem": "Engine makes strange noise",
  "symptoms": "Rattling sound when accelerating"
}
```

**Response:**
```json
{
  "diagnosis": "# Problem Diagnosis\n\n..."
}
```

### `GET /api/health`

Health check endpoint.

**Response:**
```json
{
  "status": "OK",
  "message": "Auto-Expert API is running"
}
```

## 🔧 Available Scripts

- `npm start` - Runs the React app in development mode
- `npm run server` - Starts the Express backend server
- `npm run dev` - Runs both frontend and backend concurrently
- `npm run build` - Builds the app for production
- `npm test` - Runs the test suite

## 🐛 Troubleshooting

**Problem: API calls fail**
- Ensure your `.env` file has a valid `GOOGLE_API_KEY`
- Check that the backend server is running on port 5000
- Verify the proxy is configured in `package.json`

**Problem: "Module not found" errors**
- Run `npm install` to ensure all dependencies are installed
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

**Problem: Port already in use**
- Change the `SERVER_PORT` in `.env` to a different number
- Or kill the process using the port

## 🚀 Deployment

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

### Deploying to Vercel/Netlify

1. Build the project: `npm run build`
2. Deploy the `build` folder
3. Configure environment variables in your hosting platform
4. Set up the backend server separately or use serverless functions

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📝 License

This project is private and confidential.

## 👨‍💻 Author

Built with ❤️ using React, Node.js, and Google Gemini AI

## 🙏 Acknowledgments

- Google Gemini AI for powerful AI capabilities
- React community for excellent documentation
- Create React App for the initial setup

---

**Need Help?** If you encounter any issues, please check the troubleshooting section or create an issue in the repository.

**Happy Diagnosing! 🚗✨**
