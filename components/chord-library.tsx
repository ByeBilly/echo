"use client"

import { useEffect, useRef, useState } from "react"

interface Chord {
  name: string
  notes: string[]
  description: string
  symbol: string
}

const CHORDS: Chord[] = [
  { name: "C Major", notes: ["C4", "E4", "G4"], description: "Happy, bright sound", symbol: "C" },
  { name: "C Minor", notes: ["C4", "D#4", "G4"], description: "Sad, dark sound", symbol: "Cm" },
  { name: "G Major", notes: ["G4", "B4", "D5"], description: "Warm, open sound", symbol: "G" },
  { name: "G Minor", notes: ["G4", "A#4", "D5"], description: "Melancholic sound", symbol: "Gm" },
  { name: "D Major", notes: ["D4", "F#4", "A4"], description: "Bright, energetic", symbol: "D" },
  { name: "D Minor", notes: ["D4", "F4", "A4"], description: "Emotional, reflective", symbol: "Dm" },
  { name: "A Major", notes: ["A4", "C#5", "E5"], description: "Clear, ringing sound", symbol: "A" },
  { name: "A Minor", notes: ["A4", "C5", "E5"], description: "Tender, soft sound", symbol: "Am" },
  { name: "F Major", notes: ["F4", "A4", "C5"], description: "Mellow, smooth", symbol: "F" },
  { name: "E Major", notes: ["E4", "G#4", "B4"], description: "Brilliant, shiny", symbol: "E" },
]

let Tone: any = null

export function ChordLibrary({ isKidsMode }: { isKidsMode: boolean }) {
  const synthRef = useRef<any>(null)
  const [ready, setReady] = useState(false)
  const [selectedChord, setSelectedChord] = useState<Chord | null>(CHORDS[0])

  useEffect(() => {
    const initSynth = async () => {
      if (!Tone) {
        Tone = await import("tone")
      }
      await Tone.start()
      synthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.8 },
      }).toDestination()
      setReady(true)
    }
    initSynth()

    return () => {
      synthRef.current?.dispose()
    }
  }, [])

  const playChord = async (chord: Chord) => {
    if (!synthRef.current || !ready) return
    await Tone.start()
    setSelectedChord(chord)
    synthRef.current.triggerAttackRelease(chord.notes, "1n")
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className={`text-2xl font-bold mb-4 ${isKidsMode ? "text-white" : "text-gray-300"}`}>🎼 Chord Library</h2>
        <p className={`text-sm ${isKidsMode ? "text-white/80" : "text-gray-400"}`}>
          Learn and play different chords to understand harmony
        </p>
      </div>

      {!ready && <div className="text-center text-white">Loading...</div>}

      {/* Chord Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CHORDS.map((chord) => (
          <button
            key={chord.symbol}
            onClick={() => playChord(chord)}
            disabled={!ready}
            className={`
              p-6 rounded-xl font-bold transition-all text-left
              ${
                selectedChord?.symbol === chord.symbol
                  ? isKidsMode
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-105"
                    : "bg-blue-600 text-white scale-105"
                  : isKidsMode
                    ? "bg-white/20 text-white hover:bg-white/30"
                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
              }
              disabled:opacity-50
            `}
          >
            <div className="text-lg font-bold">
              {chord.symbol} - {chord.name}
            </div>
            <div className="text-sm mt-2 opacity-90">{chord.notes.join(" + ")}</div>
            <div className={`text-xs mt-2 ${selectedChord?.symbol === chord.symbol ? "font-bold" : "opacity-75"}`}>
              {chord.description}
            </div>
          </button>
        ))}
      </div>

      {/* Selected Chord Info */}
      {selectedChord && (
        <div className={`p-6 rounded-lg ${isKidsMode ? "bg-purple-500/20" : "bg-slate-700/50"}`}>
          <h3 className="text-white font-bold text-lg mb-2">Playing: {selectedChord.name}</h3>
          <p className="text-gray-300">Notes: {selectedChord.notes.join(", ")}</p>
          <p className="text-gray-400 text-sm mt-2">{selectedChord.description}</p>
        </div>
      )}
    </div>
  )
}
