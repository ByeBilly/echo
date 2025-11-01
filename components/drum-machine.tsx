"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"

let Tone: any = null

const DRUM_PADS = [
  { name: "Kick", sound: "kick", frequency: 150 },
  { name: "Snare", sound: "snare", frequency: 200 },
  { name: "HiHat Closed", sound: "hihat-closed", frequency: 8000 },
  { name: "HiHat Open", sound: "hihat-open", frequency: 7000 },
  { name: "Tom High", sound: "tom-high", frequency: 400 },
  { name: "Tom Mid", sound: "tom-mid", frequency: 250 },
  { name: "Tom Low", sound: "tom-low", frequency: 180 },
  { name: "Clap", sound: "clap", frequency: 300 },
]

export function DrumMachine({ isKidsMode }: { isKidsMode: boolean }) {
  const synthRef = useRef<{ [key: string]: any }>({})
  const osc = useRef<any>(null)
  const noiseRef = useRef<any>(null)
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
        switch (pad.sound) {
          case "kick":
            synthRef.current[pad.sound] = new Tone.PolySynth(Tone.Synth, {
              oscillator: { type: "sine" },
              envelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 0 },
            }).toDestination()
            break
          case "snare":
            synthRef.current[pad.sound] = new Tone.Synth({
              oscillator: { type: "triangle" },
              envelope: { attack: 0.005, decay: 0.2, sustain: 0, release: 0.05 },
            }).toDestination()
            break
          case "hihat-closed":
          case "hihat-open":
            synthRef.current[pad.sound] = new Tone.MetalSynth({
              frequency: pad.frequency,
              envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
              harmonicity: 12,
              resonance: 3000,
              octaves: 1.5,
            }).toDestination()
            break
          case "tom-high":
          case "tom-mid":
          case "tom-low":
            synthRef.current[pad.sound] = new Tone.PolySynth(Tone.Synth, {
              oscillator: { type: "sine" },
              envelope: { attack: 0.005, decay: 0.15, sustain: 0, release: 0.05 },
            }).toDestination()
            break
          case "clap":
            synthRef.current[pad.sound] = new Tone.Synth({
              oscillator: { type: "square" },
              envelope: { attack: 0.005, decay: 0.25, sustain: 0, release: 0.1 },
            }).toDestination()
            break
        }
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
      if (sequencerRef.current) clearInterval(sequencerRef.current)
      Object.values(synthRef.current).forEach((synth: any) => synth?.dispose())
    }
  }, [])

  const playDrumSound = async (sound: string) => {
    if (!synthRef.current[sound] || !ready) return
    await Tone.start()

    const pad = DRUM_PADS.find((p) => p.sound === sound)
    if (!pad) return

    switch (sound) {
      case "kick":
        synthRef.current[sound].triggerAttackRelease("C0", "0.5")
        break
      case "snare":
        synthRef.current[sound].triggerAttackRelease("C2", "0.2")
        break
      case "tom-high":
        synthRef.current[sound].triggerAttackRelease("G2", "0.15")
        break
      case "tom-mid":
        synthRef.current[sound].triggerAttackRelease("C2", "0.15")
        break
      case "tom-low":
        synthRef.current[sound].triggerAttackRelease("A1", "0.15")
        break
      default:
        synthRef.current[sound].triggerAttackRelease("8n")
    }
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

    const beatLength = 60000 / bpm / 4

    sequencerRef.current = setInterval(() => {
      setCurrentStep(step)
      Object.keys(sequence).forEach((sound) => {
        if (sequence[sound][step]) {
          playDrumSound(sound)
        }
      })
      step = (step + 1) % 16
    }, beatLength)
  }

  const stopSequencer = () => {
    setIsPlaying(false)
    if (sequencerRef.current) clearInterval(sequencerRef.current)
  }

  const clearSequence = () => {
    setSequence(
      DRUM_PADS.reduce(
        (acc, pad) => {
          acc[pad.sound] = Array(16).fill(false)
          return acc
        },
        {} as { [key: string]: boolean[] },
      ),
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="text-center flex-1">
          <h2 className={`text-2xl font-bold mb-4 ${isKidsMode ? "text-white" : "text-gray-300"}`}>
            {isKidsMode ? "🥁 Drum Beats" : "Drum Machine + 16-Step Sequencer"}
          </h2>
        </div>
        <Link
          href="/"
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all"
        >
          ← Home
        </Link>
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
            <div className="text-4xl">🥁</div>
            <div className="text-sm mt-2">{pad.name}</div>
          </button>
        ))}
      </div>

      {/* Sequencer Controls */}
      {!isKidsMode && (
        <div className="space-y-6 bg-slate-900/50 p-6 rounded-lg">
          <div className="flex gap-4 justify-center items-center flex-wrap">
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

          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={isPlaying ? stopSequencer : startSequencer}
              disabled={!ready}
              className={`py-3 px-6 rounded-lg font-bold text-white transition-all ${
                isPlaying ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"
              } disabled:opacity-50`}
            >
              {isPlaying ? "⏹ Stop" : "▶ Play Sequence"}
            </button>
            <button
              onClick={clearSequence}
              disabled={isPlaying}
              className="py-3 px-6 rounded-lg font-bold text-white bg-slate-600 hover:bg-slate-700 transition-all disabled:opacity-50"
            >
              Clear
            </button>
          </div>

          {/* 16-Step Sequencer Grid */}
          <div className="space-y-2 overflow-x-auto">
            {DRUM_PADS.map((pad) => (
              <div key={pad.sound} className="flex gap-1 min-w-max">
                <div className="w-24 text-gray-400 text-sm truncate">{pad.name}</div>
                <div className="flex gap-1 flex-1">
                  {sequence[pad.sound]?.map((active, step) => (
                    <button
                      key={step}
                      onClick={() => toggleSequenceStep(pad.sound, step)}
                      className={`
                        h-8 rounded transition-all flex-shrink-0
                        ${active ? "bg-blue-500 shadow-lg" : "bg-slate-700 hover:bg-slate-600"}
                        ${currentStep === step ? "ring-2 ring-yellow-400" : ""}
                      `}
                      style={{ minWidth: "32px" }}
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
