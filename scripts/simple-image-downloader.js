const { exec } = require('child_process');
const fs = require('fs');
const https = require('https');
const path = require('path');

// Import games data from the TypeScript file ONLY
const gamesDataPath = '../lib/games-data.ts';
const content = fs.readFileSync(gamesDataPath, 'utf8');

// Extract the raw games array
const rawArrayMatch = content.match(/const raw: \[string, string, string\]\[\] = \[([\s\S]*?)\]\s*$/m);
if (!rawArrayMatch) {
  console.error('Could not find games data array');
  process.exit(1);
}

// Parse the games data from the extracted content
const games = [];

// Extract games using regex - ONLY from TypeScript file
const gameMatches = content.match(/\["([^"]+)",\s*"([^"]+)",\s*"([^"]+)"\]/g);
if (gameMatches) {
  for (const match of gameMatches) {
    const gameMatch = match.match(/\["([^"]+)",\s*"([^"]+)",\s*"([^"]+)"\]/);
    if (gameMatch) {
      const [, title, url, category] = gameMatch;
      games.push({ title, url, category });
    }
  }
}

console.log(`Found ${games.length} games from TypeScript file...`);

// Create downloads directory
const downloadsDir = './game-screenshots';
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

// Function to download image from URL
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(downloadsDir, filename);
    const file = fs.createWriteStream(filepath);
    
    const request = https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`   📥 Downloaded: ${filename}`);
          resolve(filepath);
        });
      } else if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirects
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          https.get(redirectUrl, (redirectResponse) => {
            if (redirectResponse.statusCode === 200) {
              redirectResponse.pipe(file);
              file.on('finish', () => {
                file.close();
                console.log(`   📥 Downloaded: ${filename} (after redirect)`);
                resolve(filepath);
              });
            } else {
              file.close();
              fs.unlink(filepath, () => {});
              reject(new Error(`Redirect failed: ${redirectResponse.statusCode}`));
            }
          }).on('error', (err) => {
            file.close();
            fs.unlink(filepath, () => {});
            reject(err);
          });
        } else {
          file.close();
          fs.unlink(filepath, () => {});
          reject(new Error('Redirect without location'));
        }
      } else {
        file.close();
        fs.unlink(filepath, () => {});
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      fs.unlink(filepath, () => {});
      reject(err);
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      file.close();
      fs.unlink(filepath, () => {});
      reject(new Error('Request timeout'));
    });
  });
}

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

// Function to search Google for gameplay screenshots
function searchGameplayScreenshots(title) {
  const searchQuery = `${title} browser game gameplay screenshot of gameplay`;
  const encodedQuery = encodeURIComponent(searchQuery);
  return `https://www.google.com/search?q=${encodedQuery}&tbm=isch`;
}

// Function to sanitize filename
function sanitizeFilename(name) {
  return name
    .replace(/[^a-z0-9]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

console.log(`\n🎮 Processing ${games.length} games from TypeScript file...`);
console.log('⚠️  This will open browser tabs for manual download!');
console.log(`📁 Check folder: ${downloadsDir}`);
console.log('⏱️  10-second cooldown between each game');
console.log('\n🔍 Opening gameplay screenshot searches...');

const delay = 10000; // 10 seconds
let count = 0;

// Process just first 5 games as a test
const testGames = games.slice(0, 5);

testGames.forEach((game, index) => {
  setTimeout(async () => {
    const searchUrl = searchGameplayScreenshots(game.title);
    const sanitizedTitle = sanitizeFilename(game.title);
    
    console.log(`\n[${index + 1}/${testGames.length}] ${game.title}`);
    console.log(`   Category: ${game.category}`);
    console.log(`   Game URL: ${game.url}`);
    
    // Open the search
    openBrowser(searchUrl);
    
    // Try to download a sample image (using a placeholder URL for testing)
    try {
      // Use a sample image URL to test download functionality
      const testImageUrl = 'https://picsum.photos/400/300';
      await downloadImage(testImageUrl, `${sanitizedTitle}-test.jpg`);
      console.log(`   📸 Test download successful for: ${game.title}`);
    } catch (error) {
      console.log(`   ⚠️  Test download failed: ${error.message}`);
    }
    
    console.log(`   💡 Manually save 3rd image from browser as: ${sanitizedTitle}-3rd-image.jpg`);
    
    count++;
    if (count === testGames.length) {
      console.log('\n✨ Test complete!');
      console.log(`💡 Check your browser and the ${downloadsDir} folder!`);
      console.log('📸 Test images downloaded. Manual download required for real images.');
      console.log('\n📝 Instructions:');
      console.log('1. For each game, find the 3rd image in the browser tab');
      console.log('2. Right-click and "Save image as..."');
      console.log('3. Save with the filename shown above');
    }
  }, delay * index);
});

console.log('\n⏳ Processing 5 test games with 10-second delays...');
console.log('   This will take about 50 seconds to complete.');
console.log('   Press Ctrl+C to cancel at any time.\n');
