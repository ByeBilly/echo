"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Square, Play, Pause } from "lucide-react"
import { WaveformVisualizer } from "./waveform-visualizer"
import { RecordingList } from "./recording-list"

interface Recording {
  id: string
  name: string
  duration: number
  blob: Blob
  timestamp: number
}

export function RecordingStudio() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [recordingTime, setRecordingTime] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playingRecordingId, setPlayingRecordingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [micPermissionGranted, setMicPermissionGranted] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const recordingStartTimeRef = useRef(0)
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    audioElementRef.current = new Audio()
    audioElementRef.current.addEventListener("ended", () => {
      console.log("[v0] Playback ended")
      setIsPlaying(false)
      setPlayingRecordingId(null)
      setCurrentTime(0)
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current)
    })

    // Check if browser supports getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Your browser does not support audio recording")
      console.error("[v0] getUserMedia not supported")
    }

    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.removeEventListener("ended", () => {})
      }
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current)
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current)
    }
  }, [])

  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 0.1)
      }, 100)
    } else {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current)
    }

    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current)
    }
  }, [isRecording])

  const startRecording = async () => {
    try {
      setError(null)
      console.log("[v0] Starting recording...")

      console.log("[v0] Requesting microphone access")
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      console.log("[v0] Microphone access granted, stream active:", stream.active)
      setMicPermissionGranted(true)
      streamRef.current = stream

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      console.log("[v0] AudioContext created, state:", audioContext.state)
      audioContextRef.current = audioContext

      const source = audioContext.createMediaStreamSource(stream)
      console.log("[v0] MediaStreamSource created")

      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser
      console.log("[v0] Analyser connected")

      if (!window.MediaRecorder) {
        throw new Error("MediaRecorder is not supported in your browser")
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      })

      console.log("[v0] MediaRecorder created, state:", mediaRecorder.state)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      recordingStartTimeRef.current = Date.now()
      setRecordingTime(0)

      mediaRecorder.ondataavailable = (e) => {
        console.log("[v0] Data available, chunk size:", e.data.size)
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        console.log("[v0] Recording stopped, total chunks:", chunksRef.current.length)
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        console.log("[v0] Blob created, size:", blob.size)

        const duration = recordingTime
        const recording: Recording = {
          id: Date.now().toString(),
          name: `Recording ${recordings.length + 1}`,
          duration,
          blob,
          timestamp: Date.now(),
        }

        console.log("[v0] Recording saved:", recording.name, "Duration:", duration)
        setRecordings((prev) => [recording, ...prev])

        stream.getTracks().forEach((track) => {
          console.log("[v0] Stopping track:", track.kind)
          track.stop()
        })
      }

      mediaRecorder.onerror = (event) => {
        console.error("[v0] MediaRecorder error:", event.error)
        setError(`Recording error: ${event.error}`)
        setIsRecording(false)
      }

      console.log("[v0] Starting MediaRecorder")
      mediaRecorder.start(100) // Collect data every 100ms
      setIsRecording(true)
      console.log("[v0] Recording started successfully")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      console.error("[v0] Error accessing microphone:", errorMessage, error)

      if (errorMessage.includes("NotAllowedError")) {
        setError("Microphone permission denied. Please check your browser settings.")
      } else if (errorMessage.includes("NotFoundError")) {
        setError("No microphone found. Please connect a microphone and try again.")
      } else if (errorMessage.includes("NotReadableError")) {
        setError("Microphone is already in use by another application.")
      } else {
        setError(`Failed to access microphone: ${errorMessage}`)
      }
      setMicPermissionGranted(false)
      setIsRecording(false)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      console.log("[v0] Stopping recording, MediaRecorder state:", mediaRecorderRef.current.state)
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      console.log("[v0] Recording stop called")
    }
  }

  const playRecording = (recording: Recording) => {
    if (audioElementRef.current && recording) {
      try {
        console.log("[v0] Playing recording:", recording.name)
        const url = URL.createObjectURL(recording.blob)
        audioElementRef.current.src = url
        audioElementRef.current.play()
        setIsPlaying(true)
        setPlayingRecordingId(recording.id)
        setDuration(recording.duration)
        setCurrentTime(0)

        if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current)
        playbackIntervalRef.current = setInterval(() => {
          setCurrentTime(audioElementRef.current?.currentTime || 0)
        }, 100)

        console.log("[v0] Playback started")
      } catch (err) {
        console.error("[v0] Error playing recording:", err)
        setError("Failed to play recording")
      }
    }
  }

  const pausePlayback = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause()
      setIsPlaying(false)
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current)
      console.log("[v0] Playback paused")
    }
  }

  const downloadRecording = (recording: Recording) => {
    try {
      const url = URL.createObjectURL(recording.blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${recording.name}.webm`
      a.click()
      URL.revokeObjectURL(url)
      console.log("[v0] Recording downloaded:", recording.name)
    } catch (err) {
      console.error("[v0] Error downloading recording:", err)
      setError("Failed to download recording")
    }
  }

  const deleteRecording = (id: string) => {
    setRecordings((prev) => prev.filter((r) => r.id !== id))
    if (playingRecordingId === id) {
      pausePlayback()
      setPlayingRecordingId(null)
    }
    console.log("[v0] Recording deleted:", id)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Echo Frequency
          </h1>
          <p className="text-purple-300 text-lg">Voice Practice Studio</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-8 text-red-300">{error}</div>
        )}

        {/* Recording Section */}
        <div className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 backdrop-blur-md border border-purple-500/30 rounded-3xl p-8 md:p-12 mb-8 shadow-2xl">
          {/* Waveform Visualizer */}
          <WaveformVisualizer
            isRecording={isRecording}
            analyserNode={analyserRef.current}
            isPlaying={isPlaying}
            audioElement={audioElementRef.current}
          />

          {/* Recording Timer */}
          <div className="text-center mb-8">
            <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-mono">
              {isRecording ? formatTime(recordingTime) : "00:00"}
            </div>
          </div>

          {/* Status Indicator */}
          {isRecording && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-full">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-300 text-sm font-semibold">Recording...</span>
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-4 justify-center mb-8 flex-wrap">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-full transform transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 shadow-lg flex items-center gap-3"
              >
                <Mic size={24} />
                Start Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-8 rounded-full transform transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50 shadow-lg flex items-center gap-3 animate-pulse"
              >
                <Square size={24} />
                Stop Recording
              </button>
            )}
          </div>

          {/* Playback Controls */}
          {playingRecordingId && (
            <div className="bg-slate-900/50 rounded-xl p-4 mb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-purple-300">{formatTime(currentTime)}</span>
                <div className="flex-1 bg-slate-700 rounded-full h-2 mx-4">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-100"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                <span className="text-purple-300">{formatTime(duration)}</span>
              </div>
              <div className="flex gap-4 justify-center">
                {isPlaying ? (
                  <button
                    onClick={pausePlayback}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full transition-all flex items-center gap-2"
                  >
                    <Pause size={20} />
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const rec = recordings.find((r) => r.id === playingRecordingId)
                      if (rec) playRecording(rec)
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition-all flex items-center gap-2"
                  >
                    <Play size={20} />
                    Play
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Recordings List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">Saved Recordings</h2>
          <RecordingList
            recordings={recordings}
            onPlay={playRecording}
            onDownload={downloadRecording}
            onDelete={deleteRecording}
            playingId={playingRecordingId}
            formatTime={formatTime}
          />
          {recordings.length === 0 && (
            <div className="text-center text-purple-400 py-12">
              <p className="text-lg">No recordings yet. Hit the record button to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
