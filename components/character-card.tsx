"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"

interface CharacterCardProps {
  name: string
  country: string
  flag: string
  languages: string[]
  instrument: string
  image: string
  isAI?: boolean
}

export function CharacterCard({ name, country, flag, languages, instrument, image, isAI = false }: CharacterCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className={`rounded-xl overflow-hidden shadow-lg ${isAI ? "bg-gradient-to-br from-blue-900 to-purple-900" : "bg-gradient-to-br from-purple-900 to-indigo-900"} border border-purple-500/30 relative`}
      whileHover={{
        y: -10,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
      }}
      transition={{ type: "spring", stiffness: 300 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-64 overflow-hidden">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          fill
          className="object-cover transition-transform duration-700"
          style={{ transform: isHovered ? "scale(1.1)" : "scale(1)" }}
        />
        {isAI && (
          <div className="absolute inset-0 bg-gradient-to-t from-blue-500/30 to-transparent mix-blend-overlay" />
        )}
      </div>
      <div className="p-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-bold">{name}</h3>
          <span className="text-2xl" aria-label={`Flag of ${country}`}>
            {flag}
          </span>
        </div>
        <div className="mb-2">
          <span className="text-purple-300 text-sm">Country:</span>
          <span className="ml-2">{country}</span>
        </div>
        <div className="mb-2">
          <span className="text-purple-300 text-sm">Languages:</span>
          <span className="ml-2">{languages.join(", ")}</span>
        </div>
        <div className="mb-4">
          <span className="text-purple-300 text-sm">Instrument:</span>
          <span className="ml-2">{instrument}</span>
        </div>
        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300">
          Learn More
        </button>
      </div>

      {/* Decorative musical notes that appear on hover */}
      {isHovered && (
        <>
          <motion.div
            className="absolute -top-4 -right-4 text-yellow-300 text-2xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            ♪
          </motion.div>
          <motion.div
            className="absolute top-10 -right-2 text-pink-300 text-xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            ♫
          </motion.div>
        </>
      )}
    </motion.div>
  )
}
