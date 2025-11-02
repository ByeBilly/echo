"use client"

import { useEffect, useRef, useState } from "react"

export interface Vehicle {
  id: string
  name: string
  speed: number
  acceleration: number
  maxAltitude: number
  color: string
}

const VEHICLES: Vehicle[] = [
  {
    id: "sport",
    name: "Sport Racer",
    speed: 150,
    acceleration: 8,
    maxAltitude: 2000,
    color: "#ff0000",
  },
  {
    id: "luxury",
    name: "Luxury Cruiser",
    speed: 100,
    acceleration: 4,
    maxAltitude: 3000,
    color: "#FFD700",
  },
  {
    id: "cargo",
    name: "Cargo Hauler",
    speed: 80,
    acceleration: 3,
    maxAltitude: 1500,
    color: "#808080",
  },
]

interface FlightState {
  altitude: number
  speed: number
  rotation: number
  distance: number
  boostActive: boolean
  boostEnergy: number
}

export function SkySurferSimulator({ onSessionEnd }: { onSessionEnd?: (data: any) => void }) {
  const [selectedLocation, setSelectedLocation] = useState({ lat: 40.7128, lng: -74.006, name: "New York" })
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>(VEHICLES[0])
  const [isFlying, setIsFlying] = useState(false)
  const [showMenu, setShowMenu] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const keysPressed = useRef<{ [key: string]: boolean }>({})
  const flightState = useRef<FlightState>({
    altitude: 0,
    speed: 0,
    rotation: 0,
    distance: 0,
    boostActive: false,
    boostEnergy: 100,
  })
  const sessionStartTime = useRef<number>(0)
  const sessionDataRef = useRef<{
    startTime: number
    location: string
    vehicle: string
    maxAltitude: number
    maxSpeed: number
    distance: number
  }>({
    startTime: 0,
    location: "New York",
    vehicle: "Sport Racer",
    maxAltitude: 0,
    maxSpeed: 0,
    distance: 0,
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = true
      if (e.key === " ") {
        e.preventDefault()
        if (isFlying && flightState.current.boostEnergy > 0) {
          flightState.current.boostActive = true
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false
      if (e.key === " ") {
        flightState.current.boostActive = false
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [isFlying])

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let animationFrameId: number

    const animate = () => {
      if (isFlying) {
        const state = flightState.current

        if (keysPressed.current["w"] || keysPressed.current["arrowup"]) {
          state.altitude = Math.min(state.altitude + selectedVehicle.acceleration, selectedVehicle.maxAltitude)
        }
        if (keysPressed.current["s"] || keysPressed.current["arrowdown"]) {
          state.altitude = Math.max(state.altitude - selectedVehicle.acceleration, 0)
        }
        if (keysPressed.current["a"] || keysPressed.current["arrowleft"]) {
          state.rotation -= 5
        }
        if (keysPressed.current["d"] || keysPressed.current["arrowright"]) {
          state.rotation += 5
        }

        if (state.boostActive && state.boostEnergy > 0) {
          state.speed = Math.min(state.speed + 2, selectedVehicle.speed * 1.5)
          state.boostEnergy = Math.max(state.boostEnergy - 2, 0)
        } else {
          state.speed = Math.max(state.speed - 0.5, 0)
          if (state.boostEnergy < 100) {
            state.boostEnergy += 0.3
          }
        }

        state.distance += (state.speed / 60) * 0.1

        sessionDataRef.current.maxAltitude = Math.max(sessionDataRef.current.maxAltitude, state.altitude)
        sessionDataRef.current.maxSpeed = Math.max(sessionDataRef.current.maxSpeed, state.speed)
      }

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, "#1a1a2e")
      gradient.addColorStop(0.5, "#16213e")
      gradient.addColorStop(1, "#0f3460")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
      for (let i = 0; i < 100; i++) {
        const x = (i * 71) % canvas.width
        const y = (i * 131) % (canvas.height * 0.3)
        ctx.fillRect(x, y, 2, 2)
      }

      ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
      for (let i = 0; i < 5; i++) {
        const cloudX = ((sessionStartTime.current / 10 + i * 200) % (canvas.width + 200)) - 100
        const cloudY = 80 + i * 60
        drawCloud(ctx, cloudX, cloudY, 60)
      }

      if (isFlying) {
        ctx.strokeStyle = "rgba(100, 200, 255, 0.3)"
        ctx.lineWidth = 2
        ctx.setLineDash([15, 15])

        ctx.beginPath()
        ctx.moveTo(0, canvas.height - 100)
        ctx.lineTo(canvas.width, canvas.height - 100)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(0, canvas.height - 300)
        ctx.lineTo(canvas.width, canvas.height - 300)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(0, canvas.height - 500)
        ctx.lineTo(canvas.width, canvas.height - 500)
        ctx.stroke()
        ctx.setLineDash([])

        const state = flightState.current
        const carX = canvas.width / 2
        const carY = canvas.height - (state.altitude / selectedVehicle.maxAltitude) * 400 - 100

        ctx.save()
        ctx.translate(carX, carY)
        ctx.rotate((state.rotation * Math.PI) / 180)

        ctx.fillStyle = selectedVehicle.color
        ctx.fillRect(-30, -15, 60, 30)

        ctx.fillStyle = "#87CEEB"
        ctx.fillRect(-25, -10, 15, 10)
        ctx.fillRect(10, -10, 15, 10)

        if (state.boostActive) {
          ctx.shadowColor = "rgba(255, 100, 0, 0.8)"
          ctx.shadowBlur = 20
        }

        ctx.fillStyle = selectedVehicle.color
        ctx.beginPath()
        ctx.moveTo(-30, 0)
        ctx.lineTo(-50, -5)
        ctx.lineTo(-30, 5)
        ctx.fill()

        ctx.beginPath()
        ctx.moveTo(30, 0)
        ctx.lineTo(50, -5)
        ctx.lineTo(30, 5)
        ctx.fill()

        ctx.shadowColor = "transparent"
        ctx.restore()

        drawCityscape(ctx, canvas.width, canvas.height)
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationFrameId)
  }, [isFlying, selectedVehicle])

  const handleTakeoff = () => {
    if (!isFlying) {
      sessionStartTime.current = Date.now()
      sessionDataRef.current = {
        startTime: Date.now(),
        location: selectedLocation.name,
        vehicle: selectedVehicle.name,
        maxAltitude: 0,
        maxSpeed: 0,
        distance: 0,
      }
      flightState.current = {
        altitude: 0,
        speed: 0,
        rotation: 0,
        distance: 0,
        boostActive: false,
        boostEnergy: 100,
      }
    } else {
      sessionDataRef.current.maxAltitude = Math.max(sessionDataRef.current.maxAltitude, flightState.current.altitude)
      sessionDataRef.current.maxSpeed = Math.max(sessionDataRef.current.maxSpeed, flightState.current.speed)
      sessionDataRef.current.distance = flightState.current.distance

      if (onSessionEnd) {
        onSessionEnd(sessionDataRef.current)
      }
    }
    setIsFlying(!isFlying)
  }

  const state = flightState.current

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-screen" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 bg-black/30 text-white p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">SkySurfer</h1>
              <p className="text-sm text-gray-300">{selectedLocation.name}</p>
            </div>
            <div className="text-right space-y-1">
              <div className="text-2xl font-bold">{state.altitude.toFixed(0)} ft</div>
              <div className="text-sm text-gray-300">{state.speed.toFixed(0)} mph</div>
              <div className="text-sm text-gray-300">{(state.distance / 1000).toFixed(1)} km</div>
            </div>
          </div>
        </div>

        <div className="absolute right-4 top-32 bg-black/50 text-white p-4 rounded-lg">
          <div className="text-sm font-bold mb-2">Altitude</div>
          <div className={`text-xs mb-1 ${state.altitude < 50 ? "text-green-400" : "text-gray-400"}`}>
            Urban: 0-50 ft
          </div>
          <div
            className={`text-xs mb-1 ${state.altitude >= 50 && state.altitude < 500 ? "text-blue-400" : "text-gray-400"}`}
          >
            Transit: 50-500 ft
          </div>
          <div className={`text-xs ${state.altitude >= 500 ? "text-purple-400" : "text-gray-400"}`}>
            Regional: 500+ ft
          </div>
        </div>

        {isFlying && (
          <div className="absolute right-4 top-64 bg-black/50 text-white p-4 rounded-lg">
            <div className="text-sm font-bold mb-2">Boost</div>
            <div className="w-32 h-4 bg-gray-700 rounded">
              <div className="h-full bg-yellow-500 rounded transition-all" style={{ width: `${state.boostEnergy}%` }} />
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              <div className="pointer-events-auto">
                <div className="text-sm font-bold mb-2">Vehicle: {selectedVehicle.name}</div>
                <div className="text-xs text-gray-300">Max Speed: {selectedVehicle.speed} mph</div>
              </div>
              <div className="pointer-events-auto space-y-2">
                <button
                  onClick={handleTakeoff}
                  className={`w-full py-2 px-4 rounded-lg font-bold transition-all ${
                    isFlying ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {isFlying ? "Land" : "Take Off"}
                </button>
              </div>
              <div className="pointer-events-auto text-xs text-gray-300">
                <div>W/A/S/D to fly</div>
                <div>SPACE for boost</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowMenu(!showMenu)}
        className="absolute top-4 right-4 bg-white/90 hover:bg-white text-black px-4 py-2 rounded-lg font-bold z-40 pointer-events-auto"
      >
        {showMenu ? "Hide" : "Show"}
      </button>

      {showMenu && (
        <div className="absolute left-0 top-0 h-full w-80 bg-black/90 text-white p-6 overflow-y-auto pointer-events-auto z-30">
          <h2 className="text-2xl font-bold mb-6">SkySurfer</h2>

          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3">Location</h3>
            <div className="space-y-2">
              {[
                { name: "New York", lat: 40.7128, lng: -74.006 },
                { name: "Los Angeles", lat: 34.0522, lng: -118.2437 },
                { name: "Tokyo", lat: 35.6762, lng: 139.6503 },
                { name: "London", lat: 51.5074, lng: -0.1278 },
                { name: "Paris", lat: 48.8566, lng: 2.3522 },
              ].map((loc) => (
                <button
                  key={loc.name}
                  onClick={() =>
                    setSelectedLocation({
                      name: loc.name,
                      lat: loc.lat,
                      lng: loc.lng,
                    })
                  }
                  className={`w-full text-left p-3 rounded-lg ${
                    selectedLocation.name === loc.name ? "bg-blue-600 font-bold" : "bg-slate-700"
                  }`}
                >
                  {loc.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-3">Vehicle</h3>
            <div className="space-y-2">
              {VEHICLES.map((vehicle) => (
                <button
                  key={vehicle.id}
                  onClick={() => setSelectedVehicle(vehicle)}
                  disabled={isFlying}
                  className={`w-full text-left p-3 rounded-lg ${
                    selectedVehicle.id === vehicle.id ? "bg-blue-600" : "bg-slate-700"
                  } ${isFlying ? "opacity-50" : ""}`}
                >
                  <div className="font-bold">{vehicle.name}</div>
                  <div className="text-xs text-gray-300">Max Speed: {vehicle.speed} mph</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath()
  ctx.arc(x, y, size, 0, Math.PI * 2)
  ctx.arc(x + size, y, size * 0.8, 0, Math.PI * 2)
  ctx.arc(x - size, y, size * 0.8, 0, Math.PI * 2)
  ctx.fill()
}

function drawCityscape(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.fillStyle = "#1a1a3e"
  const buildings = [
    { x: 50, h: 150 },
    { x: 150, h: 200 },
    { x: 250, h: 100 },
    { x: 350, h: 250 },
    { x: 450, h: 180 },
    { x: 550, h: 220 },
    { x: width - 150, h: 200 },
  ]

  buildings.forEach((b) => {
    if (b.x < width) {
      ctx.fillRect(b.x, height - b.h, 80, b.h)
      ctx.fillStyle = "#FFD700"
      for (let i = 0; i < b.h; i += 20) {
        for (let j = 0; j < 80; j += 20) {
          ctx.fillRect(b.x + j + 5, height - b.h + i + 5, 10, 10)
        }
      }
      ctx.fillStyle = "#1a1a3e"
    }
  })
}
