"use client"

import { useState } from "react"
import { Piano } from "./piano-keyboard"
import { DrumMachine } from "./drum-machine"
import { GameEngine } from "./game-engine"
import { ModeToggle } from "./mode-toggle"

export function MusicPlayground() {
  const [isKidsMode, setIsKidsMode] = useState(true)
  const [currentTab, setCurrentTab] = useState<"piano" | "drums" | "games">("piano")

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Mode Toggle */}
      <div className="flex justify-between items-center mb-8">
        <h1
          className={`text-4xl md:text-5xl font-bold ${isKidsMode ? "text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-purple-400 to-pink-400" : "text-white"}`}
        >
          {isKidsMode ? "🎵 Music Playground" : "Music Studio"}
        </h1>
        <ModeToggle isKidsMode={isKidsMode} setIsKidsMode={setIsKidsMode} />
      </div>

      {/* Tab Navigation */}
      <div className={`flex gap-4 mb-8 ${isKidsMode ? "justify-center" : ""}`}>
        {["piano", "drums", "games"].map((tab) => (
          <button
            key={tab}
            onClick={() => setCurrentTab(tab as any)}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              currentTab === tab
                ? isKidsMode
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-110"
                  : "bg-blue-600 text-white"
                : isKidsMode
                  ? "bg-white/20 text-white hover:bg-white/30"
                  : "bg-slate-700 text-gray-300 hover:bg-slate-600"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div
        className={`rounded-2xl p-6 md:p-8 ${isKidsMode ? "bg-white/10 backdrop-blur-md" : "bg-slate-800/50 backdrop-blur-md"}`}
      >
        {currentTab === "piano" && <Piano isKidsMode={isKidsMode} />}
        {currentTab === "drums" && <DrumMachine isKidsMode={isKidsMode} />}
        {currentTab === "games" && <GameEngine isKidsMode={isKidsMode} />}
      </div>
    </div>
  )
}
