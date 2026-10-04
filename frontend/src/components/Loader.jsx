import React from 'react'

function Loader({ size = 'md', text = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3 my-4">
      <div className={`${sizeClasses[size] || sizeClasses.md} rounded-full border-zinc-700 border-t-zinc-200 animate-spin`}></div>
      {text && <p className="text-xs text-zinc-400">{text}</p>}
    </div>
  )
}

export default Loader
