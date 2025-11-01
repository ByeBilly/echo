"use client"

import { motion } from "framer-motion"

interface FeatureButtonProps {
  icon: string
  title: string
  description: string
  bgImage?: string
}

export function FeatureButton({ icon, title, description, bgImage }: FeatureButtonProps) {
  return (
    <motion.div
      className="bg-gradient-to-br from-purple-800/70 to-indigo-900/70 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 shadow-lg cursor-pointer relative overflow-hidden"
      whileHover={{
        scale: 1.05,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {bgImage && (
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      )}
      <div className="relative z-10">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-purple-200">{description}</p>
      </div>
    </motion.div>
  )
}
