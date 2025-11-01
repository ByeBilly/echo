"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

export function MusicalBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Create particles
    const particles: Particle[] = []
    const particleCount = 50

    interface Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      type: "note" | "star" | "wave"
      color: string
      rotation: number
      rotationSpeed: number
    }

    const createParticles = () => {
      for (let i = 0; i < particleCount; i++) {
        const types = ["note", "star", "wave"]
        const colors = ["#8B5CF6", "#EC4899", "#3B82F6", "#10B981"]

        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 10 + 5,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          type: types[Math.floor(Math.random() * types.length)] as "note" | "star" | "wave",
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.01,
        })
      }
    }

    createParticles()

    // Draw particles
    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        ctx.save()
        ctx.translate(particle.x, particle.y)
        ctx.rotate(particle.rotation)
        ctx.fillStyle = particle.color
        ctx.globalAlpha = 0.3

        if (particle.type === "note") {
          // Draw musical note
          ctx.beginPath()
          ctx.ellipse(0, 0, particle.size / 2, particle.size / 3, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.beginPath()
          ctx.rect(particle.size / 2, -particle.size, particle.size / 6, particle.size)
          ctx.fill()
        } else if (particle.type === "star") {
          // Draw star
          ctx.beginPath()
          for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5 - Math.PI / 2
            const x = Math.cos(angle) * particle.size
            const y = Math.sin(angle) * particle.size
            if (i === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          }
          ctx.closePath()
          ctx.fill()
        } else if (particle.type === "wave") {
          // Draw sound wave
          ctx.beginPath()
          for (let i = -particle.size; i <= particle.size; i++) {
            const x = i
            const y = Math.sin(i * 0.2) * (particle.size / 3)
            if (i === -particle.size) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          }
          ctx.lineWidth = 2
          ctx.strokeStyle = particle.color
          ctx.stroke()
        }

        ctx.restore()
      })
    }

    // Update particles
    const updateParticles = () => {
      particles.forEach((particle) => {
        particle.x += particle.speedX
        particle.y += particle.speedY
        particle.rotation += particle.rotationSpeed

        // Wrap around edges
        if (particle.x < -particle.size) particle.x = canvas.width + particle.size
        if (particle.x > canvas.width + particle.size) particle.x = -particle.size
        if (particle.y < -particle.size) particle.y = canvas.height + particle.size
        if (particle.y > canvas.height + particle.size) particle.y = -particle.size
      })
    }

    // Animation loop
    const animate = () => {
      drawParticles()
      updateParticles()
      requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
      <div className="fixed inset-0 bg-gradient-to-b from-indigo-900/30 via-purple-800/30 to-pink-700/30 pointer-events-none z-0"></div>

      {/* Animated gradient orbs */}
      <motion.div
        className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none z-0"
        animate={{
          x: [0, 50, -50, 0],
          y: [0, -50, 50, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          duration: 20,
        }}
      />
      <motion.div
        className="fixed bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl pointer-events-none z-0"
        animate={{
          x: [0, -70, 70, 0],
          y: [0, 70, -70, 0],
        }}
        transition={{
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          duration: 25,
        }}
      />
    </>
  )
}
