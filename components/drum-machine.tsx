"use client"

import { useEffect, useRef, useState } from "react"

let Tone: any = null

const DRUM_PADS = [
  { name: "Kick", icon: "🥁", sound: "kick" },
  { name: "Snare", icon: "🎯", sound: "snare" },
  { name: "HiHat", icon: "🔔", sound: "hihat" },
  { name: "Tom", icon: "🎪", sound: "tom" },
  { name: "Clap", icon: "👏", sound: "clap" },
  { name: "Perc", icon: "⚡", sound: "perc" },
  { name: "Cowbell", icon: "🔊", sound: "cowbell" },
  { name: "Crash", icon: "💥", sound: "crash" },
]

export function DrumMachine({ isKidsMode }: { isKidsMode: boolean }) {
  const synthRef = useRef<{ [key: string]: any }>({})
  const [bpm, setBpm] = useState(120)
  const [isPlaying, setIsPlaying] = useState(false)
  const [sequence, setSequence] = useState<{ [key: string]: boolean[] }>({})
  const sequencerRef = useRef<NodeJS.Timeout | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const initDrums = async () => {
      if (!Tone) {
        Tone = await import("tone")
      }
      await Tone.start()

      DRUM_PADS.forEach((pad) => {
        synthRef.current[pad.sound] = new Tone.Synth({
          oscillator: { type: "square" },
          envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.1 },
        }).toDestination()
      })

      setSequence(
        DRUM_PADS.reduce(
          (acc, pad) => {
            acc[pad.sound] = Array(16).fill(false)
            return acc
          },
          {} as { [key: string]: boolean[] },
        ),
      )
      setReady(true)
    }
    initDrums()

    return () => {
      Object.values(synthRef.current).forEach((synth: any) => synth?.dispose())
    }
  }, [])

  const playDrumSound = async (sound: string) => {
    if (!synthRef.current[sound] || !ready) return
    await Tone.start()
    synthRef.current[sound].triggerAttackRelease("C2", "8n")
  }

  const toggleSequenceStep = (sound: string, step: number) => {
    setSequence((prev) => ({
      ...prev,
      [sound]: prev[sound].map((active, i) => (i === step ? !active : active)),
    }))
  }

  const startSequencer = async () => {
    if (!ready) return
    await Tone.start()
    setIsPlaying(true)
    let step = 0

    sequencerRef.current = setInterval(
      () => {
        setCurrentStep(step)
        Object.keys(sequence).forEach((sound) => {
          if (sequence[sound][step]) {
            playDrumSound(sound)
          }
        })
        step = (step + 1) % 16
      },
      60000 / bpm / 4,
    )
  }

  const stopSequencer = () => {
    setIsPlaying(false)
    if (sequencerRef.current) clearInterval(sequencerRef.current)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className={`text-2xl font-bold mb-4 ${isKidsMode ? "text-white" : "text-gray-300"}`}>
          {isKidsMode ? "🥁 Drum Beats" : "Drum Machine + 16-Step Sequencer"}
        </h2>
      </div>

      {!ready && <div className="text-center text-white">Loading audio...</div>}

      {/* Drum Pads */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {DRUM_PADS.map((pad) => (
          <button
            key={pad.sound}
            onClick={() => playDrumSound(pad.sound)}
            disabled={!ready}
            className={`
              p-4 rounded-lg font-bold transition-all
              ${
                isKidsMode
                  ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:scale-110"
                  : "bg-slate-700 text-gray-300 hover:bg-slate-600"
              }
              active:scale-95 shadow-lg disabled:opacity-50
            `}
          >
            <div className="text-4xl">{pad.icon}</div>
            <div className="text-sm mt-2">{pad.name}</div>
          </button>
        ))}
      </div>

      {/* Sequencer Controls */}
      {!isKidsMode && (
        <div className="space-y-6 bg-slate-900/50 p-6 rounded-lg">
          <div className="flex gap-4 justify-center items-center">
            <label className="text-gray-300">BPM:</label>
            <input
              type="range"
              min="60"
              max="180"
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              disabled={isPlaying}
              className="w-32"
            />
            <span className="text-white font-bold w-12">{bpm}</span>
          </div>

          <button
            onClick={isPlaying ? stopSequencer : startSequencer}
            disabled={!ready}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
              isPlaying ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"
            } disabled:opacity-50`}
          >
            {isPlaying ? "⏹ Stop" : "▶ Play Sequence"}
          </button>

          {/* 16-Step Sequencer Grid */}
          <div className="space-y-2">
            {DRUM_PADS.map((pad) => (
              <div key={pad.sound} className="flex gap-1">
                <div className="w-16 text-gray-400 text-sm">{pad.name}</div>
                <div className="flex gap-1 flex-1">
                  {sequence[pad.sound]?.map((active, step) => (
                    <button
                      key={step}
                      onClick={() => toggleSequenceStep(pad.sound, step)}
                      className={`
                        flex-1 h-8 rounded transition-all
                        ${active ? "bg-blue-500 shadow-lg" : "bg-slate-700 hover:bg-slate-600"}
                        ${currentStep === step ? "ring-2 ring-yellow-400" : ""}
                      `}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
