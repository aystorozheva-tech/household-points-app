import React from 'react'

export default function FeatherIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 2c-5 0-9 4-9 9v2l-7 7"/>
      <path d="M14 8l2 2"/>
      <path d="M12 12l2 2"/>
      <path d="M10 16l2 2"/>
    </svg>
  )
}

