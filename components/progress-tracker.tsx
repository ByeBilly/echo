"use client"

import { useEffect, useState } from "react"

export interface UserStats {
  totalPracticeSessions: number
  totalPracticeTime: number
  longestSession: number
  averageSessionTime: number
  chordsMastered: string[]
  recordingsCreated: number
  lastPracticeDate: string
  achievementLevel: number
}

const ACHIEVEMENTS = [
  { id: 1, name: "First Note", description: "Play your first note", icon: "🎵" },
  { id: 2, name: "Piano Master", description: "Play 50 piano notes", icon: "🎹" },
  { id: 3, name: "Rhythm Keeper", description: "Use metronome for 10 minutes", icon: "⏱" },
  { id: 4, name: "Chord Learner", description: "Learn 5 different chords", icon: "🎼" },
  { id: 5, name: "Drum Beat Maker", description: "Create a drum sequence", icon: "🥁" },
  { id: 6, name: "Recording Artist", description: "Create 5 recordings", icon: "🎤" },
  { id: 7, name: "Week Warrior", description: "Practice 7 days in a row", icon: "⭐" },
  { id: 8, name: "Music Virtuoso", description: "Practice for 100 hours total", icon: "👑" },
]

export function ProgressTracker() {
  const [stats, setStats] = useState<UserStats>({
    totalPracticeSessions: 0,
    totalPracticeTime: 0,
    longestSession: 0,
    averageSessionTime: 0,
    chordsMastered: [],
    recordingsCreated: 0,
    lastPracticeDate: new Date().toLocaleDateString(),
    achievementLevel: 1,
  })

  const [unlockedAchievements, setUnlockedAchievements] = useState<number[]>([])

  useEffect(() => {
    // Load stats from localStorage
    const saved = localStorage.getItem("musicStats")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setStats(parsed)
      } catch (e) {
        console.error("Failed to load stats:", e)
      }
    }

    // Load achievements from localStorage
    const savedAchievements = localStorage.getItem("unlockedAchievements")
    if (savedAchievements) {
      try {
        setUnlockedAchievements(JSON.parse(savedAchievements))
      } catch (e) {
        console.error("Failed to load achievements:", e)
      }
    }
  }, [])

  const updateStats = (newStats: Partial<UserStats>) => {
    const updated = { ...stats, ...newStats }
    setStats(updated)
    localStorage.setItem("musicStats", JSON.stringify(updated))
  }

  const unlockAchievement = (achievementId: number) => {
    if (!unlockedAchievements.includes(achievementId)) {
      const updated = [...unlockedAchievements, achievementId]
      setUnlockedAchievements(updated)
      localStorage.setItem("unlockedAchievements", JSON.stringify(updated))
    }
  }

  const progressPercentage = Math.min((stats.totalPracticeTime / 100) * 100, 100)

  return {
    stats,
    updateStats,
    unlockedAchievements,
    unlockAchievement,
    achievements: ACHIEVEMENTS,
    progressPercentage,
  }
}
