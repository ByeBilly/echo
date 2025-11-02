"use client"

import { useState, useRef } from "react"
import { SkySurferSimulator } from "@/components/skysurfer-simulator"
import { DailyChallenges } from "@/components/daily-challenges"
import { Leaderboard } from "@/components/leaderboard"
import { ViralSharing, type ShareableSession } from "@/components/viral-sharing"

export default function SkySurferPage() {
  const [currentView, setCurrentView] = useState<"simulator" | "challenges" | "leaderboard">("simulator")
  const [showShareModal, setShowShareModal] = useState(false)
  const [lastSession, setLastSession] = useState<ShareableSession | null>(null)
  const sessionDataRef = useRef<{
    startTime: number
    location: string
    vehicle: string
    maxAltitude: number
    maxSpeed: number
    distance: number
  } | null>(null)

  const handleSessionEnd = (sessionData: any) => {
    const duration = (Date.now() - sessionDataRef.current!.startTime) / 1000
    const shareSession: ShareableSession = {
      location: sessionData.location,
      vehicle: sessionData.vehicle,
      altitude: sessionData.maxAltitude,
      speed: sessionData.maxSpeed,
      timestamp: new Date(),
      distance: sessionData.distance,
      duration: duration,
    }
    setLastSession(shareSession)
    setShowShareModal(true)

    console.log("[v0] Session ended:", shareSession)
  }

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

      {currentView === "simulator" && <SkySurferSimulator onSessionEnd={handleSessionEnd} />}

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

      {showShareModal && lastSession && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-4">Amazing Flight!</h2>
            <p className="text-gray-300 mb-6">
              You flew for {lastSession.duration.toFixed(0)} seconds and reached {lastSession.altitude.toFixed(0)} ft!
            </p>
            <ViralSharing session={lastSession} />
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
