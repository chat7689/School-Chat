# Block Racers Online 🏁⚡

A fully-featured online multiplayer platformer speedrunning game with user-generated content, an in-game economy system, and competitive racing.

![Version](https://img.shields.io/badge/version-10.2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Firebase](https://img.shields.io/badge/backend-Firebase-orange)

## 🎮 Features

### Core Gameplay
- **Custom Physics Engine** - Smooth platforming with gravity, friction, and responsive controls
- **8 Challenging Levels** - Built-in levels plus unlimited user-created content
- **Three Player Sizes** - Small (20px), Default (40px), Large (80px) - each affects gameplay
- **Practice Mode** - Perfect your runs on any level

### Multiplayer
- **Party System** - Create and join parties with friends
- **Real-time Racing** - Compete against other players simultaneously
- **Live Position Tracking** - See where you rank during races
- **Invitation System** - Invite friends by username

### Economy & Progression
- **Dual Currency System**
  - **Credits (On-hand)** - Liquid currency for purchases
  - **Secure Credits (BASE)** - Protected storage in your personal base
- **BASE Building System** - Place blocks to store credits securely (max 3 credits per block)
- **Cosmetic Shop** - Customize your character with unlockable skins
- **Global Leaderboards** - Credits and speedrun rankings

### Level Creation
- **Full-Featured Level Editor**
  - 14+ tools (platforms, hazards, triggers, movement, voids, etc.)
  - Grid snapping (5px to 160px)
  - Undo/redo system
  - Copy/paste blocks
  - Moving platforms with customizable timing
  - Import/export levels (JSON)
  - Auto-save functionality
  - Comment annotations

### Stats & Tracking
- **Times History** - View all your runs, not just personal bests
- **Personal Bests** - Track your best time on each map
- **Global Rankings** - Compare against all players
- **Detailed Statistics** - Comprehensive player stats

### Admin Tools
- **Secure Admin Console** - Password-protected management interface
- **User Management** - View/modify user data, reset passwords
- **Level Management** - Export/import level data
- **Leaderboard Control** - Purge times, manage rankings
- **Account Deletion** - Complete user data removal

## 🚀 Quick Start

### Prerequisites
- Node.js 16 or higher
- Firebase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/chat7689/School-Chat.git
   cd School-Chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```

3. **Set up Firebase**
   ```bash
   # Install Firebase CLI
   npm install -g firebase-tools

   # Login to Firebase
   firebase login

   # Initialize Firebase (if not already done)
   firebase init
   ```

4. **Configure environment**
   ```bash
   # Copy example environment file
   cp .env.example .env

   # Edit .env with your Firebase credentials
   # Get these from Firebase Console > Project Settings > General
   ```

5. **Deploy Firebase rules and functions**
   ```bash
   firebase deploy --only database:rules
   firebase deploy --only functions
   ```

6. **Run locally**
   ```bash
   npm run dev
   # Open http://localhost:8080
   ```

## 📁 Project Structure

```
school-chat-repo/
├── public/                 # Public assets (will contain refactored HTML files)
├── src/
│   └── js/
│       ├── core/          # Core systems (config, Firebase init)
│       ├── game/          # Game logic (physics, rendering, player)
│       ├── ui/            # UI components
│       ├── multiplayer/   # Party and race systems
│       ├── admin/         # Admin console functionality
│       └── utils/         # Utilities (validation, error handling, loading)
├── functions/             # Firebase Cloud Functions
│   ├── index.js          # Server-side validation and logic
│   └── package.json
├── docs/                  # Documentation
├── scripts/               # Build and utility scripts
├── database.rules.json    # Firebase security rules
├── firebase.json          # Firebase configuration
├── package.json           # Project dependencies
├── .env.example          # Environment variables template
└── README.md             # This file
```

## 🎯 Game Controls

### In-Game
- **Arrow Keys / WASD** - Move left/right
- **Space / W / Up Arrow** - Jump
- **R** - Restart level
- **ESC** - Exit to menu

### Level Editor
- **1-7** - Select tools
- **G** - Toggle grid
- **Ctrl+Z** - Undo
- **Ctrl+Y** - Redo
- **Ctrl+C** - Copy block
- **Ctrl+V** - Paste block
- **Delete** - Delete selected
- **WASD** - Pan camera
- **Scroll** - Zoom in/out

## 🔒 Security

### Current Implementation
- Firebase Authentication with email/password
- Firebase Realtime Database Security Rules
- Server-side validation via Cloud Functions
- Admin console password protection
- Dual currency system prevents total loss

### Recent Security Improvements
1. ✅ Moved Firebase config to environment variables
2. ✅ Implemented comprehensive database security rules
3. ✅ Added server-side time validation (anti-cheat)
4. ✅ Created Cloud Functions for credit transactions
5. ✅ Input validation and sanitization
6. ✅ Error handling and logging

### Remaining Security Tasks
- [ ] Implement proper bcrypt password hashing
- [ ] Add rate limiting
- [ ] Implement CAPTCHA for registration
- [ ] Add IP-based anti-cheat measures
- [ ] Create audit logs for admin actions

## 🛠️ Development

### Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run deploy           # Deploy to Firebase
npm run deploy:hosting   # Deploy hosting only
npm run deploy:functions # Deploy functions only
npm run deploy:rules     # Deploy database rules only
npm run lint             # Lint code
npm run format           # Format code with Prettier
```

### Testing

```bash
# Start Firebase emulators for local testing
firebase emulators:start

# Run with emulators
npm run dev
```

## 📊 Database Structure

```
firebase-database/
├── users/
│   └── {uid}/
│       ├── username
│       └── createdAt
├── usernames/
│   └── {username}/
│       ├── uid
│       └── createdAt
├── players/
│   └── {uid}/
│       ├── username
│       ├── credits
│       ├── secureCredits
│       ├── baseBlocks/
│       ├── ownedCosmetics/
│       └── equippedCosmetics/
├── scores/
│   └── {mapId}/
│       └── {uid}/
│           ├── username
│           ├── time
│           └── timestamp
├── times_history/
│   └── {uid}/
│       └── {mapId}/
│           └── {timeId}/
│               ├── time
│               ├── timestamp
│               └── verified
├── levels/
│   └── {levelId}/
│       ├── name
│       ├── creator
│       ├── levelData/
│       └── createdAt
├── parties/
│   └── {partyId}/
│       ├── leader
│       ├── members/
│       └── currentMap
└── invitations/
    └── {uid}/
        └── {inviteId}/
```

## 🎨 Customization

### Adding Custom Cosmetics

Edit the cosmetics shop data in `game.html`:

```javascript
const cosmetics = {
  skins: [
    {
      id: 'skin_name',
      name: 'Display Name',
      price: 100,
      color: '#FF0000'
    }
  ]
};
```

### Creating Custom Levels

1. Open the Level Creator (creator.html)
2. Use tools to build your level
3. Click "Copy Level Data"
4. Share the JSON with others or save to Firebase

## 🐛 Troubleshooting

### "Firebase not initialized" error
- Ensure `.env` file is properly configured
- Check that Firebase credentials are correct
- Verify Firebase project is active

### Multiplayer not working
- Check Firebase security rules are deployed
- Ensure both players are authenticated
- Verify network connection

### Times not saving
- Deploy Cloud Functions: `npm run deploy:functions`
- Check function logs: `npm run logs`
- Verify user is authenticated

## 📝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards
- Follow ESLint configuration
- Use Prettier for formatting
- Write descriptive commit messages
- Add comments for complex logic

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Firebase for backend infrastructure
- HTML5 Canvas for rendering
- All players and contributors

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/chat7689/School-Chat/issues)
- **Email**: your-email@example.com

## 🗺️ Roadmap

### Version 11.0 (Planned)
- [ ] Mobile support (touch controls)
- [ ] Spectator mode
- [ ] Tournament system
- [ ] Replay system
- [ ] Voice chat
- [ ] Team races
- [ ] Season rankings
- [ ] Achievement system

### Version 12.0 (Future)
- [ ] Power-ups
- [ ] Environmental hazards
- [ ] Weather effects
- [ ] Custom game modes
- [ ] Mod support

## 📸 Screenshots

_Coming soon - add screenshots of gameplay, level editor, and multiplayer_

---

**Made with ❤️ by the Block Racers team**

**Star ⭐ this repo if you enjoy the game!**
