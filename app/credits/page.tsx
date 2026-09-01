"use client"

import { ArrowLeft, Globe, Gamepad2 } from "lucide-react"
import Link from "next/link"

// Extract unique hosts from games data
const gameHosts = [
  {
    name: "CrazyGames",
    url: "https://www.crazygames.com",
    games: ["Sky Riders", "Smash Karts", "Racing Limits", "Sandbox City", "Night City Racing", "Rally Racer Dirt", "Stunt Paradise", "Doodle Road", "Parking Jam", "Traffic Cop 3D", "Demolition Derby 3", "Super Star Car", "PolyTrack", "Evolution Factor", "Draw Crash Race", "Assault Bots", "Drift Hunters", "Offroad Island", "Mr. Racer", "Boom Karts", "Super Crime Steel War Hero", "Crazy Motorcycle", "Downtown 1930s Mafia", "Merge & Construct", "Ultimate Flying Car", "Gearshift One", "GT Cars Mega Ramps", "Xtreme City Drifting", "Demolition Derby 2", "Monster Cars Simulator", "Grand Cyber City", "Crazy Grand Prix", "City Car Driving Online", "ATV Ultimate Offroad", "Truck Driving Simulator", "Mad Town Andreas", "Russian Car Driver ZIL", "Racing Builder", "Drift Boss", "Parking Fury 3D", "Derby Crash 4", "Grand Action Simulator NY", "Ultimate Flying Car 2", "Vehicle Masters", "Crazy Stunt Cars MP", "4x4 Offroader", "Highway Racer", "Madalin Cars Multiplayer", "Truck Simulator Russia", "Stunt Master", "Bouncy Motors", "Free Rally Vice", "Mini-Caps Arena", "Hyper Cars Ramp Crash", "Rovercraft", "Derby Crash", "Madalin Stunt Cars 2", "Wrong Way", "Rush Hour", "Eggy Car", "MX Offroad Master", "Traffic Rider", "Super Bike Champion", "Moto X3M CG", "Paper Boy Race", "Riders Downhill Racing", "Super MX Last Season", "Paper Delivery Boy", "Moto X3M 5 Pool Party", "Dragon Vice City", "Moto X3M 4 Winter", "Sunset Bike Racing", "Trial Mania", "Xtreme Moto Mayhem", "Moto X3M 6 Spooky Land", "GoKarts.io", "3D Moto Simulator 2", "SCAR", "MotoCross Riders", "Super MX Champion", "Bike Jump", "Airborne Motocross", "Trial Bike Epic Stunts", "Ramp Bike Jumping", "Wheelie Up", "Dirt Bike Mad Skills", "Crazy Moto Stunts", "Moto Rider 3D", "Moto Racing Club", "Hill Climb Moto Bike", "Where's My Pizza?", "Bike Stunts 3D", "Trials Ice Ride", "Blocky Trials", "Stunt Dirt Bike", "Cycle Extreme", "Motocross Dirt Bike", "Trials Ride", "Crazy MotoX MP", "Fury Bike Rider", "Super Fast Driver", "Stunt Mania 3D", "Free Rider", "Stickman Moto Race", "MotoGP Motocross Race", "Crazy MX", "Moto Maniac 3", "Cartoon Moto Stunt", "Night Rider", "Bike Trial Forest", "Free Rider 2", "Stickman Zombie Motorcycle", "Switch Wheel Race", "Bloxd.io", "Four Colors (Uno)", "Fortzone Battle Royale", "Miniblox", "BuildNow GG", "Shell Shockers", "SkillWarz", "EvoWars.io", "Squid Game Online", "CubeRealm.io", "8 Ball Pool MP", "Escape From Pizzeria", "Cowz.io", "Bank Heist", "Golf Mania", "Poxel.io", "Survev.io", "Ships 3D", "Tanks 3D", "Mini Golf Club", "Pixel Warfare", "Kour.io", "BLOCOPS", "Escape Prison MP", "TileMan.io", "WorldGuessr", "Crazy Guys", "Mk48.io", "Chess Free", "Kiomet", "Brainrots.io", "Doors Castle"]
  },
    {
    name: "Selenite CDN",
    url: "https://selenite1.freetls.fastly.net",
    games: ["GTA Vice City"]
  },
  {
    name: "OnlineGames.io",
    url: "https://www.onlinegames.io",
    games: ["Highway Cars"]
  },
  {
    name: "Unblocked Games S3",
    url: "https://unblocked-games.s3.amazonaws.com",
    games: ["Moto X3M Winter"]
  },
  {
    name: "Krunker.io",
    url: "https://krunker.io",
    games: ["Krunker.io"]
  },
  {
    name: "Play2048.co",
    url: "https://play2048.co",
    games: ["2048"]
  },
  {
    name: "LittleAlchemy.com",
    url: "https://littlealchemy.com",
    games: ["Little Alchemy"]
  },
  {
    name: "World's Biggest Pac-Man",
    url: "https://worldsbiggestpacman.com",
    games: ["World's Biggest Pac-Man"]
  },
  {
    name: "Slither.io",
    url: "https://slither.io",
    games: ["Slither.io"]
  },
  {
    name: "Paper.io",
    url: "https://paper-io.com",
    games: ["Paper.io"]
  },
  {
    name: "HexGL",
    url: "http://hexgl.bkcore.com",
    games: ["HexGL"]
  },
  {
    name: "Line Rider",
    url: "https://www.linerider.com",
    games: ["Line Rider"]
  },
  {
    name: "Cookie Clicker",
    url: "https://orteil.dashnet.org",
    games: ["Cookie Clicker"]
  },
  {
    name: "FreeAsteroids.org",
    url: "https://www.freeasteroids.org",
    games: ["Asteroids", "Asteroids Classic"]
  },
  {
    name: "SpaceInvaders.de",
    url: "https://spaceinvaders.de",
    games: ["Space Invaders", "Space Invaders Classic"]
  },
  {
    name: "Pong-2.com",
    url: "https://pong-2.com",
    games: ["Pong", "Pong Classic"]
  },
  {
    name: "BreakoutGame.org",
    url: "https://www.breakoutgame.org",
    games: ["Breakout", "Breakout Classic"]
  },
  {
    name: "Frogger Classic",
    url: "https://froggerclassic.appspot.com",
    games: ["Frogger", "Frogger Classic"]
  },
  ]

