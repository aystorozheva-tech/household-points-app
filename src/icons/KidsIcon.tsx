import React from 'react'

export default function KidsIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="7" r="3"/>
      <circle cx="16" cy="7" r="3"/>
      <path d="M2 20a6 6 0 0 1 12 0M10 20a6 6 0 0 1 12 0"/>
    </svg>
  )
}

