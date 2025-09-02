import React from 'react'

export default function BroomIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21l6-6"/>
      <path d="M15 3l6 6"/>
      <path d="M4 16l4 4"/>
      <path d="M7 13l4 4"/>
      <path d="M12 8l4 4"/>
    </svg>
  )
}

