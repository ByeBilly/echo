"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function EchoAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentPhrase, setCurrentPhrase] = useState(0)

  const phrases = ["Hello! 👋", "¡Hola! 👋", "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! 👋", "你好! 👋", "Bawo ni! 👋"]

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setCurrentPhrase((prev) => (prev + 1) % phrases.length)
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [isOpen, phrases.length])

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 rounded-2xl mb-4 shadow-lg max-w-xs"
          >
            <p className="text-white font-medium">{phrases[currentPhrase]}</p>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-4 h-4 bg-indigo-600"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="bg-gradient-to-r from-blue-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-2 border-white relative overflow-hidden"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <img src="/images/echo-avatar.png" alt="Echo Assistant" className="w-14 h-14 object-cover rounded-full" />
      </motion.button>
    </div>
  )
}
