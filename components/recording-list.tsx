"use client"

import { Play, Download, Trash2, Pause } from "lucide-react"

interface Recording {
  id: string
  name: string
  duration: number
  blob: Blob
  timestamp: number
}

interface RecordingListProps {
  recordings: Recording[]
  onPlay: (recording: Recording) => void
  onDownload: (recording: Recording) => void
  onDelete: (id: string) => void
  playingId: string | null
  formatTime: (seconds: number) => string
}

export function RecordingList({ recordings, onPlay, onDownload, onDelete, playingId, formatTime }: RecordingListProps) {
  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {recordings.map((recording) => (
        <div
          key={recording.id}
          className="bg-gradient-to-r from-purple-900/40 to-slate-900/40 backdrop-blur-md border border-purple-500/20 rounded-xl p-4 hover:border-purple-500/40 transition-all flex items-center justify-between group"
        >
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold truncate">{recording.name}</p>
            <p className="text-purple-300 text-sm">
              {formatTime(recording.duration)} • {new Date(recording.timestamp).toLocaleDateString()}
            </p>
          </div>

          <div className="flex gap-2 ml-4 flex-shrink-0">
            <button
              onClick={() => onPlay(recording)}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-all transform hover:scale-110"
              title="Play"
            >
              {playingId === recording.id ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button
              onClick={() => onDownload(recording)}
              className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-all transform hover:scale-110"
              title="Download"
            >
              <Download size={20} />
            </button>
            <button
              onClick={() => onDelete(recording.id)}
              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-all transform hover:scale-110"
              title="Delete"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
