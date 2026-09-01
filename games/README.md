# Games Folder System

This folder allows you to add custom games to RCU Games website using a folder-based system like Android/iOS app folders.

## 📁 How It Works

Instead of individual games, folders act as **categories** that contain multiple games. When users click on a folder, they're taken to a dedicated page showing all games inside that folder.

## 🎮 Folder Structure

### **Single Game Folder**
```
games/
└── my-game/
    └── game.json
```

### **Multiple Games Folder**
```
games/
└── action-games/
    ├── game-1/
    │   └── game.json
    ├── game-2/
    │   └── game.json
    └── game-3/
        └── game.json
```

## 📝 Game JSON Format

Each `game.json` file contains:
```json
{
  "title": "Game Title",
  "url": "https://example.com/game-url",
  "description": "Optional game description",
  "thumbnail": "thumbnail.png"
}
```

## 🎯 Folder Display

- **Folder Cards**: Show folder icon with game count
- **Folder Badge**: "FOLDER" label on folder cards
- **Game Count**: Shows number of games inside
- **Click to Open**: Opens dedicated folder page

## 📱 Folder Page Features

- **Back Button**: Return to main site
- **Folder Title**: Displays folder name
- **Game Grid**: Shows all games in folder
- **Game Player**: Click to play any game
- **Same Styling**: Consistent with main site design

## 🚀 How to Add Folders

### **1. Create Folder Structure**
```bash
games/
├── racing-games/
│   ├── speed-racer/
│   │   └── game.json
│   └── moto-rally/
│       └── game.json
└── puzzle-games/
    └── brain-teaser/
        └── game.json
```

### **2. Add Game Data**
Each game needs a `game.json`:
```json
{
  "title": "Speed Racer",
  "url": "https://example.com/speed-racer",
  "description": "Fast racing game",
  "thumbnail": "thumbnail.png"
}
```

### **3. Add Thumbnails (Optional)**
```
games/
└── racing-games/
    └── speed-racer/
        ├── game.json
        └── thumbnail.png
```

## 🎨 Visual Features

- **Folder Icon**: 3-line folder icon design
- **Game Counter**: Shows number of games
- **Hover Effects**: Same as regular games
- **Responsive**: Works on all screen sizes
- **Glass Morphism**: Matches site design

## 📂 Example Folders Created

- `action-games/` - Contains 2 sample games
- `puzzle-games/` - Contains 1 sample game  
- `sample-game/` - Single game example

## 🔄 Automatic Features

- **Auto-Discovery**: Folders detected automatically
- **Category Assignment**: All folders appear in "Editor's Choice"
- **Dynamic Loading**: No code changes needed
- **Mixed Display**: Folders and games shown together

## 🌐 Folder URLs

- **Main Site**: `https://yoursite.com/`
- **Folder Page**: `https://yoursite.com/folder/action-games`
- **Direct Access**: Bookmarks work for folders

**The folder system creates an organized, app-like experience for your games collection!** 📱✨
