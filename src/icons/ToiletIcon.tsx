import React from 'react'

export default function ToiletIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="10" height="8" rx="2"/>
      <path d="M9 11v3a4 4 0 0 0 4 4h3v3H8"/>
    </svg>
  )
}

