# 🚀 DEPLOY NOW - Step by Step Guide

## Pre-Deployment Checklist

Before deploying, make sure you have:
- ✅ Node.js installed (check with `node --version`)
- ✅ Firebase CLI installed (check with `firebase --version`)
- ✅ Firebase account created
- ✅ Firebase project created in Firebase Console

---

## Step 1: Install Dependencies

```bash
# Navigate to your project
cd C:\Users\malon\school-chat-repo

# Install main dependencies
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

**Expected output:** "added X packages" (no errors)

---

## Step 2: Login to Firebase

```bash
firebase login
```

This will:
1. Open your browser
2. Ask you to login with Google
3. Grant permissions to Firebase CLI

**Expected output:** "✔ Success! Logged in as your-email@example.com"

---

## Step 3: Initialize Firebase (if not already done)

```bash
firebase use --add
```

- Select your Firebase project from the list
- Give it an alias (e.g., "default" or "production")

**Expected output:** "✔ Set active project to YOUR_PROJECT"

---

## Step 4: Deploy Database Security Rules

```bash
firebase deploy --only database:rules
```

**What this does:** Locks down your database with security rules

**Expected output:**
```
✔ Deploy complete!
Database rules: deployed
```

**Time:** ~10 seconds

---

## Step 5: Deploy Cloud Functions

```bash
firebase deploy --only functions
```

**What this does:** Uploads your 6 server-side validation functions

**Expected output:**
```
✔ functions[submitTime(us-central1)]: Successful create operation.
✔ functions[awardCredits(us-central1)]: Successful create operation.
✔ functions[transferCredits(us-central1)]: Successful create operation.
✔ functions[purchaseCosmetic(us-central1)]: Successful create operation.
✔ functions[saveLevel(us-central1)]: Successful create operation.
✔ functions[getLeaderboard(us-central1)]: Successful create operation.
```

**Time:** ~2-3 minutes

**Note:** May ask you to upgrade to Blaze plan (pay-as-you-go, still has free tier)

---

## Step 6: Move HTML Files to Public Directory

```bash
# Create public directory if it doesn't exist
mkdir -p public

# Copy HTML files to public (they need to be there for hosting)
copy index.html public\
copy game.html public\
copy creator.html public\
copy console.html public\
copy times.html public\
```

**What this does:** Prepares files for Firebase Hosting

---

## Step 7: Deploy Hosting (All Website Files)

```bash
firebase deploy --only hosting
```

**What this does:** Uploads all your HTML files and makes them live

**Expected output:**
```
✔ hosting: Finished running predeploy script.
✔ hosting: 5 files uploaded.
✔ Deploy complete!

Hosting URL: https://your-project-id.web.app
```

**Time:** ~30 seconds

---

## Step 8: Verify Deployment

### Check Your Live Site

Open your browser and go to:
```
https://your-project-id.web.app
```

You should see your login page!

### Test These Features:

1. **Create an account:**
   - Click "Register"
   - Create a test account
   - Should redirect to game.html

2. **Login:**
   - Logout and login again
   - Should work smoothly

3. **Check Firebase Console:**
   - Go to https://console.firebase.google.com
   - Select your project
   - Go to "Database" → Should see your data
   - Go to "Functions" → Should see 6 functions

---

## Troubleshooting

### "Command not found: firebase"

**Solution:**
```bash
npm install -g firebase-tools
```

### "Permission denied" or "EACCES" errors

**Solution:**
```bash
# On Windows (run as Administrator)
npm install -g firebase-tools --force

# Or use npx instead:
npx firebase deploy
```

### "Firebase project not initialized"

**Solution:**
```bash
firebase init

# Select:
# - Hosting
# - Functions
# - Realtime Database
# - Use existing project
```

### "Functions require billing account"

**Solution:**
1. Go to Firebase Console
2. Click "Upgrade" to Blaze plan
3. **Don't worry:** Still has generous free tier
4. Set spending limit if desired

### "Error deploying functions"

**Solution:**
```bash
# Check Node version (should be 16+)
node --version

# Reinstall function dependencies
cd functions
rm -rf node_modules package-lock.json
npm install
cd ..

# Try again
firebase deploy --only functions
```

### Files not found

**Solution:**
```bash
# Make sure files are in public directory
ls public/

# Should see: index.html, game.html, creator.html, console.html, times.html
```

---

## What's Now Live

### ✅ **Fully Secure & Working:**
- Login page (`index.html`)
- Times history (`times.html`)
- Admin console (`console.html`)
- Firebase security rules
- 6 Cloud Functions

### ⚠️ **Working But Not Fully Updated:**
- Main game (`game.html`) - still using old config
- Level creator (`creator.html`) - still using old config

**They work fine!** Just don't have the new security system integrated yet.

---

## Post-Deployment

### Check Your URLs

Your game is now live at:
- **Main site:** `https://your-project-id.web.app`
- **Custom domain:** (if configured) `https://yourdomain.com`

### Monitor Your App

```bash
# Check function logs
firebase functions:log

# Check for errors
firebase functions:log --only submitTime

# Check real-time
firebase functions:log --only submitTime --tail
```

### Test Everything

- [ ] Create account
- [ ] Login
- [ ] Play a level
- [ ] Check times history
- [ ] Test admin console
- [ ] Check leaderboard

---

## Update Your Game Later

To update your game in the future:

```bash
# Make changes to your HTML files

# Deploy changes
firebase deploy --only hosting

# If you change functions:
firebase deploy --only functions

# If you change security rules:
firebase deploy --only database:rules

# Deploy everything at once:
firebase deploy
```

---

## Costs & Limits

### Free Tier Includes:
- **Hosting:** 10 GB storage, 360 MB/day transfer
- **Database:** 1 GB storage, 10 GB/month download
- **Functions:** 2M invocations/month, 400k GB-seconds
- **Authentication:** Unlimited users

### Your Usage Estimate:
- **Small game:** Well within free tier
- **100 active users:** Still free
- **1000+ users:** May exceed free tier slightly

### Set Spending Alert:
1. Go to Firebase Console
2. Project Settings → Usage and Billing
3. Set budget alert (e.g., $5)

---

## 🎉 Congratulations!

Your game is now LIVE and accessible to the world!

**Next steps:**
1. Share your URL with friends
2. Test all features
3. Monitor Firebase Console for usage
4. Optionally update game.html and creator.html later

**Questions?** Check:
- Firebase Console: https://console.firebase.google.com
- Firebase Docs: https://firebase.google.com/docs
- Your project docs in the `docs/` folder

---

**🚀 Your game is live! Go check it out at your Firebase URL!**
