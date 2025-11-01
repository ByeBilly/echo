"use client"

import { useEffect, useRef, useState } from "react"

let Tone: any = null

export function Metronome({ isKidsMode }: { isKidsMode: boolean }) {
  const synthRef = useRef<any>(null)
  const oscillatorRef = useRef<any>(null)
  const [bpm, setBpm] = useState(120)
  const [isPlaying, setIsPlaying] = useState(false)
  const [ready, setReady] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [beatCount, setBeatCount] = useState(0)
  const [timeSignature, setTimeSignature] = useState<"2/4" | "3/4" | "4/4">("4/4")

  const timeSignatures: { [key: string]: number } = {
    "2/4": 2,
    "3/4": 3,
    "4/4": 4,
  }

  useEffect(() => {
    const initMetronome = async () => {
      if (!Tone) {
        Tone = await import("tone")
      }
      await Tone.start()
      setReady(true)
    }
    initMetronome()
  }, [])

  const playBeat = async (isAccent: boolean) => {
    if (!ready) return
    await Tone.start()

    // Create a simple beep for the metronome
    const osc = new Tone.Oscillator({
      frequency: isAccent ? 1000 : 800,
      type: "sine",
    }).connect(Tone.Destination)

    osc.start()
    osc.frequency.rampTo(400, 0.05)

    setTimeout(() => {
      osc.stop()
    }, 50)
  }

  const startMetronome = async () => {
    if (!ready) return
    await Tone.start()
    setIsPlaying(true)
    setBeatCount(0)

    let beatCounter = 0
    const beatLength = 60000 / bpm

    intervalRef.current = setInterval(async () => {
      const beatsPerMeasure = timeSignatures[timeSignature]
      const isAccent = beatCounter % beatsPerMeasure === 0

      await playBeat(isAccent)
      setBeatCount(beatCounter % beatsPerMeasure)
      beatCounter++
    }, beatLength)
  }

  const stopMetronome = () => {
    setIsPlaying(false)
    if (intervalRef.current) clearInterval(intervalRef.current)
    setBeatCount(0)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className={`text-2xl font-bold mb-4 ${isKidsMode ? "text-white" : "text-gray-300"}`}>⏱ Metronome</h2>
        <p className={`text-sm ${isKidsMode ? "text-white/80" : "text-gray-400"}`}>
          Keep your tempo steady and improve your timing
        </p>
      </div>

      {!ready && <div className="text-center text-white">Loading...</div>}

      {/* Metronome Display */}
      <div className={`text-center p-8 rounded-2xl ${isKidsMode ? "bg-purple-500/20" : "bg-slate-700/50"}`}>
        <div className="text-6xl font-bold text-white mb-4">{bpm}</div>
        <div className="text-gray-400 text-lg">BPM</div>

        {/* Beat Indicator */}
        {isPlaying && (
          <div className="flex gap-2 justify-center mt-8">
            {Array.from({ length: timeSignatures[timeSignature] }).map((_, i) => (
              <div
                key={i}
                className={`
                  w-12 h-12 rounded-full transition-all
                  ${i === beatCount ? "bg-gradient-to-r from-purple-500 to-pink-500 scale-125" : "bg-slate-600"}
                `}
              />
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* BPM Control */}
        <div className="flex gap-4 items-center justify-center flex-wrap">
          <label className="text-gray-300">Tempo:</label>
          <input
            type="range"
            min="40"
            max="200"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            disabled={isPlaying}
            className="w-40"
          />
        </div>

        {/* Time Signature Control */}
        <div className="flex gap-4 items-center justify-center flex-wrap">
          <label className="text-gray-300">Time Signature:</label>
          <div className="flex gap-2">
            {["2/4", "3/4", "4/4"].map((sig) => (
              <button
                key={sig}
                onClick={() => setTimeSignature(sig as "2/4" | "3/4" | "4/4")}
                disabled={isPlaying}
                className={`
                  px-4 py-2 rounded-lg font-bold transition-all
                  ${
                    timeSignature === sig
                      ? isKidsMode
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : "bg-blue-600 text-white"
                      : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                  }
                  disabled:opacity-50
                `}
              >
                {sig}
              </button>
            ))}
          </div>
        </div>

        {/* Play/Stop Button */}
        <div className="flex justify-center">
          <button
            onClick={isPlaying ? stopMetronome : startMetronome}
            disabled={!ready}
            className={`
              py-4 px-12 rounded-lg font-bold text-white text-lg transition-all
              ${isPlaying ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"}
              disabled:opacity-50
            `}
          >
            {isPlaying ? "Stop Metronome" : "Start Metronome"}
          </button>
        </div>
      </div>
    </div>
  )
}
