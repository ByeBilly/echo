"use client"

import { useEffect, useRef } from "react"

interface WaveformVisualizerProps {
  isRecording: boolean
  analyserNode: AnalyserNode | null
  isPlaying: boolean
  audioElement: HTMLAudioElement | null
}

export function WaveformVisualizer({ isRecording, analyserNode, isPlaying, audioElement }: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const draw = () => {
      ctx.fillStyle = "rgba(15, 23, 42, 0.5)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if ((isRecording || isPlaying) && analyserNode) {
        const bufferLength = analyserNode.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        analyserNode.getByteFrequencyData(dataArray)

        const barWidth = (canvas.width / bufferLength) * 2.5
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height

          const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height)
          gradient.addColorStop(0, "#60a5fa")
          gradient.addColorStop(0.5, "#a78bfa")
          gradient.addColorStop(1, "#ec4899")

          ctx.fillStyle = gradient
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight)

          x += barWidth
        }
      } else {
        // Draw idle state
        ctx.strokeStyle = "rgba(139, 92, 246, 0.3)"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(0, canvas.height / 2)
        ctx.lineTo(canvas.width, canvas.height / 2)
        ctx.stroke()
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isRecording, analyserNode, isPlaying])

  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={200}
      className="w-full h-48 md:h-64 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-purple-500/30 shadow-lg"
    />
  )
}
