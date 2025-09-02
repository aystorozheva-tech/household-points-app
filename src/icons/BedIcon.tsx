import React from 'react'

export default function BedIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v10M21 17V9a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3"/>
      <path d="M3 14h18"/>
      <rect x="6" y="10" width="5" height="3" rx="1"/>
      <rect x="12.5" y="10" width="5.5" height="3" rx="1"/>
    </svg>
  )
}

