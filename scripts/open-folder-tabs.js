const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get all game folders from static/games
const gamesDir = '../static/games';
const folders = fs.readdirSync(gamesDir).filter(item => {
  const itemPath = path.join(gamesDir, item);
  return fs.statSync(itemPath).isDirectory();
});

console.log(`Found ${folders.length} game folders in static/games...`);

// Function to open URL in browser
function openBrowser(url) {
  const platform = process.platform;
  let command;
  
  if (platform === 'darwin') {
    command = `open "${url}"`;
  } else if (platform === 'win32') {
    command = `start "" "${url}"`;
  } else {
    command = `xdg-open "${url}"`;
  }
  
  exec(command, (error) => {
    if (error) {
      console.error(`Failed to open ${url}:`, error.message);
    } else {
      console.log(`✅ Opened: ${url}`);
    }
  });
}

// Function to create Google Images search URL
function createSearchUrl(folderName) {
  // Convert folder name to readable game title
  const title = folderName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const searchQuery = `${title} browser game gameplay screenshot of gameplay`;
  const encodedQuery = encodeURIComponent(searchQuery);
  return `https://www.google.com/search?q=${encodedQuery}&tbm=isch`;
}

console.log(`\n🎮 Opening ${folders.length} browser tabs for game folders...`);
console.log('⚠️  This will open one tab per game folder');
console.log('💡 You can manually paste images into each folder');
console.log('⏱️  15-second delay between each tab');

const delay = 15000; // 15 seconds
let count = 0;

// Find the index of "battledudes-io" to start from there
const startIndex = folders.indexOf('battledudes-io');
const foldersToProcess = startIndex >= 0 ? folders.slice(startIndex) : folders;

console.log(`\n🚀 Starting from: ${foldersToProcess[0] || 'battledudes-io'}`);
console.log(`📊 Processing ${foldersToProcess.length} folders (from index ${startIndex})`);

foldersToProcess.forEach((folder, index) => {
  setTimeout(() => {
    const searchUrl = createSearchUrl(folder);
    
    console.log(`\n[${index + 1}/${foldersToProcess.length}] ${folder}`);
    console.log(`   📁 Folder: static/games/${folder}/`);
    console.log(`   🔍 Search: ${searchUrl}`);
    
    // Open the search
    openBrowser(searchUrl);
    
    count++;
    if (count === foldersToProcess.length) {
      console.log('\n✨ Done! All tabs opened.');
      console.log('\n📝 Instructions:');
      console.log('1. Find a good image in each browser tab');
      console.log('2. Save it to the corresponding folder');
      console.log('3. Name it "thumbnail.png" or "gameplay1.png", etc.');
      console.log('\n💡 The folders are now ready for your images!');
    }
  }, delay * index);
});

console.log('\n⏳ Opening tabs with 15-second delays...');
console.log(`   This will take about ${Math.ceil(foldersToProcess.length * 15 / 60)} minutes to complete.`);
console.log('   Press Ctrl+C to cancel at any time.\n');
