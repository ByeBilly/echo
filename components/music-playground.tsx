"use client"

import { useState } from "react"
import { Piano } from "./piano-keyboard"
import { DrumMachine } from "./drum-machine"
import { GameEngine } from "./game-engine"
import { ModeToggle } from "./mode-toggle"
import { RecordingManager } from "./recording-manager"
import { ChordLibrary } from "./chord-library"
import { Metronome } from "./metronome"
import { StatsDashboard } from "./stats-dashboard"

export function MusicPlayground() {
  const [isKidsMode, setIsKidsMode] = useState(true)
  const [currentTab, setCurrentTab] = useState<
    "piano" | "drums" | "games" | "recordings" | "chords" | "metronome" | "stats"
  >("piano")
  const recordingManager = RecordingManager({})
  const [recordings, setRecordings] = useState<any[]>([])

  const tabs = isKidsMode
    ? ["piano", "drums", "games", "chords", "metronome", "stats"]
    : ["piano", "drums", "games", "chords", "metronome", "recordings", "stats"]

  const getTabLabel = (tab: string) => {
    const labels: { [key: string]: string } = {
      recordings: "🎤 Recordings",
      chords: "🎼 Chords",
      metronome: "⏱ Metronome",
      stats: "📊 Stats",
      piano: "Piano",
      drums: "Drums",
      games: "Games",
    }
    return labels[tab] || tab.charAt(0).toUpperCase() + tab.slice(1)
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header with Mode Toggle */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1
          className={`text-4xl md:text-5xl font-bold ${
            isKidsMode
              ? "text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-purple-400 to-pink-400"
              : "text-white"
          }`}
        >
          {isKidsMode ? "🎵 Music Playground" : "Music Studio"}
        </h1>
        <ModeToggle isKidsMode={isKidsMode} setIsKidsMode={setIsKidsMode} />
      </div>

      {/* Tab Navigation - Scrollable */}
      <div className={`flex gap-2 mb-8 overflow-x-auto pb-2 ${isKidsMode ? "justify-center" : ""}`}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setCurrentTab(tab as any)}
            className={`
              px-4 md:px-6 py-3 rounded-lg font-bold transition-all whitespace-nowrap
              ${
                currentTab === tab
                  ? isKidsMode
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-110"
                    : "bg-blue-600 text-white"
                  : isKidsMode
                    ? "bg-white/20 text-white hover:bg-white/30"
                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
              }
            `}
          >
            {getTabLabel(tab)}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div
        className={`rounded-2xl p-6 md:p-8 ${
          isKidsMode ? "bg-white/10 backdrop-blur-md" : "bg-slate-800/50 backdrop-blur-md"
        }`}
      >
        {currentTab === "piano" && <Piano isKidsMode={isKidsMode} />}
        {currentTab === "drums" && <DrumMachine isKidsMode={isKidsMode} />}
        {currentTab === "games" && <GameEngine isKidsMode={isKidsMode} />}
        {currentTab === "chords" && <ChordLibrary isKidsMode={isKidsMode} />}
        {currentTab === "metronome" && <Metronome isKidsMode={isKidsMode} />}
        {currentTab === "stats" && <StatsDashboard isKidsMode={isKidsMode} />}
        {currentTab === "recordings" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className={`text-2xl font-bold mb-4 ${isKidsMode ? "text-white" : "text-gray-300"}`}>
                📋 Your Recordings
              </h2>
            </div>
            <div className="text-center text-gray-400">
              Recording infrastructure ready. Practice with Piano, Drums, and Metronome!
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