export default function CreditsPage() {
  return (
    <div className="min-h-screen bg-[#0c0c0f] text-[#f4f4f5]">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(167,139,250,0.03)] via-transparent to-[rgba(167,139,250,0.01)]" />
        <div className="absolute inset-0 bg-grid opacity-20" />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-[rgba(255,255,255,0.06)] backdrop-blur-xl bg-[rgba(12,12,15,0.8)]">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link 
                href="/"
                className="flex items-center gap-2 text-[#a78bfa] hover:text-[#b8a5fa] transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Back to Games</span>
              </Link>
              
              <div className="flex items-center gap-2">
                <Gamepad2 className="h-5 w-5 text-[#a78bfa]" />
                <h1 className="text-xl font-bold text-[#e4e4f0]">Credits</h1>
              </div>
              
              <div className="w-20" /> {/* Spacer for center alignment */}
            </div>
          </div>
        </div>

        {/* Credits Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Introduction */}
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-[#e4e4f0] mb-4">Game Hosting Credits</h2>
            <p className="text-[#71717a] max-w-2xl mx-auto">
              All games on this platform are hosted and provided by their respective developers and platforms. 
              We extend our gratitude to these amazing game hosting services for making these games available to play.
            </p>
          </div>

          {/* Game Hosts Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {gameHosts.map((host, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(24,24,28,0.6)] backdrop-blur-xl transition-all duration-300 hover:border-[rgba(167,139,250,0.3)] hover:shadow-[0_0_40px_rgba(167,139,250,0.15)]"
              >
                {/* Header */}
                <div className="p-6 border-b border-[rgba(255,255,255,0.06)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-[#e4e4f0] group-hover:text-[#a78bfa] transition-colors">
                        {host.name}
                      </h3>
                      <a
                        href={host.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#6b6b80] hover:text-[#a78bfa] transition-colors mt-1"
                      >
                        <Globe className="h-3 w-3" />
                        {host.url}
                      </a>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-[rgba(167,139,250,0.1)] flex items-center justify-center">
                      <Gamepad2 className="h-6 w-6 text-[#a78bfa]" />
                    </div>
                  </div>
                </div>

                {/* Games Count */}
                <div className="p-4">
                  <div className="text-sm text-[#6b6b80] mb-2">
                    {host.games.length} game{host.games.length !== 1 ? 's' : ''} hosted
                  </div>
                  
                  {/* Sample Games */}
                  <div className="flex flex-wrap gap-1">
                    {host.games.slice(0, 6).map((game, gameIndex) => (
                      <span
                        key={gameIndex}
                        className="px-2 py-1 text-xs rounded-full bg-[rgba(167,139,250,0.1)] text-[#a78bfa]"
                      >
                        {game}
                      </span>
                    ))}
                    {host.games.length > 6 && (
                      <span className="px-2 py-1 text-xs rounded-full bg-[rgba(255,255,255,0.05)] text-[#6b6b80]">
                        +{host.games.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Note */}
          <div className="mt-16 text-center">
            <div className="max-w-2xl mx-auto p-6 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(24,24,28,0.4)] backdrop-blur-xl">
              <h3 className="text-lg font-semibold text-[#e4e4f0] mb-3">Disclaimer</h3>
              <p className="text-sm text-[#71717a] leading-relaxed">
                This platform serves as a game aggregator and does not claim ownership of any games. 
                All games remain the property of their respective developers and hosting platforms. 
                If you are a game developer and would like your game removed or have any questions, 
                please contact us.
              </p>
            </div>
          </div>

          {/* Attribution */}
          <div className="mt-8 text-center">
            <p className="text-xs text-[#52525b]">
              Made with ❤️ for the gaming community
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
