"use client"

import { useState } from "react"

export interface ShareableSession {
  location: string
  vehicle: string
  altitude: number
  speed: number
  timestamp: Date
  distance: number
  duration: number
}

export function ViralSharing({ session }: { session: ShareableSession }) {
  const [copied, setCopied] = useState(false)

  const generateShareText = () => {
    return `Just flew my ${session.vehicle} over ${session.location} at ${session.altitude} ft altitude reaching ${session.speed} mph! Check out SkySurfer - the ultimate flying car simulator!`
  }

  const generateShareUrl = () => {
    const params = new URLSearchParams({
      location: session.location,
      vehicle: session.vehicle,
      altitude: session.altitude.toString(),
      speed: session.speed.toString(),
    })
    return `${typeof window !== "undefined" ? window.location.origin : ""}/skysurfer?challenge=${params.toString()}`
  }

  const handleShare = (platform: "twitter" | "facebook" | "whatsapp") => {
    const text = generateShareText()
    const url = generateShareUrl()

    const shareUrls: { [key: string]: string } = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
    }

    window.open(shareUrls[platform], "_blank")
  }

  const handleCopyLink = () => {
    const url = generateShareUrl()
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white">Share Your Flight</h3>
      <p className="text-sm text-gray-300">{generateShareText()}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <button
          onClick={() => handleShare("twitter")}
          className="px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded-lg font-bold transition-all"
        >
          Twitter
        </button>
        <button
          onClick={() => handleShare("facebook")}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all"
        >
          Facebook
        </button>
        <button
          onClick={() => handleShare("whatsapp")}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition-all"
        >
          WhatsApp
        </button>
        <button
          onClick={handleCopyLink}
          className={`px-4 py-2 rounded-lg font-bold transition-all ${
            copied ? "bg-green-600 text-white" : "bg-gray-600 hover:bg-gray-700 text-white"
          }`}
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>
    </div>
  )
}
