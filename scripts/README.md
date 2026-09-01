# Game Thumbnail Download Scripts

This folder contains scripts for downloading and managing game thumbnails.

## 📁 Scripts

### download-thumbnails.js
Automated screenshot capture for game thumbnails using Puppeteer.

#### 🚀 Usage
```bash
cd scripts
node download-thumbnails.js
```

#### ⚙️ Configuration
- **Wait time**: 8 seconds per game
- **Screenshot size**: 1280x720
- **Output folder**: `../public/game-images/`
- **Delay between games**: 2 seconds
- **Max retries**: 2 attempts

#### 📁 Output Structure
```
public/game-images/
├── gta-vice-city/
│   └── thumbnail.png
├── 1v1lol/
│   └── thumbnail.png
├── 2048/
│   └── thumbnail.png
└── [game-folder]/
    └── thumbnail.png
```

#### 🎮 Games Included
- Editor's Choice (GTA Vice City, 2048, 1v1.lol, etc.)
- HTML Games (CrazyGames embeds)
- Car & Bike Games
- Multiplayer & IO Games
- Arcade Classics
- And more!

#### 📊 Features
- **Retry logic** - Handles failed attempts
- **Progress tracking** - Real-time console output
- **Error reporting** - Saves failed games to JSON
- **Performance optimized** - Efficient browser management
- **Clean organization** - Each game in its own folder

#### 🔧 Troubleshooting
- **Rate limiting**: Increase `delayBetweenGames` if getting blocked
- **Loading issues**: Increase `waitTime` for slower games
- **Visual debugging**: Set `headless: false` to watch browser

#### 📋 Reports
After completion:
- **Console summary** - Success/failure counts
- **failed-games.json** - List of failed games with errors
- **screenshot-report.json** - Detailed timing and statistics

## 🎯 Integration

This script works with your updated game data structure:
- **Next.js**: Looks in `/game-images/[folder]/thumbnail.png`
- **Static**: Looks in `/game-images/[folder]/thumbnail.png`
- **Image cycling**: Supports multiple images per game

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install puppeteer
   ```

2. **Run the script**:
   ```bash
   node scripts/download-thumbnails.js
   ```

3. **Check results**:
   - Images saved to `public/game-images/`
   - Failed games in `failed-games.json`
   - Full report in `screenshot-report.json`

Your game thumbnails will be automatically organized and ready for display! 🎮✨
