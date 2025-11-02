"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"

interface MapPosition {
  lat: number
  lng: number
  zoom: number
}

export interface GoogleMapOverlayProps {
  position: MapPosition
  mapType: "satellite" | "roadmap"
  onPositionChange?: (pos: MapPosition) => void
  containerRef?: React.RefObject<HTMLDivElement>
}

export function GoogleMapOverlay({ position, mapType, onPositionChange, containerRef }: GoogleMapOverlayProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const mapInstanceRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isLoaded || typeof window === "undefined") return

    // Check if already loaded
    if ((window as any).google?.maps) {
      setIsLoaded(true)
      return
    }

    // Load the initialization script from server route
    const script = document.createElement("script")
    script.src = "/api/maps-init"
    script.async = true
    script.onload = () => {
      console.log("[v0] Maps initialization script loaded from server")
    }
    script.onerror = () => {
      console.error("[v0] Failed to load maps initialization script")
      setError("Failed to load Google Maps. Please check your configuration.")
    }

    document.head.appendChild(script)

    // Listen for initialization events
    const handleReady = () => {
      if ((window as any).google?.maps) {
        setIsLoaded(true)
        console.log("[v0] Google Maps API initialized")
      }
    }

    const handleError = () => {
      setError("Failed to initialize Google Maps API.")
      console.error("[v0] Google Maps initialization failed")
    }

    window.addEventListener("googleMapsInitialized", handleReady)
    window.addEventListener("googleMapsInitError", handleError)

    // Check periodically if Maps is ready
    const checkInterval = setInterval(() => {
      if ((window as any).google?.maps) {
        setIsLoaded(true)
        clearInterval(checkInterval)
      }
    }, 100)

    return () => {
      window.removeEventListener("googleMapsInitialized", handleReady)
      window.removeEventListener("googleMapsInitError", handleError)
      clearInterval(checkInterval)
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [isLoaded])

  // Initialize map when API is loaded
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return

    const google = (window as any).google
    if (!google?.maps) return

    const mapInstance = new google.maps.Map(mapRef.current, {
      center: { lat: position.lat, lng: position.lng },
      zoom: position.zoom,
      mapTypeId: mapType === "satellite" ? google.maps.MapTypeId.SATELLITE : google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      zoomControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      keyboardShortcuts: false,
    })

    mapInstanceRef.current = mapInstance
    setMap(mapInstance)
    console.log("[v0] Map instance created at", position)
  }, [isLoaded])

  // Update map type
  useEffect(() => {
    if (mapInstanceRef.current && (window as any).google?.maps) {
      const google = (window as any).google
      mapInstanceRef.current.setMapTypeId(
        mapType === "satellite" ? google.maps.MapTypeId.SATELLITE : google.maps.MapTypeId.ROADMAP,
      )
    }
  }, [mapType])

  // Update map position
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter({ lat: position.lat, lng: position.lng })
      mapInstanceRef.current.setZoom(position.zoom)
    }
  }, [position])

  if (error) {
    return (
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-red-900/60 to-red-950/60 flex items-center justify-center z-10">
        <div className="text-white text-center p-8 bg-red-950/90 rounded-lg max-w-md backdrop-blur-sm">
          <p className="font-bold mb-3 text-lg">⚠️ Maps Configuration Required</p>
          <p className="text-sm mb-4 leading-relaxed">{error}</p>
          <div className="bg-red-900/50 p-4 rounded mb-4 text-left">
            <p className="text-xs font-mono text-yellow-300 mb-2">Next steps:</p>
            <ol className="text-xs space-y-1 text-gray-200">
              <li>1. Get your API key from Google Cloud</li>
              <li>2. Add to Vercel vars: GOOGLE_MAPS_API_KEY</li>
              <li>3. Refresh the page</li>
            </ol>
          </div>
          <a
            href="https://console.cloud.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-300 hover:text-blue-200 underline"
          >
            Get API Key
          </a>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center z-10">
        <div className="text-white text-center">
          <div className="inline-block">
            <div className="animate-spin h-12 w-12 border-4 border-blue-400 border-t-blue-600 rounded-full mb-4"></div>
          </div>
          <p className="font-semibold">Loading Google Maps...</p>
          <p className="text-xs text-gray-300 mt-2">Initializing map interface</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={mapRef}
      className="absolute inset-0 w-full h-full bg-gray-200"
      style={{ opacity: isLoaded ? 1 : 0.5, transition: "opacity 0.3s" }}
    />
  )
}
