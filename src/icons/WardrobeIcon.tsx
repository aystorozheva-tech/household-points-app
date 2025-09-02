import React from 'react'

export default function WardrobeIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="3" width="14" height="18" rx="1"/>
      <path d="M12 3v18"/>
      <path d="M9 10h.01M15 10h.01"/>
    </svg>
  )
}

