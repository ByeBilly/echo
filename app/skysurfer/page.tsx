"use client"

import { useState } from "react"
import { SkySurferSimulator } from "@/components/skysurfer-simulator"
import { DailyChallenges } from "@/components/daily-challenges"
import { Leaderboard } from "@/components/leaderboard"

export default function SkySurferPage() {
  const [currentView, setCurrentView] = useState<"simulator" | "challenges" | "leaderboard">("simulator")

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-sky-400 via-blue-400 to-cyan-300">
      {/* Navigation */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 text-white p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">SkySurfer</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentView("simulator")}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                currentView === "simulator" ? "bg-blue-600 text-white" : "bg-slate-700 text-gray-300 hover:bg-slate-600"
              }`}
            >
              Fly
            </button>
            <button
              onClick={() => setCurrentView("challenges")}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                currentView === "challenges"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-gray-300 hover:bg-slate-600"
              }`}
            >
              Challenges
            </button>
            <button
              onClick={() => setCurrentView("leaderboard")}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                currentView === "leaderboard"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-gray-300 hover:bg-slate-600"
              }`}
            >
              Leaderboard
            </button>
          </div>
        </div>
      </div>

      {currentView === "simulator" && <SkySurferSimulator />}

      {currentView === "challenges" && (
        <div className="pt-24 pb-8 px-4">
          <div className="max-w-6xl mx-auto">
            <DailyChallenges />
          </div>
        </div>
      )}

      {currentView === "leaderboard" && (
        <div className="pt-24 pb-8 px-4">
          <div className="max-w-6xl mx-auto">
            <Leaderboard />
          </div>
        </div>
      )}
    </div>
  )
}
