# Migration Guide

This guide explains how to migrate from the old monolithic structure to the new modular architecture.

## Overview

The project has been restructured for better maintainability, security, and scalability:

**Old Structure:**
- Single monolithic HTML files with embedded JavaScript
- Firebase credentials hardcoded in HTML
- No security rules
- Client-side only logic
- No error handling

**New Structure:**
- Modular JavaScript separated by concern
- Environment-based configuration
- Comprehensive Firebase security rules
- Server-side validation via Cloud Functions
- Proper error handling and loading states

## Migration Steps

### Phase 1: Setup (✅ Complete)

1. **Project Structure** - New directories created
2. **Configuration** - `.env`, `package.json`, `firebase.json` created
3. **Security Rules** - Database rules implemented
4. **Cloud Functions** - Server-side validation added
5. **Documentation** - README, SETUP, and API docs created

### Phase 2: Code Refactoring (🔄 In Progress)

The following steps will refactor existing code into the new structure:

#### Step 1: Keep Original Files

The original HTML files (`game.html`, `creator.html`, etc.) will remain in place temporarily for reference and backward compatibility.

#### Step 2: Create New Module-Based Files

New files will be created in `src/js/` following this structure:

```
src/js/
├── core/
│   ├── config.js ✅           # Configuration management
│   ├── firebase-init.js ✅    # Firebase initialization
│   └── app.js                 # Main application entry
├── game/
│   ├── physics.js ✅          # Physics engine
│   ├── player.js              # Player controller
│   ├── renderer.js            # Canvas rendering
│   ├── level-manager.js       # Level loading/management
│   └── game-state.js          # Game state management
├── ui/
│   ├── menu.js                # Menu system
│   ├── hud.js                 # Heads-up display
│   └── modal.js               # Modal dialogs
├── multiplayer/
│   ├── party.js               # Party system
│   ├── race.js                # Race management
│   └── sync.js                # Real-time synchronization
├── admin/
│   ├── console.js             # Admin console
│   └── commands.js            # Console commands
└── utils/
    ├── validation.js ✅       # Input validation
    ├── error-handler.js ✅    # Error handling
    └── loading.js ✅          # Loading states
```

#### Step 3: Move Existing Files to Public

Once refactoring is complete:

```bash
# Move HTML files to public directory
mv *.html public/

# Update file references in HTML to use new JS modules
```

### Phase 3: Update HTML Files

Each HTML file will be updated to use the new modular JavaScript:

**Before (old monolithic style):**
```html
<script>
  const firebaseConfig = {
    apiKey: "hardcoded-key",
    // ...
  };
  firebase.initializeApp(firebaseConfig);

  // 5000+ lines of code here...
</script>
```

**After (new modular style):**
```html
<script src="/src/js/core/config.js"></script>
<script src="/src/js/core/firebase-init.js"></script>
<script src="/src/js/core/app.js"></script>
<!-- Additional modules as needed -->
<script>
  // Minimal initialization code
  (async () => {
    await config.init();
    await firebaseManager.init(config.getFirebaseConfig());
    // Start app
  })();
</script>
```

### Phase 4: Update Firebase References

All Firebase operations will use the new `firebaseManager`:

**Before:**
```javascript
const auth = firebase.auth();
const database = firebase.database();
await auth.signInWithEmailAndPassword(email, password);
```

**After:**
```javascript
await firebaseManager.signIn(email, password);
const db = firebaseManager.getDatabase();
```

### Phase 5: Update Database Operations

Database operations will use Cloud Functions for security-critical operations:

**Before (client-side only):**
```javascript
// Directly write to database - no validation!
await database.ref(`scores/${mapId}/${uid}`).set({
  username,
  time,
  timestamp
});
```

**After (server-validated):**
```javascript
// Use Cloud Function for validation
const submitTime = firebase.functions().httpsCallable('submitTime');
const result = await submitTime({ mapId, time });
```

### Phase 6: Add Error Handling

All operations will include proper error handling:

**Before:**
```javascript
// No error handling
await someOperation();
```

**After:**
```javascript
try {
  await loadingManager.withLoading(
    async () => await someOperation(),
    'Processing...',
    'operation-key'
  );
} catch (error) {
  errorHandler.log(error, { context: 'someOperation' });
  errorHandler.showUser('Operation failed. Please try again.', 'error');
}
```

## Breaking Changes

### Configuration

**Action Required:** Create `.env` file with Firebase credentials

```bash
cp .env.example .env
# Edit .env with your credentials
```

### Database Security Rules

**Action Required:** Deploy new security rules

```bash
firebase deploy --only database:rules
```

**Impact:**
- Some client-side database writes may be blocked
- Use Cloud Functions for validated operations

### Cloud Functions

**Action Required:** Deploy Cloud Functions

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

**Impact:**
- Time submissions must use `submitTime` function
- Credit operations must use server functions
- Level saves must use `saveLevel` function

## Backward Compatibility

### Temporary Compatibility Layer

During migration, a compatibility layer can be added to support old code:

```javascript
// compatibility.js
window.legacyFirebase = {
  auth: () => firebaseManager.getAuth(),
  database: () => firebaseManager.getDatabase()
};
```

### Gradual Migration

You can migrate incrementally:

1. **Week 1**: Deploy infrastructure (rules, functions, config)
2. **Week 2**: Migrate authentication and user management
3. **Week 3**: Migrate game logic and physics
4. **Week 4**: Migrate multiplayer features
5. **Week 5**: Migrate admin tools
6. **Week 6**: Final testing and cleanup

## Testing Strategy

### Before Deployment

1. **Test locally** with Firebase Emulators
   ```bash
   firebase emulators:start
   ```

2. **Verify security rules** in emulator UI

3. **Test Cloud Functions** with unit tests

4. **Manual testing** of all features

### Deployment Checklist

- [ ] Firebase security rules deployed
- [ ] Cloud Functions deployed and tested
- [ ] Environment variables configured
- [ ] Database backup created
- [ ] All features tested in staging
- [ ] User migration plan ready
- [ ] Rollback plan prepared

## Rollback Plan

If issues occur, you can rollback:

1. **Revert HTML files** to originals (kept in git history)
2. **Redeploy old rules** (if backed up)
3. **Keep functions** (backward compatible)
4. **Restore database** from backup if needed

## Post-Migration

### Cleanup

After successful migration:

```bash
# Remove old files (after backup)
mkdir old-versions
mv game.html old-versions/
mv creator.html old-versions/
# etc.

# Update documentation
# Update README with new structure
```

### Monitoring

Monitor these metrics post-migration:

- Error rates (via `errorHandler.getErrors()`)
- Function execution times (Firebase Console)
- Database read/write counts
- User feedback

## Support During Migration

If you encounter issues:

1. Check [SETUP.md](SETUP.md) for configuration help
2. Review [API.md](API.md) for function usage
3. Check Firebase Console logs
4. Open a GitHub issue with:
   - Error message
   - Steps to reproduce
   - Browser console output
   - Firebase function logs

## Timeline

- **Phase 1**: ✅ Complete (Infrastructure setup)
- **Phase 2**: 🔄 In Progress (Code refactoring)
- **Phase 3**: 📅 Planned (HTML updates)
- **Phase 4**: 📅 Planned (Firebase migration)
- **Phase 5**: 📅 Planned (Database updates)
- **Phase 6**: 📅 Planned (Error handling)

**Estimated Completion**: 2-3 weeks from start of Phase 2

## Questions?

Contact the development team or open an issue on GitHub.
