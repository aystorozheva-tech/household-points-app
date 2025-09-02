import React from 'react'

export default function MopIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v14"/>
      <path d="M6 20h12l-1 2H7l-1-2Z"/>
      <path d="M10 16h4"/>
    </svg>
  )
}

