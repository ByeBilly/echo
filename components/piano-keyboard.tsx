"use client"

import { useEffect, useRef, useState } from "react"

let Tone: any = null

const NOTES = [
  { name: "C", solfa: "Do", freq: "C4", color: "bg-red-400" },
  { name: "D", solfa: "Re", freq: "D4", color: "bg-orange-400" },
  { name: "E", solfa: "Mi", freq: "E4", color: "bg-yellow-400" },
  { name: "F", solfa: "Fa", freq: "F4", color: "bg-green-400" },
  { name: "G", solfa: "Sol", freq: "G4", color: "bg-blue-400" },
  { name: "A", solfa: "La", freq: "A4", color: "bg-purple-400" },
  { name: "B", solfa: "Ti", freq: "B4", color: "bg-pink-400" },
  { name: "C", solfa: "Do", freq: "C5", color: "bg-red-400" },
]

const NOTES_ADULT = [
  ...NOTES.map((n, i) => ({ ...n, name: i === 7 ? "C5" : `${n.name}4` })),
  { name: "D5", solfa: "Re", freq: "D5", color: "bg-slate-600" },
]

export function Piano({ isKidsMode }: { isKidsMode: boolean }) {
  const synthRef = useRef<any>(null)
  const [activeNote, setActiveNote] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const initSynth = async () => {
      if (!Tone) {
        Tone = await import("tone")
      }
      await Tone.start()
      synthRef.current = new Tone.Synth({
        oscillator: { type: "triangle" },
        envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 0.5 },
      }).toDestination()
      setReady(true)
    }
    initSynth()

    return () => {
      synthRef.current?.dispose()
    }
  }, [])

  const handleKeyPress = async (freq: string) => {
    if (!synthRef.current || !ready) return
    await Tone.start()
    setActiveNote(freq)
    synthRef.current.triggerAttackRelease(freq, "8n")
  }

  const notesToDisplay = isKidsMode ? NOTES : NOTES_ADULT

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className={`text-2xl font-bold mb-4 ${isKidsMode ? "text-white" : "text-gray-300"}`}>
          {isKidsMode ? "🎹 Rainbow Piano" : "Piano Keyboard"}
        </h2>
      </div>

      {!ready && <div className="text-center text-white">Loading audio...</div>}

      {/* Piano Keys */}
      <div className="flex gap-2 justify-center flex-wrap">
        {notesToDisplay.map((note) => (
          <button
            key={note.freq}
            onMouseDown={() => handleKeyPress(note.freq)}
            onMouseUp={() => setActiveNote(null)}
            onMouseLeave={() => setActiveNote(null)}
            disabled={!ready}
            className={`
              ${isKidsMode ? note.color : "bg-slate-700"} 
              transition-all duration-100
              rounded-lg p-6 min-w-20
              ${activeNote === note.freq ? "scale-95 shadow-2xl" : "hover:scale-105 shadow-lg"}
              ${isKidsMode ? "text-white font-bold text-lg" : "text-gray-300 font-semibold"}
              disabled:opacity-50
            `}
          >
            <div className="font-bold text-xl">{note.name}</div>
            <div className={`text-sm ${isKidsMode ? "font-bold" : "text-gray-400"}`}>{note.solfa}</div>
          </button>
        ))}
      </div>

      {/* Instructions */}
      <div className={`text-center text-sm ${isKidsMode ? "text-white/80" : "text-gray-400"}`}>
        {isKidsMode ? "🎵 Click the keys to play music!" : "Use keyboard or click keys to play"}
      </div>
    </div>
  )
}
