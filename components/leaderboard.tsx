"use client"

import { useState } from "react"

export interface LeaderboardEntry {
  rank: number
  player: string
  location: string
  score: number
  vehicle: string
  flightTime: number
}

const SAMPLE_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, player: "SkyKing_Pro", location: "Tokyo", score: 9850, vehicle: "Sport Racer", flightTime: 156 },
  { rank: 2, player: "CloudWalker", location: "New York", score: 9420, vehicle: "Luxury Cruiser", flightTime: 143 },
  { rank: 3, player: "AltitudeMaster", location: "Paris", score: 8950, vehicle: "Sport Racer", flightTime: 128 },
  { rank: 4, player: "FlyingAce", location: "London", score: 8720, vehicle: "Cargo Hauler", flightTime: 115 },
  { rank: 5, player: "SkySurfer_Elite", location: "Los Angeles", score: 8350, vehicle: "Sport Racer", flightTime: 109 },
  { rank: 6, player: "VirtualPilot", location: "New York", score: 7890, vehicle: "Luxury Cruiser", flightTime: 98 },
  { rank: 7, player: "SkyExplorer", location: "Tokyo", score: 7560, vehicle: "Cargo Hauler", flightTime: 92 },
  { rank: 8, player: "CityFlyer", location: "London", score: 7210, vehicle: "Sport Racer", flightTime: 85 },
]

export function Leaderboard() {
  const [timeFrame, setTimeFrame] = useState<"today" | "week" | "all-time">("all-time")

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Global Leaderboard</h2>
        <div className="flex gap-2">
          {["today", "week", "all-time"].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeFrame(tf as any)}
              className={`px-3 py-1 rounded-lg font-bold text-sm transition-all ${
                timeFrame === tf ? "bg-blue-600 text-white" : "bg-slate-700 text-gray-300 hover:bg-slate-600"
              }`}
            >
              {tf === "all-time" ? "All Time" : tf.charAt(0).toUpperCase() + tf.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {SAMPLE_LEADERBOARD.map((entry) => (
          <div
            key={entry.rank}
            className="flex items-center justify-between p-4 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-all"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center font-bold text-white">
                {entry.rank}
              </div>
              <div className="flex-1">
                <div className="font-bold text-white">{entry.player}</div>
                <div className="text-sm text-gray-400">
                  {entry.vehicle} • {entry.location}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{entry.score}</div>
              <div className="text-xs text-gray-400">{entry.flightTime} min</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
