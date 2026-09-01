/**
 * Run this script to generate all game folders from the games data
 * Usage: node scripts/generate-game-folders.js
 */

import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GAMES_DIR = join(__dirname, '..', 'static', 'games');

// Game data: [title, url, category]
const RAW = [
  ["Highway Cars", "https://www.onlinegames.io/games/2023/construct/211/highway-cars/index.html", "html"],
  ["Cut The Rope", "https://play.famobi.com/cut-the-rope", "html"],
  ["Bubble Tower 3D", "https://play.famobi.com/bubble-tower-3d", "html"],
  ["Cannon Balls 3D", "https://play.famobi.com/cannon-balls-3d", "html"],
  ["Onet Connect Classic", "https://play.famobi.com/onet-connect-classic", "html"],
  ["Solitaire Classic", "https://play.famobi.com/solitaire-classic", "html"],
  ["Mahjong Classic", "https://play.famobi.com/mahjong-classic", "html"],
  ["Jewelish", "https://play.famobi.com/jewelish", "html"],
  ["Smarty Bubbles", "https://play.famobi.com/smarty-bubbles", "html"],
  ["Candy Bubble", "https://play.famobi.com/candy-bubble", "html"],
  ["Football Tricks", "https://play.famobi.com/football-tricks", "html"],
  ["Basketball Master", "https://play.famobi.com/basketball-master", "html"],
  ["Tina - Detective", "https://play.famobi.com/tina-detective", "html"],
  ["My Dolphin Show", "https://play.famobi.com/my-dolphin-show", "html"],
  ["Moto X3M", "https://play.famobi.com/moto-x3m", "html"],
  ["Moto X3M Pool Party", "https://play.famobi.com/moto-x3m-pool-party", "html"],
  ["Moto X3M Winter", "https://unblocked-games.s3.amazonaws.com/moto-x3m-winter.html", "html"],
  ["Moto X3M Spooky Land", "https://play.famobi.com/moto-x3m-spooky-land", "html"],
  ["Moto X3M Bike Race", "https://play.famobi.com/moto-x3m-bike-race-game", "html"],
  ["Krunker.io", "https://krunker.io", "html"],
  ["2048", "https://play2048.co", "od"],
  ["Little Alchemy", "https://littlealchemy.com", "od"],
  ["World's Biggest Pac-Man", "https://worldsbiggestpacman.com", "od"],
  ["Slither.io", "https://slither.io", "od"],
  ["Paper.io", "https://paper-io.com", "od"],
  ["HexGL", "http://hexgl.bkcore.com/play/", "od"],
  ["Line Rider", "https://www.linerider.com", "od"],
  ["Cookie Clicker", "https://orteil.dashnet.org/cookieclicker/", "od"],
  ["Asteroids", "https://www.freeasteroids.org", "arcade"],
  ["Space Invaders", "https://spaceinvaders.de", "arcade"],
  ["Pong", "https://pong-2.com", "arcade"],
  ["Breakout", "https://www.breakoutgame.org", "arcade"],
  ["Frogger", "https://froggerclassic.appspot.com", "arcade"],
  ["Chess Duels", "https://html5.gamedistribution.com/15268ba792454d319e6c50d6fe0edcb0/?gd_sdk_referrer_url=https://gamedistribution.com/games/chess-duel/", "arcade"],
  ["Sky Riders", "https://www.crazygames.com/embed/sky-riders-buk", "car"],
  ["Smash Karts", "https://www.crazygames.com/embed/smash-karts", "car"],
  ["Racing Limits", "https://www.crazygames.com/embed/racing-limits", "car"],
  ["Sandbox City", "https://www.crazygames.com/embed/sandbox-city---cars-zombies-ragdolls", "car"],
  ["Night City Racing", "https://www.crazygames.com/embed/night-city-racing", "car"],
  ["Rally Racer Dirt", "https://www.crazygames.com/embed/rally-racer-dirt", "car"],
  ["Stunt Paradise", "https://www.crazygames.com/embed/stunt-paradise", "car"],
  ["Doodle Road", "https://www.crazygames.com/embed/doodle-road", "car"],
  ["Parking Jam", "https://www.crazygames.com/embed/parking-jam-dqq", "car"],
  ["Traffic Cop 3D", "https://www.crazygames.com/embed/traffic-cop-3d", "car"],
  ["Demolition Derby 3", "https://www.crazygames.com/embed/demolition-derby-3", "car"],
  ["Super Star Car", "https://www.crazygames.com/embed/super-star-car", "car"],
  ["PolyTrack", "https://www.crazygames.com/embed/polytrack", "car"],
  ["Evolution Factor", "https://www.crazygames.com/embed/evolution-factor-1", "car"],
  ["Draw Crash Race", "https://www.crazygames.com/embed/draw-crash-race", "car"],
  ["Assault Bots", "https://www.crazygames.com/embed/bot-machines", "car"],
  ["Drift Hunters", "https://www.crazygames.com/embed/drift-hunters", "car"],
  ["Offroad Island", "https://www.crazygames.com/embed/offroad-island", "car"],
  ["Mr. Racer", "https://www.crazygames.com/embed/mr-racer---car-racing", "car"],
  ["Boom Karts", "https://www.crazygames.com/embed/boom-karts", "car"],
  ["Super Crime Steel War Hero", "https://www.crazygames.com/embed/super-crime-steel-war-hero", "car"],
  ["Crazy Motorcycle", "https://www.crazygames.com/embed/crazy-motorcycle", "car"],
  ["Downtown 1930s Mafia", "https://www.crazygames.com/embed/downtown-1930s-mafia", "car"],
  ["Merge & Construct", "https://www.crazygames.com/embed/merge-construct", "car"],
  ["Ultimate Flying Car", "https://www.crazygames.com/embed/ultimate-flying-car", "car"],
  ["Gearshift One", "https://www.crazygames.com/embed/gearshift-one", "car"],
  ["GT Cars Mega Ramps", "https://www.crazygames.com/embed/gt-cars-mega-ramps", "car"],
  ["Xtreme City Drifting", "https://www.crazygames.com/embed/xtreme-city-drifting", "car"],
  ["Demolition Derby 2", "https://www.crazygames.com/embed/demolition-derby-2", "car"],
  ["Monster Cars Simulator", "https://www.crazygames.com/embed/monster-cars-ultimate-simulator", "car"],
  ["Grand Cyber City", "https://www.crazygames.com/embed/grand-cyber-city", "car"],
  ["Crazy Grand Prix", "https://www.crazygames.com/embed/crazy-grand-prix", "car"],
  ["City Car Driving Online", "https://www.crazygames.com/embed/city-car-driving-simulator-online", "car"],
  ["ATV Ultimate Offroad", "https://www.crazygames.com/embed/atv-ultimate-offroad", "car"],
  ["Truck Driving Simulator", "https://www.crazygames.com/embed/truck-driving-simulator-game", "car"],
  ["Mad Town Andreas", "https://www.crazygames.com/embed/mad-town-andreas-mafia-storie", "car"],
  ["Russian Car Driver ZIL", "https://www.crazygames.com/embed/russian-car-driver-zil-130", "car"],
  ["Racing Builder", "https://www.crazygames.com/embed/racing-builder", "car"],
  ["Drift Boss", "https://www.crazygames.com/embed/drift-boss", "car"],
  ["Parking Fury 3D", "https://www.crazygames.com/embed/parking-fury-3d-side-hustle", "car"],
  ["Derby Crash 4", "https://www.crazygames.com/embed/derby-crash-4", "car"],
  ["Grand Action Simulator NY", "https://www.crazygames.com/embed/grand-action-simulator-new-york-car-gang", "car"],
  ["Ultimate Flying Car 2", "https://www.crazygames.com/embed/ultimate-flying-car-2", "car"],
  ["Vehicle Masters", "https://www.crazygames.com/embed/vehicle-masters", "car"],
  ["Crazy Stunt Cars MP", "https://www.crazygames.com/embed/crazy-stunt-cars-multiplayer", "car"],
  ["4x4 Offroader", "https://www.crazygames.com/embed/4x4-offroader", "car"],
  ["Highway Racer", "https://www.crazygames.com/embed/highway-racer", "car"],
  ["Madalin Cars Multiplayer", "https://www.crazygames.com/embed/madalin-cars-multiplayer", "car"],
  ["Truck Simulator Russia", "https://www.crazygames.com/embed/truck-simulator-russia", "car"],
  ["Stunt Master", "https://www.crazygames.com/embed/city-car-driving-simulator-ultimate", "car"],
  ["Bouncy Motors", "https://www.crazygames.com/embed/bouncy-motors", "car"],
  ["Free Rally Vice", "https://www.crazygames.com/embed/free-rally-vice", "car"],
  ["Mini-Caps Arena", "https://www.crazygames.com/embed/mini-caps-arena", "car"],
  ["Hyper Cars Ramp Crash", "https://www.crazygames.com/embed/hyper-cars-ramp-crash", "car"],
  ["Rovercraft", "https://www.crazygames.com/embed/rovercraft", "car"],
  ["Derby Crash", "https://www.crazygames.com/embed/derbycrash", "car"],
  ["Madalin Stunt Cars 2", "https://www.crazygames.com/embed/madalin-stunt-cars-2", "car"],
  ["Wrong Way", "https://www.crazygames.com/embed/wrongway", "car"],
  ["Rush Hour", "https://www.crazygames.com/embed/rush-hour-owq", "car"],
  ["Eggy Car", "https://www.crazygames.com/embed/eggy-car", "car"],
  ["MX Offroad Master", "https://www.crazygames.com/embed/mx-offroad-master", "car"],
  ["Traffic Rider", "https://www.crazygames.com/embed/traffic-rider-vvq", "bike"],
  ["Super Bike Champion", "https://www.crazygames.com/embed/super-bike-the-champion", "bike"],
  ["Moto X3M CG", "https://www.crazygames.com/embed/moto-x3m", "bike"],
  ["Paper Boy Race", "https://www.crazygames.com/embed/paper-boy-race-running-game", "bike"],
  ["Riders Downhill Racing", "https://www.crazygames.com/embed/riders-downhill-racing", "bike"],
  ["Super MX Last Season", "https://www.crazygames.com/embed/super-mx-last-season", "bike"],
  ["Paper Delivery Boy", "https://www.crazygames.com/embed/paper-delivery-boy", "bike"],
  ["Moto X3M 5 Pool Party", "https://www.crazygames.com/embed/moto-x3m-pool-party", "bike"],
  ["Dragon Vice City", "https://www.crazygames.com/embed/dragon-vice-city", "bike"],
  ["Moto X3M 4 Winter", "https://www.crazygames.com/embed/moto-x3m-4", "bike"],
  ["Sunset Bike Racing", "https://www.crazygames.com/embed/sunset-bike-racing", "bike"],
  ["Trial Mania", "https://www.crazygames.com/embed/trial-mania", "bike"],
  ["Xtreme Moto Mayhem", "https://www.crazygames.com/embed/xtreme-moto-mayhem", "bike"],
  ["Moto X3M 6 Spooky Land", "https://www.crazygames.com/embed/moto-x3m-spooky-land", "bike"],
  ["GoKarts.io", "https://www.crazygames.com/embed/gokarts-io", "bike"],
  ["3D Moto Simulator 2", "https://www.crazygames.com/embed/3d-moto-simulator-2", "bike"],
  ["SCAR", "https://www.crazygames.com/embed/scar", "bike"],
  ["MotoCross Riders", "https://www.crazygames.com/embed/motocross-riders", "bike"],
  ["Super MX Champion", "https://www.crazygames.com/embed/super-mx-motocross-simulator", "bike"],
  ["Bike Jump", "https://www.crazygames.com/embed/bike-jump", "bike"],
  ["Airborne Motocross", "https://www.crazygames.com/embed/airborne-motocross", "bike"],
  ["Trial Bike Epic Stunts", "https://www.crazygames.com/embed/trial-bike-epic-stunts", "bike"],
  ["Ramp Bike Jumping", "https://www.crazygames.com/embed/ramp-bike-jumping", "bike"],
  ["Wheelie Up", "https://www.crazygames.com/embed/wheelie-up", "bike"],
  ["Dirt Bike Mad Skills", "https://www.crazygames.com/embed/dirt-bike-mad-skills", "bike"],
  ["Crazy Moto Stunts", "https://www.crazygames.com/embed/crazy-moto-stunts", "bike"],
  ["Moto Rider 3D", "https://www.crazygames.com/embed/moto-rider-3d", "bike"],
  ["Moto Racing Club", "https://www.crazygames.com/embed/moto-racing-club", "bike"],
  ["Hill Climb Moto Bike", "https://www.crazygames.com/embed/hill-climb-on-moto-bike", "bike"],
  ["Where's My Pizza?", "https://www.crazygames.com/embed/where-s-my-pizza", "bike"],
  ["Bike Stunts 3D", "https://www.crazygames.com/embed/bike-stunts-race-bike-games-3d", "bike"],
  ["Trials Ice Ride", "https://www.crazygames.com/embed/trail-ice-ride", "bike"],
  ["Blocky Trials", "https://www.crazygames.com/embed/blocky-trials", "bike"],
  ["Stunt Dirt Bike", "https://www.crazygames.com/embed/stunt-dirt-bike", "bike"],
  ["Cycle Extreme", "https://www.crazygames.com/embed/cycle-extreme", "bike"],
  ["Motocross Dirt Bike", "https://www.crazygames.com/embed/motocross-dirt-bike-race-games", "bike"],
  ["Trials Ride", "https://www.crazygames.com/embed/trials-ride", "bike"],
  ["Crazy MotoX MP", "https://www.crazygames.com/embed/crazy-motox-multiplayer", "bike"],
  ["Fury Bike Rider", "https://www.crazygames.com/embed/fury-bike-rider", "bike"],
  ["Super Fast Driver", "https://www.crazygames.com/embed/super-fast-driver", "bike"],
  ["Stunt Mania 3D", "https://www.crazygames.com/embed/stunt-mania-3d", "bike"],
  ["Free Rider", "https://www.crazygames.com/embed/free-rider", "bike"],
  ["Stickman Moto Race", "https://www.crazygames.com/embed/stickman-moto-race-extreme", "bike"],
  ["MotoGP Motocross Race", "https://www.crazygames.com/embed/motogp-motocross-race", "bike"],
  ["Crazy MX", "https://www.crazygames.com/embed/crazy-mx", "bike"],
  ["Moto Maniac 3", "https://www.crazygames.com/embed/moto-maniac-3", "bike"],
  ["Cartoon Moto Stunt", "https://www.crazygames.com/embed/cartoon-moto-stunt", "bike"],
  ["Night Rider", "https://www.crazygames.com/embed/night-rider", "bike"],
  ["Bike Trial Forest", "https://www.crazygames.com/embed/bike-trial-xtreme-forest", "bike"],
  ["Free Rider 2", "https://www.crazygames.com/embed/free-rider-2", "bike"],
  ["Stickman Zombie Motorcycle", "https://www.crazygames.com/embed/stickman-zombie-motorcycle", "bike"],
  ["Switch Wheel Race", "https://www.crazygames.com/embed/switch-wheel-race-master", "bike"],
  ["Bloxd.io", "https://www.crazygames.com/embed/bloxdhop-io", "multiplayer"],
  ["Four Colors (Uno)", "https://www.crazygames.com/embed/uno-online", "multiplayer"],
  ["Fortzone Battle Royale", "https://www.crazygames.com/embed/fortzone-battle-royale-xkd", "multiplayer"],
  ["Miniblox", "https://www.crazygames.com/embed/miniblox", "multiplayer"],
  ["BuildNow GG", "https://www.crazygames.com/embed/buildnow-gg", "multiplayer"],
  ["Shell Shockers", "https://www.crazygames.com/embed/shellshockersio", "multiplayer"],
  ["SkillWarz", "https://www.crazygames.com/embed/skillwarz", "multiplayer"],
  ["EvoWars.io", "https://www.crazygames.com/embed/evowarsio", "multiplayer"],
  ["Squid Game Online", "https://www.crazygames.com/embed/squid-game-online", "multiplayer"],
  ["CubeRealm.io", "https://www.crazygames.com/embed/cuberealm-io", "multiplayer"],
  ["8 Ball Pool MP", "https://www.crazygames.com/embed/8-ball-pool-billiards-multiplayer", "multiplayer"],
  ["Escape From Pizzeria", "https://www.crazygames.com/embed/escape-from-pizzeria", "multiplayer"],
  ["Cowz.io", "https://www.crazygames.com/embed/cowz-io", "multiplayer"],
  ["Bank Heist", "https://www.crazygames.com/embed/bank-heist", "multiplayer"],
  ["Golf Mania", "https://www.crazygames.com/embed/golf-mania", "multiplayer"],
  ["Poxel.io", "https://www.crazygames.com/embed/poxel-io", "multiplayer"],
  ["Survev.io", "https://www.crazygames.com/embed/survev", "multiplayer"],
  ["Ships 3D", "https://www.crazygames.com/embed/ships-3d", "multiplayer"],
  ["Tanks 3D", "https://www.crazygames.com/embed/tanks-3d", "multiplayer"],
  ["Mini Golf Club", "https://www.crazygames.com/embed/mini-golf-club", "multiplayer"],
  ["Pixel Warfare", "https://www.crazygames.com/embed/pixel-warfare", "multiplayer"],
  ["Kour.io", "https://www.crazygames.com/embed/kour-io", "multiplayer"],
  ["BLOCOPS", "https://www.crazygames.com/embed/blocops", "multiplayer"],
  ["Escape Prison MP", "https://www.crazygames.com/embed/escape-from-prison-multiplayer", "multiplayer"],
  ["TileMan.io", "https://www.crazygames.com/embed/tileman-io", "multiplayer"],
  ["WorldGuessr", "https://www.crazygames.com/embed/worldguessr", "multiplayer"],
  ["Crazy Guys", "https://www.crazygames.com/embed/crazy-guys", "multiplayer"],
  ["Mk48.io", "https://www.crazygames.com/embed/mk48-io", "multiplayer"],
  ["Chess Free", "https://www.crazygames.com/embed/chess-free", "multiplayer"],
  ["Kiomet", "https://www.crazygames.com/embed/kiomet-com", "multiplayer"],
  ["Brainrots.io", "https://www.crazygames.com/embed/italianbrainrotquiz-io", "multiplayer"],
  ["Doors Castle", "https://www.crazygames.com/embed/doors-castle", "multiplayer"],
  ["Mancala Classic", "https://www.crazygames.com/embed/mancala-classic", "multiplayer"],
  ["Gridpunk 3v3", "https://www.crazygames.com/embed/gridpunk---3v3-battle-royale", "multiplayer"],
  ["Kirka.io", "https://www.crazygames.com/embed/kirka-io", "multiplayer"],
  ["Race Clicker", "https://www.crazygames.com/embed/race-clicker-tap-tap-game", "multiplayer"],
  ["Connect 4 Online", "https://www.crazygames.com/embed/4-in-a-row-connected-multiplayer-online", "multiplayer"],
  ["Checkers Free", "https://www.crazygames.com/embed/checkers-free", "multiplayer"],
  ["Mazean", "https://www.crazygames.com/embed/mazean-com", "multiplayer"],
  ["Struckd 3D Creator", "https://www.crazygames.com/embed/struckd---3d-game-creator", "multiplayer"],
  ["War Brokers", "https://www.crazygames.com/embed/war-brokers-io", "multiplayer"],
  ["Goober Dash", "https://www.crazygames.com/embed/goober-dash", "multiplayer"],
  ["Vortex 9", "https://www.crazygames.com/embed/vortex-9-ubs", "multiplayer"],
  ["Eternal Siege", "https://www.crazygames.com/embed/eternal-siege", "multiplayer"],
  ["Ninja Parkour MP", "https://www.crazygames.com/embed/ninja-parkour-multiplayer", "multiplayer"],
  ["Street Fighter Sim", "https://www.crazygames.com/embed/street-fighter-simulator", "multiplayer"],
  ["Jump Guys", "https://www.crazygames.com/embed/jump-guys", "multiplayer"],
  ["Chess Online MP", "https://www.crazygames.com/embed/chess-online-multiplayer-game", "multiplayer"],
  ["Krunker", "https://www.crazygames.com/embed/krunker-io", "multiplayer"],
  ["Hazmob FPS", "https://www.crazygames.com/embed/hazmob-fps-online-shooter", "multiplayer"],
  ["Agar.io", "https://www.crazygames.com/embed/agario", "io"],
  ["Slither.io CG", "https://www.crazygames.com/embed/snake-io", "io"],
  ["Paper.io 2", "https://www.crazygames.com/embed/paper-io-2", "io"],
  ["Diep.io", "https://www.crazygames.com/embed/diepio", "io"],
  ["Mope.io", "https://www.crazygames.com/embed/mopeio", "io"],
  ["EvoWorld.io", "https://www.crazygames.com/embed/flyordieio", "io"],
  ["Taming.io", "https://www.crazygames.com/embed/taming-io", "io"],
  ["Voxiom.io", "https://www.crazygames.com/embed/voxiom-io", "io"],
  ["StarBlast", "https://www.crazygames.com/embed/starblastio", "io"],
  ["Holey.io", "https://www.crazygames.com/embed/holey-io-battle-royale", "io"],
  ["Cubes 2048.io", "https://www.crazygames.com/embed/cubes-2048-io", "io"],
  ["SimplyUp.io", "https://www.crazygames.com/embed/simplyup-io", "io"],
  ["Worms.Zone", "https://www.crazygames.com/embed/worms-zone", "io"],
  ["Gulper.io", "https://www.crazygames.com/embed/gulper-io", "io"],
  ["BattleDudes.io", "https://www.crazygames.com/embed/battledudes-io", "io"],
  ["Stabfish 2", "https://www.crazygames.com/embed/stabfish2-io-multiplayer", "io"],
  ["Worm Hunt", "https://www.crazygames.com/embed/worm-hunt", "io"],
  ["Little Big Snake", "https://www.crazygames.com/embed/little-big-snake-io", "io"],
  ["Lordz.io", "https://www.crazygames.com/embed/lordzio", "io"],
  ["MiniGiants.io", "https://www.crazygames.com/embed/minigiants-io", "io"],
  ["digdig.io", "https://www.crazygames.com/embed/digdig-io", "io"],
  ["Sploop.io", "https://www.crazygames.com/embed/sploop-io", "io"],
  ["WarCall.io", "https://www.crazygames.com/embed/warcall-io", "io"],
  ["Archer Clash", "https://www.crazygames.com/embed/archer-clash-ftj", "io"],
  ["BrutalMania.io", "https://www.crazygames.com/embed/brutalmania-io", "io"],
  ["EpicBallz.io", "https://www.crazygames.com/embed/epicballz-io", "io"],
  ["Skribbl.io", "https://www.crazygames.com/embed/skribblio", "io"],
  ["Stabfish.io", "https://www.crazygames.com/embed/stabfish-io", "io"],
  ["Tzared", "https://www.crazygames.com/embed/tzared", "io"],
  ["Mine-Craft.io", "https://www.crazygames.com/embed/mine-craft-io", "io"],
  ["Gold Rush Arena", "https://www.crazygames.com/embed/gold-rush-arena", "io"],
  ["Rocket Bot Royale", "https://www.crazygames.com/embed/rocket-bot-royale", "io"],
  ["STUG", "https://www.crazygames.com/embed/stug", "io"],
  ["Deadshot.io", "https://www.crazygames.com/embed/deadshot-io", "io"],
  ["1v1.lol", "https://www.crazygames.com/embed/1v1-lol", "io"],
  ["Build Royale", "https://www.crazygames.com/embed/buildroyale-io", "io"],
  ["Ducklings", "https://www.crazygames.com/embed/ducklings", "io"],
  ["Zombs Royale", "https://www.crazygames.com/embed/zombsroyaleio", "io"],
  ["LOL Beans", "https://www.crazygames.com/embed/lolbeans-io", "io"],
  ["Narrow One", "https://www.crazygames.com/embed/narrow-one", "io"],
  ["Bonk.io", "https://www.crazygames.com/embed/bonkio", "io"],
  ["FrontWars.io", "https://www.crazygames.com/embed/frontwars-io", "io"],
  ["Growden.io", "https://www.crazygames.com/embed/grow-a-garden---growden-io", "io"],
  ["Overtide.io", "https://www.crazygames.com/embed/overtide-io", "io"],
  ["GoBattle.io", "https://www.crazygames.com/embed/gobattleio", "io"],
  ["TheLast.io", "https://www.crazygames.com/embed/thelast-io", "io"],
  ["Raidfield 2", "https://www.crazygames.com/embed/raidfield-2-pjc", "io"],
  ["Noob Snake 2048", "https://www.crazygames.com/embed/noob-snake-2048", "io"],
  ["King.io World War", "https://www.crazygames.com/embed/king-io-world-war", "io"],
  ["Jelly Dash", "https://www.crazygames.com/embed/jelly-dash-uki", "io"],
  ["Simply Prop Hunt", "https://www.crazygames.com/embed/simply-prop-hunt", "io"],
  ["Bit Gun.io", "https://www.crazygames.com/embed/bit-gun-io", "io"],
  ["Slope", "https://www.crazygames.com/embed/slope", "arcade"],
];

