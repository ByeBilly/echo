"use client"

import { useEffect, useState } from "react"

export interface Challenge {
  id: string
  title: string
  description: string
  location: string
  objective: string
  reward: number
  difficulty: "easy" | "medium" | "hard"
}

const DAILY_CHALLENGES: Challenge[] = [
  {
    id: "nyc-heights",
    title: "NYC Heights Challenge",
    description: "Fly over New York City",
    location: "New York",
    objective: "Reach 1500 ft altitude",
    reward: 100,
    difficulty: "medium",
  },
  {
    id: "tokyo-rush",
    title: "Tokyo Rush",
    description: "Navigate Tokyo's skyline",
    location: "Tokyo",
    objective: "Maintain 75+ mph for 2 minutes",
    reward: 150,
    difficulty: "hard",
  },
  {
    id: "london-tour",
    title: "London Tower Tour",
    description: "Fly around London's landmarks",
    location: "London",
    objective: "Complete full flight circuit",
    reward: 80,
    difficulty: "easy",
  },
  {
    id: "paris-haute",
    title: "Paris Haute Vol",
    description: "High altitude flight over Paris",
    location: "Paris",
    objective: "Reach maximum altitude",
    reward: 200,
    difficulty: "hard",
  },
  {
    id: "la-sunset",
    title: "LA Sunset Flight",
    description: "Watch sunset over Los Angeles",
    location: "Los Angeles",
    objective: "Fly for 5 minutes straight",
    reward: 120,
    difficulty: "medium",
  },
]

export function DailyChallenges({ onChallengeSelect }: { onChallengeSelect?: (challenge: Challenge) => void }) {
  const [today, setToday] = useState<Challenge | null>(null)
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([])

  useEffect(() => {
    // Select daily challenge based on date
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    const challenge = DAILY_CHALLENGES[dayOfYear % DAILY_CHALLENGES.length]
    setToday(challenge)

    // Load completed challenges from localStorage
    const saved = localStorage.getItem("completedChallenges")
    if (saved) {
      setCompletedChallenges(JSON.parse(saved))
    }
  }, [])

  const completeChallenge = (challengeId: string) => {
    const updated = [...completedChallenges, challengeId]
    setCompletedChallenges(updated)
    localStorage.setItem("completedChallenges", JSON.stringify(updated))
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-400"
      case "medium":
        return "text-yellow-400"
      case "hard":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Daily Challenges</h2>

      {today && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">{today.title}</h3>
              <p className="text-white/80">{today.description}</p>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${getDifficultyColor(today.difficulty)}`}>{today.reward} pts</div>
              <div className={`text-sm font-bold ${getDifficultyColor(today.difficulty)} capitalize`}>
                {today.difficulty}
              </div>
            </div>
          </div>

          <div className="bg-black/20 p-4 rounded-lg mb-4">
            <div className="text-sm text-white/80 mb-2">Objective:</div>
            <div className="text-lg font-bold text-white">{today.objective}</div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                onChallengeSelect?.(today)
                completeChallenge(today.id)
              }}
              className="flex-1 px-4 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-gray-100 transition-all"
            >
              Start Challenge
            </button>
            {completedChallenges.includes(today.id) && (
              <div className="px-4 py-3 bg-green-500 text-white rounded-lg font-bold">Completed!</div>
            )}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-bold text-white mb-4">Other Challenges</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DAILY_CHALLENGES.filter((c) => c.id !== today?.id).map((challenge) => (
            <div key={challenge.id} className="bg-slate-700/50 p-4 rounded-lg hover:bg-slate-600/50 transition-all">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-white">{challenge.title}</h4>
                <div className={`text-sm font-bold ${getDifficultyColor(challenge.difficulty)} capitalize`}>
                  {challenge.difficulty}
                </div>
              </div>
              <p className="text-sm text-gray-300 mb-3">{challenge.objective}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">{challenge.location}</span>
                <span className="text-yellow-400 font-bold">{challenge.reward} pts</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
