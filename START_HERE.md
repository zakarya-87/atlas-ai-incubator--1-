# 🚀 SIMPLEST STARTUP GUIDE

## The Problem
- Docker builds take 20+ minutes and timeout
- npm install takes time (5-10 minutes) but is faster than Docker
- We need to install dependencies before running

## ✅ Simplest Solution

### Step 1: Install Dependencies (One-time, takes ~10 minutes)

**Open Command Prompt as Administrator and run:**

```cmd
cd C:\Users\zboud\ATLAS AI Incubator

:: Install frontend dependencies (takes ~5 min)
npm install --legacy-peer-deps

:: Install backend dependencies (takes ~5 min)
cd backend
npm install --legacy-peer-deps

:: Return to root
cd ..
```

**This is the slow part - but only needs to be done once!**

### Step 2: Start Everything (Fast!)

**After dependencies are installed, just double-click:**

```
START_SIMPLE.bat
```

Or run in Command Prompt:
```cmd
START_SIMPLE.bat
```

This will:
- ✅ Check Docker is running
- ✅ Start PostgreSQL (if not running)
- ✅ Open Backend in new window (port 3000)
- ✅ Open Frontend in new window (port 5173)
- ✅ Give you clear status messages

### Step 3: Access Your App

Wait 10-20 seconds, then open:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Database**: localhost:5432 (PostgreSQL)

## 📋 Quick Commands Reference

### Check Status:
```cmd
:: Check what's running
docker ps

:: Check ports
netstat -an | findstr :3000
netstat -an | findstr :5173
```

### Stop Everything:
```cmd
:: Close the backend and frontend windows (Ctrl+C)
:: Or run:
docker compose down
```

### Restart After Code Changes:
```cmd
:: Just close the windows and run START_SIMPLE.bat again
```

## 🔧 If Something Goes Wrong

### "npm install is slow"
- **Normal!** Takes 5-10 minutes on first install
- Only need to do it once
- Use `--legacy-peer-deps` flag to avoid peer dependency conflicts

### "Docker is not running"
1. Start Docker Desktop
2. Wait for the whale icon
3. Try again

### "Port already in use"
```cmd
:: Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

## 🎯 Summary

| What | How Long | How Often |
|------|----------|-----------|
| `npm install` | 10 minutes | **ONCE** |
| `START_SIMPLE.bat` | 10 seconds | Every time |
| Access app | Instant | After startup |

## 💡 Pro Tips

1. **After first install**, starting the app takes 10 seconds
2. **Keep the two windows open** (Backend & Frontend) - they show live logs
3. **Close with Ctrl+C** in each window when done
4. **Database persists** - your data stays even when you restart

## 🆘 Emergency Manual Start

If the batch file doesn't work, do it manually:

**Window 1 - Start Docker & Database:**
```cmd
cd C:\Users\zboud\ATLAS AI Incubator
docker compose up postgres -d
```

**Window 2 - Start Backend:**
```cmd
cd C:\Users\zboud\ATLAS AI Incubator\backend
npm run start:dev
```

**Window 3 - Start Frontend:**
```cmd
cd C:\Users\zboud\ATLAS AI Incubator
npm run dev
```

---

**Ready? Run the dependency install commands above, then double-click START_SIMPLE.bat**