// Convert title to folder name
function toFolderName(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Generate placeholder SVG for thumbnail
const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 225" fill="none">
  <rect width="400" height="225" fill="#0a0a1a"/>
  <rect x="1" y="1" width="398" height="223" rx="12" stroke="rgba(255,255,255,0.1)" stroke-width="2" fill="none"/>
  <circle cx="200" cy="100" r="40" fill="rgba(56,189,248,0.15)" stroke="rgba(56,189,248,0.3)" stroke-width="2"/>
  <path d="M188 85 L220 100 L188 115 Z" fill="rgba(56,189,248,0.8)"/>
  <text x="200" y="170" text-anchor="middle" fill="rgba(255,255,255,0.4)" font-family="system-ui" font-size="14">Add thumbnail.png</text>
</svg>`;

async function generate() {
  console.log('Generating game folders...\n');
  
  // Dedupe by URL
  const seen = new Set();
  const games = RAW.filter(([_, url]) => {
    if (seen.has(url)) return false;
    seen.add(url);
    return true;
  });
  
  const registry = [];
  let created = 0;
  let skipped = 0;
  
  for (const [title, url, category] of games) {
    const folder = toFolderName(title);
    const folderPath = join(GAMES_DIR, folder);
    
    // Skip if already exists
    if (existsSync(folderPath)) {
      skipped++;
      registry.push(folder);
      continue;
    }
    
    // Create folder
    await mkdir(folderPath, { recursive: true });
    
    // Write game.json
    const config = {
      title,
      url,
      category,
      thumbnail: "thumbnail.png" // Optional - delete this line if no thumbnail
    };
    await writeFile(
      join(folderPath, 'game.json'),
      JSON.stringify(config, null, 2)
    );
    
    // Write placeholder SVG as thumbnail hint
    await writeFile(
      join(folderPath, 'thumbnail-placeholder.svg'),
      PLACEHOLDER_SVG
    );
    
    registry.push(folder);
    created++;
    process.stdout.write(`\rCreated: ${created} | Skipped: ${skipped}`);
  }
  
  // Update registry
  const registryContent = `// Auto-generated list of game folders
// Add new games by creating a folder with game.json and adding its name here
const GAME_FOLDERS = [
${registry.map(f => `  "${f}"`).join(',\n')}
];
`;
  await writeFile(join(GAMES_DIR, '_registry.js'), registryContent);
  
  console.log(`\n\nDone! Created ${created} game folders, skipped ${skipped} existing.`);
  console.log(`Total games: ${registry.length}`);
  console.log(`\nTo add a custom thumbnail, replace thumbnail-placeholder.svg with thumbnail.png in any game folder.`);
}

generate().catch(console.error);
