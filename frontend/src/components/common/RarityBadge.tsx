import { Rarity } from '../../types'
import { getRarityText, getRarityColor, getRarityBg } from '../../utils/helpers'

interface RarityBadgeProps {
  rarity: Rarity
  size?: 'sm' | 'md' | 'lg'
}

export const RarityBadge = ({ rarity, size = 'md' }: RarityBadgeProps) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
  }

  return (
    <span className={`${sizeClasses[size]} rounded-full font-semibold ${getRarityColor(rarity)} ${getRarityBg(rarity)} border border-current/30`}>
      {getRarityText(rarity)}
    </span>
  )
}
