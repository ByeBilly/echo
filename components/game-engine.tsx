"use client"

import { useEffect, useRef, useState } from "react"

let Tone: any = null

type Game = "twinkle" | "mary" | "hotcross" | null

const GAMES = {
  twinkle: {
    name: "Twinkle Twinkle Little Star",
    notes: ["C4", "C4", "G4", "A4", "G4", "F4", "E4", "D4", "C4"],
    colors: ["red", "red", "blue", "purple", "blue", "green", "yellow", "orange", "red"],
  },
  mary: {
    name: "Mary Had a Little Lamb",
    notes: ["E4", "D4", "C4", "D4", "E4", "E4", "E4", "D4", "D4", "D4", "E4", "G4", "G4"],
    colors: [
      "yellow",
      "orange",
      "red",
      "orange",
      "yellow",
      "yellow",
      "yellow",
      "orange",
      "orange",
      "orange",
      "yellow",
      "blue",
      "blue",
    ],
  },
  hotcross: {
    name: "Hot Cross Buns",
    notes: ["G4", "E4", "F4", "G4", "E4", "F4", "G4", "D4", "E4", "F4", "G4"],
    colors: ["blue", "yellow", "green", "blue", "yellow", "green", "blue", "orange", "yellow", "green", "blue"],
  },
}

export function GameEngine({ isKidsMode }: { isKidsMode: boolean }) {
  const synthRef = useRef<any>(null)
  const [currentGame, setCurrentGame] = useState<Game>(null)
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const initSynth = async () => {
      if (!Tone) {
        Tone = await import("tone")
      }
      await Tone.start()
      synthRef.current = new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.5 },
      }).toDestination()
      setReady(true)
    }
    initSynth()

    return () => {
      synthRef.current?.dispose()
    }
  }, [])

  const playNote = async (note: string) => {
    if (!synthRef.current || !ready) return
    await Tone.start()
    synthRef.current.triggerAttackRelease(note, "8n")
  }

  const startGame = async (gameKey: Game) => {
    if (!gameKey || !ready) return
    setCurrentGame(gameKey)
    setCurrentNoteIndex(0)
    setScore(0)
    await playNote(GAMES[gameKey].notes[0])
  }

  const handleNoteClick = async (note: string) => {
    if (!currentGame) return

    const game = GAMES[currentGame]
    await playNote(note)

    if (note === game.notes[currentNoteIndex]) {
      setScore(score + 10)
      const nextIndex = currentNoteIndex + 1

      if (nextIndex >= game.notes.length) {
        setShowCelebration(true)
        setTimeout(() => {
          setCurrentGame(null)
          setShowCelebration(false)
        }, 2000)
      } else {
        setCurrentNoteIndex(nextIndex)
        await new Promise((resolve) => setTimeout(resolve, 500))
        await playNote(game.notes[nextIndex])
      }
    }
  }

  if (!isKidsMode && !currentGame) {
    return (
      <div className="text-center text-gray-400">
        <p>Music games are optimized for Kids Mode. Switch to Kids Mode to play games!</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {!ready && <div className="text-center text-white">Loading audio...</div>}

      {!currentGame ? (
        <>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-8">🎮 Choose a Game</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(GAMES).map(([key, game]) => (
              <button
                key={key}
                onClick={() => startGame(key as Game)}
                disabled={!ready}
                className="bg-gradient-to-br from-purple-500 to-pink-500 hover:scale-110 transition-transform p-8 rounded-lg text-white font-bold text-center shadow-lg disabled:opacity-50"
              >
                <div className="text-4xl mb-4">🎵</div>
                <div className="text-lg">{game.name}</div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">{GAMES[currentGame].name}</h2>
            <div className="text-5xl font-bold text-yellow-400">{score}</div>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            {["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"].map((note, i) => {
              const colorMap: { [key: string]: string } = {
                red: "bg-red-400",
                orange: "bg-orange-400",
                yellow: "bg-yellow-400",
                green: "bg-green-400",
                blue: "bg-blue-400",
                purple: "bg-purple-400",
                pink: "bg-pink-400",
              }
              const nextNote = GAMES[currentGame].notes[currentNoteIndex]
              const isTarget = note === nextNote
              const color = colorMap[GAMES[currentGame].colors[i]] || "bg-slate-600"

              return (
                <button
                  key={note}
                  onClick={() => handleNoteClick(note)}
                  className={`
                    ${color} 
                    transition-all rounded-lg p-4 min-w-16 font-bold text-white
                    ${isTarget ? "ring-4 ring-yellow-300 scale-125 animate-pulse" : ""}
                    active:scale-95
                  `}
                >
                  {note}
                </button>
              )
            })}
          </div>

          {showCelebration && (
            <div className="text-center">
              <div className="text-6xl animate-bounce mb-4">🎉</div>
              <div className="text-2xl font-bold text-green-400">Perfect! You did it!</div>
            </div>
          )}

          <button
            onClick={() => setCurrentGame(null)}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-lg"
          >
            Back to Menu
          </button>
        </div>
      )}
    </div>
  )
}
