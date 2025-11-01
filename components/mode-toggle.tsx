"use client"

export function ModeToggle({
  isKidsMode,
  setIsKidsMode,
}: {
  isKidsMode: boolean
  setIsKidsMode: (value: boolean) => void
}) {
  return (
    <button
      onClick={() => setIsKidsMode(!isKidsMode)}
      className={`
        px-6 py-3 rounded-full font-bold transition-all
        ${isKidsMode ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white" : "bg-slate-700 text-gray-300"}
      `}
    >
      {isKidsMode ? "👶 Kids Mode" : "👨‍💻 Studio Mode"}
    </button>
  )
}
