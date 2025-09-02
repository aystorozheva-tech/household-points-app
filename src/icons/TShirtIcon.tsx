import React from 'react'

export default function TShirtIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 3l3 3-3 3v12H8V9L5 6l3-3 4 2 4-2Z"/>
    </svg>
  )
}

