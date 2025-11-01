"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Square, Play, Pause, Plus } from "lucide-react"
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
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playingRecordingId, setPlayingRecordingId] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const recordingStartTimeRef = useRef(0)
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    audioElementRef.current = new Audio()
    audioElementRef.current.addEventListener("ended", () => {
      setIsPlaying(false)
      setPlayingRecordingId(null)
      setCurrentTime(0)
    })

    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.removeEventListener("ended", () => {})
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      source.connect(analyserRef.current)

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      recordingStartTimeRef.current = Date.now()

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        const duration = (Date.now() - recordingStartTimeRef.current) / 1000
        const recording: Recording = {
          id: Date.now().toString(),
          name: `Recording ${recordings.length + 1}`,
          duration,
          blob,
          timestamp: Date.now(),
        }
        setRecordings((prev) => [recording, ...prev])
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("[v0] Error accessing microphone:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const playRecording = (recording: Recording) => {
    if (audioElementRef.current && recording) {
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
    }
  }

  const pausePlayback = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause()
      setIsPlaying(false)
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current)
    }
  }

  const downloadRecording = (recording: Recording) => {
    const url = URL.createObjectURL(recording.blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${recording.name}.webm`
    a.click()
    URL.revokeObjectURL(url)
  }

  const deleteRecording = (id: string) => {
    setRecordings((prev) => prev.filter((r) => r.id !== id))
    if (playingRecordingId === id) {
      pausePlayback()
      setPlayingRecordingId(null)
    }
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
              {isRecording ? formatTime(currentTime) : "00:00"}
            </div>
          </div>

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
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-8 rounded-full transform transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50 shadow-lg flex items-center gap-3"
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
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Plus size={24} />
            Your Recordings
          </h2>
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
