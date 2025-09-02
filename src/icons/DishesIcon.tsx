import React from 'react'

export default function DishesIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="12" r="5"/>
      <rect x="13" y="7" width="7" height="10" rx="2"/>
    </svg>
  )
}

