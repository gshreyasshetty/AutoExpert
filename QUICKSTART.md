# 🚀 Quick Start Guide

## Prerequisites
- Node.js installed
- Google API Key (get from https://makersuite.google.com/app/apikey)

## Setup (One-Time)

### Step 1: Create .env file
```bash
copy .env.example .env
```

### Step 2: Edit .env
Open `.env` and add your Google API Key:
```
GOOGLE_API_KEY=paste_your_actual_api_key_here
SERVER_PORT=5000
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_WS_BASE_URL=ws://localhost:5000
```

### Step 3: Install Dependencies (if not done)
```bash
npm install
```

## Running the App

### Option 1: Run Everything (Recommended)
```bash
npm run dev
```

This starts:
- Frontend at http://localhost:3000
- Backend at http://localhost:5000

### Option 2: Run Separately

**Terminal 1** (Backend):
```bash
npm run server
```

**Terminal 2** (Frontend):
```bash
npm start
```

## Open in Browser
Navigate to: **http://localhost:3000**

## First Use
1. Enter your vehicle details (Make, Model, Year, KM)
2. Describe the problem
3. List symptoms
4. Click "Get Recommendations"
5. Wait for AI-powered diagnosis

---

**That's it! 🎉**

For detailed documentation, see [README.md](README.md)
