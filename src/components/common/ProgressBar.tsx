interface ProgressBarProps {
  value: number
  max: number
  color?: string
  showText?: boolean
  height?: string
}

export const ProgressBar = ({ value, max, color = 'purple', showText = true, height = 'h-2' }: ProgressBarProps) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  const colorClasses: Record<string, string> = {
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  }

  return (
    <div className="w-full">
      <div className={`w-full ${height} bg-gray-700 rounded-full overflow-hidden`}>
        <div
          className={`h-full ${colorClasses[color]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showText && (
        <p className="text-xs text-gray-400 mt-1 text-right">{value} / {max}</p>
      )}
    </div>
  )
}
