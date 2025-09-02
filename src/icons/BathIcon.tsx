import React from 'react'

export default function BathIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 13h18v2a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-2Z"/>
      <path d="M7 7a3 3 0 0 1 6 0v6"/>
      <path d="M7 19v2M17 19v2"/>
    </svg>
  )
}

