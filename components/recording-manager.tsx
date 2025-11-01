"use client"

import { useEffect, useRef, useState } from "react"

export interface Recording {
  id: string
  name: string
  blob: Blob
  duration: number
  timestamp: Date
  type: "piano" | "drums" | "both"
}

export function RecordingManager({ onRecordingAdded }: { onRecordingAdded?: (recording: Recording) => void }) {
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    // Load recordings from localStorage
    const saved = localStorage.getItem("musicRecordings")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setRecordings(parsed.map((r: any) => ({ ...r, timestamp: new Date(r.timestamp) })))
      } catch (e) {
        console.error("Failed to load recordings:", e)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4"
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType })

      const chunks: BlobPart[] = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType })
        const recording: Recording = {
          id: Date.now().toString(),
          name: `Recording ${new Date().toLocaleTimeString()}`,
          blob,
          duration: mediaRecorderRef.current?.state === "stopped" ? 0 : 0,
          timestamp: new Date(),
          type: "both",
        }

        const updated = [...recordings, recording]
        setRecordings(updated)
        localStorage.setItem("musicRecordings", JSON.stringify(updated))
        onRecordingAdded?.(recording)

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (err) {
      console.error("Failed to start recording:", err)
      alert("Microphone access denied. Please allow access to record audio.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const deleteRecording = (id: string) => {
    const updated = recordings.filter((r) => r.id !== id)
    setRecordings(updated)
    localStorage.setItem("musicRecordings", JSON.stringify(updated))
  }

  const downloadRecording = (recording: Recording) => {
    const url = URL.createObjectURL(recording.blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${recording.name}.webm`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return {
    recordings,
    isRecording,
    startRecording,
    stopRecording,
    deleteRecording,
    downloadRecording,
  }
}
