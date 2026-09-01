const { exec } = require('child_process');
const fs = require('fs');
const https = require('https');
const path = require('path');
const puppeteer = require('puppeteer');

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
const rawContent = '[' + rawArrayMatch[1] + ']';
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

// Function to get the 3rd image from Google Images using Puppeteer
async function getThirdImage(title) {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    const searchQuery = `${title} browser game gameplay screenshot of gameplay`;
    const encodedQuery = encodeURIComponent(searchQuery);
    const searchUrl = `https://www.google.com/search?q=${encodedQuery}&tbm=isch`;
    
    console.log(`   🔍 Scraping: ${searchQuery}`);
    
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Scroll to load more images
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(1000);
    
    // Get the 3rd image URL
    const thirdImageUrl = await page.evaluate(() => {
      const images = document.querySelectorAll('img[src*="encrypted"], img[src*="gstatic"], img[src*="googleusercontent"]');
      if (images.length >= 3) {
        return images[2].src;
      }
      return null;
    });
    
    await browser.close();
    
    if (thirdImageUrl) {
      console.log(`   📸 Found 3rd image: ${thirdImageUrl.substring(0, 100)}...`);
      return thirdImageUrl;
    } else {
      throw new Error('No 3rd image found');
    }
    
  } catch (error) {
    if (browser) await browser.close();
    throw error;
  }
}

// Function to download image
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

console.log(`\n🎮 Processing ${games.length} games from TypeScript file ONLY...`);
console.log('⚠️  This will open browser tabs and download real images!');
console.log(`📁 Downloads will be saved to: ${downloadsDir}`);
console.log('⏱️  Exactly 10-second cooldown between each game');
console.log('📸 Auto-downloading 3rd image result from each search');
console.log('\n🔍 Opening gameplay screenshot searches...');

const delay = 10000; // Exactly 10 seconds
let count = 0;

games.forEach((game, index) => {
  setTimeout(async () => {
    const searchUrl = searchGameplayScreenshots(game.title);
    const sanitizedTitle = sanitizeFilename(game.title);
    
    console.log(`\n[${index + 1}/${games.length}] ${game.title}`);
    console.log(`   Category: ${game.category}`);
    console.log(`   Game URL: ${game.url}`);
    
    // Open the search
    openBrowser(searchUrl);
    
    // Get and download the 3rd image
    try {
      const thirdImageUrl = await getThirdImage(game.title);
      await downloadImage(thirdImageUrl, `${sanitizedTitle}-3rd-image.jpg`);
      console.log(`   📸 Successfully downloaded 3rd image for: ${game.title}`);
    } catch (error) {
      console.log(`   ⚠️  Could not download 3rd image: ${error.message}`);
    }
    
    count++;
    if (count === games.length) {
      console.log('\n✨ Done! All games processed.');
      console.log(`💡 Check your browser and the ${downloadsDir} folder!`);
      console.log('📸 Real images downloaded for each game.');
    }
  }, delay * index);
});

console.log('\n⏳ Processing games with exactly 10-second delays...');
console.log('   Browser tabs will remain open.');
console.log('   This will take a very long time to complete.');
console.log('   Press Ctrl+C to cancel at any time.\n');
