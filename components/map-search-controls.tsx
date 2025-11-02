"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Search, MapPin } from "lucide-react"

interface MapPosition {
  lat: number
  lng: number
  zoom: number
  name: string
}

export interface MapSearchControlsProps {
  onLocationChange: (pos: MapPosition) => void
  currentLocation: MapPosition
  mapType: "satellite" | "roadmap"
  onMapTypeChange: (type: "satellite" | "roadmap") => void
}

export function MapSearchControls({
  onLocationChange,
  currentLocation,
  mapType,
  onMapTypeChange,
}: MapSearchControlsProps) {
  const [searchInput, setSearchInput] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [suggestions, setSuggestions] = useState<MapPosition[]>([])
  const [gpsLoading, setGpsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSearch = async (query: string) => {
    if (!query.trim() || !(window as any).google?.maps) return

    setIsSearching(true)
    try {
      const google = (window as any).google
      const geocoder = new google.maps.Geocoder()
      const result = await geocoder.geocode({ address: query })

      if (result.results && result.results.length > 0) {
        const locations: MapPosition[] = result.results.slice(0, 5).map((r: any) => ({
          lat: r.geometry.location.lat(),
          lng: r.geometry.location.lng(),
          zoom: 16,
          name: r.formatted_address,
        }))
        setSuggestions(locations)
        console.log("[v0] Search results:", locations)
      }
    } catch (error) {
      console.error("[v0] Geocoding error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleGPSLocation = () => {
    setGpsLoading(true)
    if (!navigator.geolocation) {
      console.error("[v0] Geolocation not supported")
      setGpsLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos: MapPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          zoom: 16,
          name: "Your Location",
        }
        onLocationChange(pos)
        setSearchInput("Your Location")
        setSuggestions([])
        console.log("[v0] GPS location obtained:", pos)
        setGpsLoading(false)
      },
      (error) => {
        console.error("[v0] GPS error:", error)
        setGpsLoading(false)
      },
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchInput(value)
    if (value.trim()) {
      const timer = setTimeout(() => handleSearch(value), 300)
      return () => clearTimeout(timer)
    }
  }

  return (
    <div className="absolute top-24 left-6 z-20 flex flex-col gap-3 w-72">
      {/* Search Input */}
      <div className="relative">
        <div className="flex gap-2 bg-white rounded-lg shadow-lg overflow-hidden">
          <input
            ref={inputRef}
            type="text"
            value={searchInput}
            onChange={handleInputChange}
            placeholder="Search location (e.g., Eiffel Tower)..."
            className="flex-1 px-4 py-3 outline-none text-sm"
          />
          <button
            onClick={() => handleSearch(searchInput)}
            disabled={isSearching}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white transition-all"
          >
            <Search size={18} />
          </button>
        </div>

        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg max-h-64 overflow-y-auto z-30">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onLocationChange(suggestion)
                  setSearchInput(suggestion.name)
                  setSuggestions([])
                }}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-b-0 text-sm"
              >
                <div className="font-semibold text-gray-900">{suggestion.name.split(",")[0]}</div>
                <div className="text-xs text-gray-500">{suggestion.name}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleGPSLocation}
          disabled={gpsLoading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-all text-sm"
        >
          <MapPin size={16} />
          {gpsLoading ? "Getting GPS..." : "My Location"}
        </button>
        <button
          onClick={() => onMapTypeChange(mapType === "satellite" ? "roadmap" : "satellite")}
          className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all text-sm"
        >
          {mapType === "satellite" ? "Map" : "Satellite"}
        </button>
      </div>

      {/* Current Location Display */}
      <div className="bg-white rounded-lg shadow-lg p-3 text-sm">
        <div className="text-gray-600">Flying over</div>
        <div className="font-bold text-gray-900">{currentLocation.name}</div>
      </div>
    </div>
  )
}
