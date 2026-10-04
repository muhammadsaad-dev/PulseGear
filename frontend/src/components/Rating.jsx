import React from 'react'
import { Star } from 'lucide-react'

function Rating({ value = 0, text = '', className = '' }) {
  const numericValue = Number(value) || 0

  return (
    <div className={`flex items-center gap-1 text-amber-400 ${className}`}>
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = numericValue >= star
          const half = numericValue >= star - 0.5 && numericValue < star

          return (
            <span key={star} className="relative inline-block">
              {half ? (
                <div className="relative">
                  <Star className="w-4 h-4 text-slate-600 fill-slate-800" />
                  <div className="absolute inset-0 overflow-hidden w-1/2">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </div>
                </div>
              ) : (
                <Star
                  className={`w-4 h-4 transition-colors ${
                    filled
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-slate-600 fill-slate-800/40'
                  }`}
                />
              )}
            </span>
          )
        })}
      </div>
      {text && (
        <span className="text-xs font-medium text-slate-400 ml-1.5">{text}</span>
      )}
    </div>
  )
}

export default Rating
