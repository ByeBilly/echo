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

export function SkySurferSimulator() {
  const [selectedLocation, setSelectedLocation] = useState({ lat: 40.7128, lng: -74.006, name: "New York" })
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>(VEHICLES[0])
  const [isFlying, setIsFlying] = useState(false)
  const [altitude, setAltitude] = useState(0)
  const [speed, setSpeed] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [showMenu, setShowMenu] = useState(true)

  useEffect(() => {
    // Initialize canvas rendering
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Set canvas size
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      const animationId = setInterval(() => {
        // Clear canvas with sky gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
        gradient.addColorStop(0, "#87CEEB")
        gradient.addColorStop(1, "#E0F6FF")
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw altitude lanes if flying
        if (isFlying) {
          // Urban lane (0-50ft)
          ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
          ctx.lineWidth = 2
          ctx.setLineDash([10, 10])
          ctx.beginPath()
          ctx.moveTo(0, canvas.height - 100)
          ctx.lineTo(canvas.width, canvas.height - 100)
          ctx.stroke()

          // Transit lane (50-500ft)
          ctx.beginPath()
          ctx.moveTo(0, canvas.height - 250)
          ctx.lineTo(canvas.width, canvas.height - 250)
          ctx.stroke()

          // Regional lane (500ft+)
          ctx.beginPath()
          ctx.moveTo(0, canvas.height - 400)
          ctx.lineTo(canvas.width, canvas.height - 400)
          ctx.stroke()
          ctx.setLineDash([])

          // Draw flying car
          const carX = canvas.width / 2
          const carY = canvas.height - (altitude / selectedVehicle.maxAltitude) * 400

          // Car body
          ctx.fillStyle = selectedVehicle.color
          ctx.fillRect(carX - 30, carY - 15, 60, 30)

          // Windows
          ctx.fillStyle = "#87CEEB"
          ctx.fillRect(carX - 25, carY - 10, 15, 10)
          ctx.fillRect(carX + 10, carY - 10, 15, 10)

          // Wings
          ctx.fillStyle = selectedVehicle.color
          ctx.beginPath()
          ctx.moveTo(carX - 30, carY)
          ctx.lineTo(carX - 50, carY - 5)
          ctx.lineTo(carX - 30, carY + 5)
          ctx.fill()

          ctx.beginPath()
          ctx.moveTo(carX + 30, carY)
          ctx.lineTo(carX + 50, carY - 5)
          ctx.lineTo(carX + 30, carY + 5)
          ctx.fill()
        }

        // Draw city skyline
        ctx.fillStyle = "#808080"
        const buildings = [
          { x: 50, h: 150 },
          { x: 150, h: 200 },
          { x: 250, h: 100 },
          { x: 350, h: 250 },
          { x: 450, h: 180 },
          { x: 550, h: 220 },
          { x: canvas.width - 150, h: 200 },
        ]

        buildings.forEach((b) => {
          if (b.x < canvas.width) {
            ctx.fillRect(b.x, canvas.height - b.h, 80, b.h)
            // Windows
            ctx.fillStyle = "#FFD700"
            for (let i = 0; i < b.h; i += 20) {
              for (let j = 0; j < 80; j += 20) {
                ctx.fillRect(b.x + j + 5, canvas.height - b.h + i + 5, 10, 10)
              }
            }
            ctx.fillStyle = "#808080"
          }
        })
      }, 1000 / 60)

      return () => clearInterval(animationId)
    }
  }, [isFlying, altitude, selectedVehicle])

  const handleTakeoff = () => {
    setIsFlying(!isFlying)
    if (!isFlying) {
      setAltitude(0)
      setSpeed(0)
    }
  }

  const handleAltitudeChange = (newAltitude: number) => {
    const maxAlt = selectedVehicle.maxAltitude
    setAltitude(Math.max(0, Math.min(newAltitude, maxAlt)))
  }

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(Math.max(0, Math.min(newSpeed, selectedVehicle.speed)))
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Canvas for 3D rendering */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-screen" />

      {/* HUD (Heads-Up Display) */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 bg-black/30 text-white p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">SkySurfer</h1>
              <p className="text-sm text-gray-300">{selectedLocation.name}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{altitude.toFixed(0)} ft</div>
              <div className="text-sm text-gray-300">{speed.toFixed(0)} mph</div>
            </div>
          </div>
        </div>

        {/* Altitude lanes indicator */}
        <div className="absolute right-4 top-32 bg-black/50 text-white p-4 rounded-lg">
          <div className="text-sm font-bold mb-2">Altitude Lanes</div>
          <div className={`text-xs mb-1 ${altitude < 50 ? "text-green-400" : "text-gray-400"}`}>Urban: 0-50 ft</div>
          <div className={`text-xs mb-1 ${altitude >= 50 && altitude < 500 ? "text-blue-400" : "text-gray-400"}`}>
            Transit: 50-500 ft
          </div>
          <div className={`text-xs ${altitude >= 500 ? "text-purple-400" : "text-gray-400"}`}>Regional: 500+ ft</div>
        </div>

        {/* Control panel */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              {/* Vehicle Info */}
              <div className="pointer-events-auto">
                <div className="text-sm font-bold mb-2">Vehicle: {selectedVehicle.name}</div>
                <div className="text-xs text-gray-300">Max Speed: {selectedVehicle.speed} mph</div>
                <div className="text-xs text-gray-300">Max Altitude: {selectedVehicle.maxAltitude} ft</div>
              </div>

              {/* Controls */}
              <div className="pointer-events-auto space-y-2">
                <button
                  onClick={handleTakeoff}
                  className={`w-full py-2 px-4 rounded-lg font-bold transition-all ${
                    isFlying ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {isFlying ? "Land" : "Take Off"}
                </button>
              </div>

              {/* Location */}
              <div className="pointer-events-auto">
                <div className="text-sm font-bold mb-2">Location: {selectedLocation.name}</div>
                <div className="text-xs text-gray-300">
                  {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                </div>
              </div>
            </div>

            {/* Sliders */}
            {isFlying && (
              <div className="pointer-events-auto space-y-3">
                <div>
                  <label className="text-sm font-bold block mb-1">Altitude: {altitude.toFixed(0)} ft</label>
                  <input
                    type="range"
                    min="0"
                    max={selectedVehicle.maxAltitude}
                    value={altitude}
                    onChange={(e) => handleAltitudeChange(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold block mb-1">Speed: {speed.toFixed(0)} mph</label>
                  <input
                    type="range"
                    min="0"
                    max={selectedVehicle.speed}
                    value={speed}
                    onChange={(e) => handleSpeedChange(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu Toggle */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="absolute top-4 right-4 bg-white/90 hover:bg-white text-black px-4 py-2 rounded-lg font-bold z-40 pointer-events-auto transition-all"
      >
        {showMenu ? "Hide Menu" : "Show Menu"}
      </button>

      {/* Side Menu */}
      {showMenu && (
        <div className="absolute left-0 top-0 h-full w-80 bg-black/90 text-white p-6 overflow-y-auto pointer-events-auto z-30">
          <h2 className="text-2xl font-bold mb-6">SkySurfer</h2>

          {/* Location Selector */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3">Select Location</h3>
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
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedLocation.name === loc.name ? "bg-blue-600 font-bold" : "bg-slate-700 hover:bg-slate-600"
                  }`}
                >
                  {loc.name}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Selector */}
          <div>
            <h3 className="text-lg font-bold mb-3">Select Vehicle</h3>
            <div className="space-y-2">
              {VEHICLES.map((vehicle) => (
                <button
                  key={vehicle.id}
                  onClick={() => setSelectedVehicle(vehicle)}
                  disabled={isFlying}
                  className={`
                    w-full text-left p-3 rounded-lg transition-all
                    ${selectedVehicle.id === vehicle.id ? "bg-blue-600 font-bold" : "bg-slate-700 hover:bg-slate-600"}
                    ${isFlying ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  <div className="font-bold">{vehicle.name}</div>
                  <div className="text-xs text-gray-300">
                    Speed: {vehicle.speed} mph | Max Alt: {vehicle.maxAltitude} ft
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
