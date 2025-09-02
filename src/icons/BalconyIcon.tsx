import React from 'react'

export default function BalconyIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="10" rx="1"/>
      <path d="M6 13v6M10 13v6M14 13v6M18 13v6"/>
      <path d="M3 19h18"/>
    </svg>
  )
}

