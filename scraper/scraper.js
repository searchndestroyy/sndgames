const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  outputFolder: './game-thumbnails',
  imagesPerGame: 3,
  delayBetweenSearches: 3000, // 3 seconds
  searchTemplate: '{gameName} browser version screenshots gameplay',
};

// ============================================
// ALL YOUR GAMES
// ============================================

const GAMES = [
  "GTA Vice City",
  "2048",
  "1v1.lol",
  "Sky Riders",
  "Krunker.io",
  "Highway Cars",
  "Moto X3M Winter",
  "Crazy MX",
  "Sky Car Drift",
  "Moto Racing Club",
  "Bike Stunts 3D",
  "Parking Fury 3D",
  "Rally Racer Dirt",
  "Demolition Derby 2",
  "Stunt Paradise",
  "Super Bike Champion",
  "Traffic Rider",
  "Narrow One",
  "Rocket Bot Royale",
  "Smash Karts",
  "Shell Shockers",
  "Vortex 9",
  "Paper.io",
  "Slither.io",
  "Agar.io",
  "Diep.io",
  "Mope.io",
  "Build Royale",
  "Zombs Royale",
  "Evowars.io",
  "Worms Zone",
  "Little Big Snake",
  "Lordz.io",
  "Gulper.io",
  "Paper.io 2",
  "Stumble Guys",
  "Fall Boys",
  "Cookie Clicker",
  "Little Alchemy",
  "World's Biggest Pac-Man",
  "HexGL",
  "Line Rider",
  "Asteroids",
  "Space Invaders",
  "Pong",
  "Breakout",
  "Frogger",
  "Doodle Road",
  "Jelly Dash",
  "Jump Guys",
  "Epic Ballz.io",
  "Night City Racing",
  "Highway Racer",
  "Racing Limits",
  "Parking Jam",
  "Truck Driving Simulator",
  "Vehicle Masters",
  "Bike Jump",
  "Cycle Extreme",
  "Bike Trial Forest",
  "Moto Maniac 3",
  "Moto Rider 3D",
  "Fury Bike Rider",
  "Stickman Moto Race",
  "Battledudes.io",
  "Chess Online MP",
  "8 Ball Pool MP",
  "Connect 4 Online",
  "Checkers Free",
  "Ninja Parkour MP",
  "Escape Prison MP",
  "Football Tricks",
  "Basketball Master",
  "Polytrack",
  "Mini Golf Club",
  "Tanks 3D",
  "Ships 3D",
  "Simply Prop Hunt",
  "Skillwarz",
  "Skribbl.io",
  "Survev.io",
  "War Brokers",
  "Warcall.io",
  "Taming.io",
  "TheLast.io",
  "TileMan.io",
  "Tina Detective",
  "Traffic Cop 3D",
  "Wrong Way",
  "WorldGuessr",
  "Worm Hunt",
  "Poxel.io",
  "Stabfish 2",
  "Stabfish.io",
  "Starblast",
  "Mazean",
  "Merge Construct",
  "Mine Craft.io",
  "Mini Caps Arena",
  "Miniblox",
  "Mini Giants.io",
  "MK48.io",
  "Monster Cars Simulator",
  "Dirt Bike Mad Skills",
  "Draw Crash Race",
  "Doors Castle",
  "Downtown 1930s Mafia",
  "Dragon Vice City",
  "Drift Boss",
  "Drift Hunters",
  "Ducklings",
  "Eggy Car",
  "EpicBallz.io",
  "Evolution Factor",
  "EvoWorld.io",
  "Fortzone Battle Royale",
  "Four Colors Uno",
  "Free Rally Vice",
  "Free Rider",
  "Free Rider 2",
  "Frontwars.io",
  "Gearshift One",
  "GoBattle.io",
  "GoKarts.io",
  "Gold Rush Arena",
  "Golf Mania",
  "Goober Dash",
  "Grand Action Simulator NY",
  "Grand Cyber City",
  "Gridpunk 3v3",
  "GrowDen.io",
  "GT Cars Mega Ramps",
  "Hole.io",
  "Hyper Cars Ramp Crash",
  "King.io World War",
  "Kiomet",
  "Kirka.io",
  "Kour.io",
  "Breakout Classic",
  "Frogger Classic",
  "Sandbox City",
  "Demolition Derby 3",
  "Super Star Car",
  "PolyTrack",
  "Assault Bots",
  "Offroad Island",
  "Mr. Racer",
  "Boom Karts",
  "Super Crime Steel War Hero",
  "Crazy Motorcycle",
  "Ultimate Flying Car",
  "Xtreme City Drifting",
  "Crazy Grand Prix",
  "City Car Driving Online",
  "ATV Ultimate Offroad",
  "Mad Town Andreas",
  "Russian Car Driver ZIL",
  "Racing Builder",
  "Derby Crash 4",
  "Ultimate Flying Car 2",
  "Crazy Stunt Cars MP",
  "4x4 Offroader",
  "Madalin Cars Multiplayer",
  "Truck Simulator Russia",
  "Stunt Master",
  "Bouncy Motors",
  "Mini-Caps Arena",
  "Rovercraft",
  "Derby Crash",
  "Madalin Stunt Cars 2",
  "Rush Hour",
  "MX Offroad Master",
  "Moto X3M CG",
  "Paper Boy Race",
  "Riders Downhill Racing",
  "Super MX Last Season",
  "Paper Delivery Boy",
  "Moto X3M 5 Pool Party",
  "Moto X3M 4 Winter",
  "Sunset Bike Racing",
  "Trial Mania",
  "Xtreme Moto Mayhem",
  "Moto X3M 6 Spooky Land",
  "3D Moto Simulator 2",
  "SCAR",
  "MotoCross Riders",
  "Super MX Champion",
  "Airborne Motocross",
  "Trial Bike Epic Stunts",
  "Ramp Bike Jumping",
  "Wheelie Up",
  "Crazy Moto Stunts",
  "Hill Climb Moto Bike",
  "Where's My Pizza?",
  "Trials Ice Ride",
  "Blocky Trials",
  "Stunt Dirt Bike",
  "Motocross Dirt Bike",
  "Trials Ride",
  "Crazy MotoX MP",
  "Super Fast Driver",
  "Stunt Mania 3D",
  "MotoGP Motocross Race",
  "Cartoon Moto Stunt",
  "Night Rider",
  "Stickman Zombie Motorcycle",
  "Switch Wheel Race",
  "Bloxd.io",
  "BuildNow GG",
  "Squid Game Online",
  "CubeRealm.io",
  "Escape From Pizzeria",
  "Cowz.io",
  "Bank Heist",
  "Pixel Warfare",
  "BLOCOPS",
  "Crazy Guys",
  "Mk48.io",
  "Chess Free",
  "Brainrots.io",
  "Mancala Classic",
  "Race Clicker",
  "Struckd 3D Creator",
  "Eternal Siege",
  "Street Fighter Sim",
  "Krunker",
  "Hazmob FPS",
  "Slither.io CG",
  "Voxiom.io",
  "Holey.io",
  "Cubes 2048.io",
  "SimplyUp.io",
  "Worms.Zone",
  "BattleDudes.io",
  "digdig.io",
  "Sploop.io",
  "WarCall.io",
  "Archer Clash",
  "BrutalMania.io",
  "Tzared",
  "STUG",
  "Deadshot.io",
  "LOL Beans",
  "Bonk.io",
  "FrontWars.io",
  "Growden.io",
  "Overtide.io",
  "Raidfield 2",
  "Noob Snake 2048",
  "Bit Gun.io",
  "Planet Clicker",
  "Leek Factory Tycoon",
  "Farm Ring Idle",
  "Human Clicker Grow Organs",
  "Mister Mine",
  "Idle Mining Empire",
  "Black Hole Idle",
  "Just One More Roll",
  "Color Cannon Idle",
  "When Civilians Dig Holes",
  "Babel Tower",
  "Plinky",
  "Evolutionary Tribe Mqd",
  "Cell To Singularity Mesozoic Valley",
  "Flywheel Incremental",
  "Money Maker Bex",
  "Dualforce Idle",
  "Merge Miner",
  "Race Clicker Tap Tap Game",
  "Legend Of Fireball Mpp",
  "Capybara Clicker",
  "Planet Destroy Idle",
  "Crusher Clicker",
  "Llama Legends",
  "Block Wall Destroyer",
  "Obby Vs Brainrot",
  "Idle Football Manager",
  "Italian Brainrot Clicker Usp",
  "Dominate All Shapes",
  "Planet Clicker 2",
  "Circle Farm",
  "Merge Steal Brainrot",
  "Grindcraft",
  "Omega Layers",
  "Incremental Epic Hero 2",
  "My Chicken Farm",
  "Clicker Monsters Rpj",
  "Idle House Build",
  "Capybara Clicker 2",
  "Evolve",
  "Block Clicker",
  "Mystery Digger",
  "Mad Evolution Idle Merge",
  "Simple Loot Idle",
  "Commit Battery 3",
  "Metro Connect",
  "Neon Core Breaker",
  "Emoji Clickers",
  "Farming Tycoon 3d Diu",
  "Clicker Heroes",
  "Street Life",
  "Gun Bounce Idle",
  "Plinko Clicker Hdl",
  "Corn Tycoon",
  "Pen Dig",
  "Idle Space Business Tycoon",
  "Money Factory Tycoon Idle Game",
  "Ragdoll Drop Tycoon",
  "Planet Evolution Idle Clicker",
  "Merge A Fruit",
  "Home Builder 3d",
  "Doge Miner",
  "Money Factory Aqs",
  "Planet Life Idle",
  "Revolution Idle X Demo",
  "Idle Inventor",
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function sanitizeFilename(name) {
  return name
    .replace(/[^a-z0-9]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const request = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      
      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
    });
    
    request.on('error', reject);
    request.setTimeout(15000, () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// ============================================
// SCRAPE GOOGLE IMAGES
// ============================================

async function scrapeAndDownload(page, gameName) {
  const searchQuery = CONFIG.searchTemplate.replace('{gameName}', gameName);
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&tbm=isch`;
  const sanitizedName = sanitizeFilename(gameName);
  
  console.log(`   🔍 Searching: "${searchQuery}"`);
  
  try {
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(2000);
    
    // Scroll to load more images
    await page.evaluate(() => window.scrollBy(0, 1000));
    await sleep(1000);
    
    // Extract image URLs using Puppeteer
    // Google Images requires clicking thumbnails to get full-size URLs
    const imageUrls = await page.evaluate(async (maxImages) => {
      const urls = [];
      
      // Find all image thumbnail containers
      const thumbnails = document.querySelectorAll('div[data-attrid="images universal"] img, div.islrc img');
      
      for (let i = 0; i < Math.min(thumbnails.length, maxImages * 2); i++) {
        const img = thumbnails[i];
        
        // Try to get the source
        let src = img.src || img.dataset.src || img.dataset.iurl;
        
        // Skip base64 and google's own images
        if (!src || src.startsWith('data:') || src.includes('gstatic.com')) {
          continue;
        }
        
        // Check if it's a decent size
        if (img.naturalWidth && img.naturalWidth < 150) continue;
        
        urls.push(src);
        
        if (urls.length >= maxImages) break;
      }
      
      return urls;
    }, CONFIG.imagesPerGame);
    
    console.log(`   📷 Found ${imageUrls.length} images`);
    
    // If no images found with first method, try alternative approach
    if (imageUrls.length === 0) {
      console.log('   🔄 Trying alternative extraction method...');
      
      const altUrls = await page.evaluate((maxImages) => {
        const urls = [];
        const allImages = Array.from(document.querySelectorAll('img'));
        
        for (const img of allImages) {
          const src = img.src;
          
          // Must be http/https, not data URL, not google logo
          if (!src || 
              !src.startsWith('http') || 
              src.includes('gstatic.com') ||
              src.includes('google.com/images/branding')) {
            continue;
          }
          
          // Check size
          if (img.width < 150 || img.height < 150) continue;
          
          urls.push(src);
          if (urls.length >= maxImages) break;
        }
        
        return urls;
      }, CONFIG.imagesPerGame);
      
      imageUrls.push(...altUrls);
      console.log(`   📷 Alternative method found ${altUrls.length} images`);
    }
    
    console.log(`   📷 Found ${imageUrls.length} images`);
    
    if (imageUrls.length === 0) {
      return { success: false, reason: 'No images found' };
    }
    
    // Download the images
    let downloadedCount = 0;
    for (let i = 0; i < imageUrls.length; i++) {
      const url = imageUrls[i];
      const ext = url.match(/\.(jpg|jpeg|png|gif|webp)/i)?.[1] || 'jpg';
      const filename = `${sanitizedName}-${i + 1}.${ext}`;
      const filepath = path.join(CONFIG.outputFolder, filename);
      
      try {
        await downloadImage(url, filepath);
        console.log(`   ✅ Downloaded: ${filename}`);
        downloadedCount++;
      } catch (err) {
        console.log(`   ⚠️  Failed to download image ${i + 1}: ${err.message}`);
      }
    }
    
    if (downloadedCount > 0) {
      return { success: true, count: downloadedCount };
    } else {
      return { success: false, reason: 'Failed to download any images' };
    }
    
  } catch (error) {
    return { success: false, reason: error.message };
  }
}

// ============================================
// MAIN FUNCTION
// ============================================

async function main() {
  // Create output folder
  if (!fs.existsSync(CONFIG.outputFolder)) {
    fs.mkdirSync(CONFIG.outputFolder, { recursive: true });
  }
  
  console.log('🚀 Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
    ]
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  let successful = 0;
  let failed = 0;
  const failedGames = [];
  
  console.log(`\n📸 Starting download for ${GAMES.length} games...\n`);
  
  for (let i = 0; i < GAMES.length; i++) {
    const gameName = GAMES[i];
    const progress = `[${i + 1}/${GAMES.length}]`;
    
    console.log(`${progress} Processing: ${gameName}`);
    
    const result = await scrapeAndDownload(page, gameName);
    
    if (result.success) {
      successful++;
      console.log(`   🎉 Downloaded ${result.count} image(s) for ${gameName}\n`);
    } else {
      failed++;
      failedGames.push({ name: gameName, reason: result.reason });
      console.log(`   ❌ Failed: ${result.reason}\n`);
    }
    
    // Delay between searches
    if (i < GAMES.length - 1) {
      await sleep(CONFIG.delayBetweenSearches);
    }
  }
  
  await browser.close();
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📁 Output folder: ${CONFIG.outputFolder}`);
  
  if (failedGames.length > 0) {
    console.log(`\n❌ Failed games (${failedGames.length}):`);
    failedGames.slice(0, 10).forEach(game => {
      console.log(`   - ${game.name}: ${game.reason}`);
    });
    
    if (failedGames.length > 10) {
      console.log(`   ... and ${failedGames.length - 10} more`);
    }
    
    fs.writeFileSync('failed-games.json', JSON.stringify(failedGames, null, 2));
    console.log('\n💾 Failed games saved to: failed-games.json');
  }
  
  console.log('\n✨ Done! Check the game-thumbnails folder.');
  console.log('💡 You got multiple images per game - pick the best one!');
}

// Run it
main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});