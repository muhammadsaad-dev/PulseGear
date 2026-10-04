import React from 'react'

function Message({ variant = 'info', children, onClose }) {
  const styles = {
    danger: 'bg-rose-950/30 border-rose-800/60 text-rose-300',
    success: 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300',
    warning: 'bg-amber-950/30 border-amber-800/60 text-amber-300',
    info: 'bg-zinc-900 border-zinc-800 text-zinc-300',
  }

  return (
    <div className={`p-3 rounded-lg border text-xs leading-relaxed my-3 ${styles[variant] || styles.info}`}>
      {children}
    </div>
  )
}

export default Message
