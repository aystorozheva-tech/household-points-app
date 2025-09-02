import React from 'react'

export default function SofaIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 13v-1a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v1"/>
      <rect x="3" y="13" width="18" height="5" rx="2"/>
      <path d="M6 18v2M18 18v2"/>
    </svg>
  )
}

