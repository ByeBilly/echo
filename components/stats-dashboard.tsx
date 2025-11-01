"use client"

import { useEffect, useState } from "react"
import { ProgressTracker, type UserStats } from "./progress-tracker"

export function StatsDashboard({ isKidsMode }: { isKidsMode: boolean }) {
  const tracker = ProgressTracker()
  const [stats, setStats] = useState<UserStats>(tracker.stats)

  useEffect(() => {
    setStats(tracker.stats)
  }, [tracker.stats])

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    return `${hours}h ${mins}m`
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className={`text-2xl font-bold mb-4 ${isKidsMode ? "text-white" : "text-gray-300"}`}>📊 Your Progress</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Practice Time */}
        <div className={`p-6 rounded-xl ${isKidsMode ? "bg-purple-500/20" : "bg-slate-700/50"}`}>
          <div className="text-gray-400 text-sm mb-2">Total Practice Time</div>
          <div className="text-4xl font-bold text-white">{formatTime(stats.totalPracticeTime)}</div>
          <div className="mt-4 bg-slate-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
              style={{ width: `${tracker.progressPercentage}%` }}
            />
          </div>
          <div className="text-xs text-gray-400 mt-2">
            {Math.floor(tracker.progressPercentage)}% towards 100 hour milestone
          </div>
        </div>

        {/* Practice Sessions */}
        <div className={`p-6 rounded-xl ${isKidsMode ? "bg-blue-500/20" : "bg-slate-700/50"}`}>
          <div className="text-gray-400 text-sm mb-2">Practice Sessions</div>
          <div className="text-4xl font-bold text-white">{stats.totalPracticeSessions}</div>
          <div className="text-gray-400 text-sm mt-4">Average: {formatTime(stats.averageSessionTime)}</div>
        </div>

        {/* Longest Session */}
        <div className={`p-6 rounded-xl ${isKidsMode ? "bg-green-500/20" : "bg-slate-700/50"}`}>
          <div className="text-gray-400 text-sm mb-2">Longest Session</div>
          <div className="text-4xl font-bold text-white">{formatTime(stats.longestSession)}</div>
          <div className="text-gray-400 text-sm mt-4">Keep it up!</div>
        </div>

        {/* Recordings Created */}
        <div className={`p-6 rounded-xl ${isKidsMode ? "bg-pink-500/20" : "bg-slate-700/50"}`}>
          <div className="text-gray-400 text-sm mb-2">Recordings Created</div>
          <div className="text-4xl font-bold text-white">{stats.recordingsCreated}</div>
          <div className="text-gray-400 text-sm mt-4">Keep recording!</div>
        </div>
      </div>

      {/* Achievements */}
      <div className={`p-6 rounded-xl ${isKidsMode ? "bg-white/10" : "bg-slate-900/50"}`}>
        <h3 className="text-xl font-bold text-white mb-4">🏆 Achievements</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tracker.achievements.map((achievement) => {
            const isUnlocked = tracker.unlockedAchievements.includes(achievement.id)
            return (
              <div
                key={achievement.id}
                className={`
                  p-4 rounded-lg text-center transition-all
                  ${
                    isUnlocked
                      ? isKidsMode
                        ? "bg-gradient-to-br from-yellow-400 to-orange-400"
                        : "bg-yellow-600"
                      : "bg-slate-700 opacity-50"
                  }
                `}
              >
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <div className="text-xs font-bold text-white">{achievement.name}</div>
                <div className="text-xs text-white/70 mt-1">{achievement.description}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Chords Mastered */}
      {stats.chordsMastered.length > 0 && (
        <div className={`p-6 rounded-xl ${isKidsMode ? "bg-white/10" : "bg-slate-900/50"}`}>
          <h3 className="text-xl font-bold text-white mb-4">🎼 Chords Mastered</h3>
          <div className="flex flex-wrap gap-2">
            {stats.chordsMastered.map((chord) => (
              <span key={chord} className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold">
                {chord}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
