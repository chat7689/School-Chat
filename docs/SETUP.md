# Setup Guide

This guide will walk you through setting up Block Racers Online from scratch.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Firebase Setup](#firebase-setup)
3. [Local Development](#local-development)
4. [Deployment](#deployment)
5. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)
- **Firebase CLI** - Install with `npm install -g firebase-tools`

### Accounts Needed
- [GitHub account](https://github.com/signup) (for code hosting)
- [Firebase account](https://firebase.google.com/) (for backend)

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name (e.g., "block-racers-online")
4. Disable Google Analytics (optional)
5. Click "Create Project"

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click **Email/Password**
3. Enable **Email/Password**
4. Click **Save**

### 3. Enable Realtime Database

1. Go to **Realtime Database**
2. Click **Create Database**
3. Choose location closest to your users
4. Start in **Test mode** (we'll set up rules later)
5. Click **Enable**

### 4. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to **Your apps**
3. Click **Web** (`</>` icon)
4. Register your app with a nickname
5. Copy the `firebaseConfig` object
6. Keep this window open - you'll need these values

### 5. Configure Environment Variables

1. In your project directory, copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and fill in your Firebase config values:
   ```env
   FIREBASE_API_KEY=your_api_key_here
   FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID=your_app_id
   FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

3. **IMPORTANT**: Never commit `.env` to Git! It's already in `.gitignore`.

## Local Development

### 1. Install Dependencies

```bash
# Install main dependencies
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

### 2. Deploy Firebase Rules and Functions

```bash
# Login to Firebase
firebase login

# Deploy security rules
firebase deploy --only database:rules

# Deploy Cloud Functions
firebase deploy --only functions
```

### 3. Start Development Server

```bash
npm run dev
```

Your game should now be running at `http://localhost:8080`

### 4. Using Firebase Emulators (Optional but Recommended)

Firebase Emulators let you test locally without affecting production data:

```bash
# Start all emulators
firebase emulators:start

# In another terminal, run dev server
npm run dev
```

The emulator UI will be at `http://localhost:4000`

## Deployment

### Deploy to Firebase Hosting

1. **Build the project** (when refactoring is complete):
   ```bash
   npm run build
   ```

2. **Deploy everything**:
   ```bash
   firebase deploy
   ```

3. **Deploy specific components**:
   ```bash
   # Deploy only hosting
   firebase deploy --only hosting

   # Deploy only functions
   firebase deploy --only functions

   # Deploy only database rules
   firebase deploy --only database:rules
   ```

4. Your game will be live at:
   ```
   https://your-project-id.web.app
   ```

### Custom Domain (Optional)

1. Go to **Firebase Console** > **Hosting**
2. Click **Add custom domain**
3. Follow the instructions to verify your domain
4. Update DNS records as instructed

## Troubleshooting

### "Firebase not initialized" Error

**Problem**: Firebase fails to initialize

**Solutions**:
- Check `.env` file exists and has correct values
- Verify Firebase project is active in console
- Clear browser cache and reload
- Check browser console for specific error messages

### "Permission denied" Errors

**Problem**: Database operations fail with permission errors

**Solutions**:
- Deploy security rules: `firebase deploy --only database:rules`
- Check Firebase Console > Realtime Database > Rules
- Verify you're signed in with correct account
- Check if rules were published (green checkmark in console)

### Cloud Functions Not Working

**Problem**: Server-side operations fail

**Solutions**:
- Deploy functions: `firebase deploy --only functions`
- Check function logs: `firebase functions:log`
- Verify function deployment in Firebase Console > Functions
- Check that Firebase billing is enabled (functions require Blaze plan)

### "Module not found" Errors

**Problem**: Missing dependencies

**Solutions**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Reinstall functions dependencies
cd functions
rm -rf node_modules package-lock.json
npm install
cd ..
```

### Port Already in Use

**Problem**: `localhost:8080` is already in use

**Solutions**:
```bash
# Use a different port
npx http-server -p 3000

# Or kill the process using port 8080
# On Windows:
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# On macOS/Linux:
lsof -ti:8080 | xargs kill
```

### Firebase Emulator Issues

**Problem**: Emulators won't start

**Solutions**:
- Update Firebase CLI: `npm install -g firebase-tools@latest`
- Check if Java is installed (required for emulators)
- Clear emulator data: `firebase emulators:start --clear`
- Check ports aren't in use (4000, 5001, 9000, 9099)

## Next Steps

Once setup is complete:

1. **Test the game**: Create an account and try playing
2. **Create a level**: Use the level editor to build custom levels
3. **Invite friends**: Test multiplayer features
4. **Customize**: Modify cosmetics and features
5. **Deploy**: Share your game with the world!

## Need Help?

- Check the main [README.md](../README.md)
- Review [Firebase Documentation](https://firebase.google.com/docs)
- Open an [issue on GitHub](https://github.com/chat7689/School-Chat/issues)

---

Happy building! 🚀
