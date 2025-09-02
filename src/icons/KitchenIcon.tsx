import React from 'react'

export default function KitchenIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="7" rx="1"/>
      <rect x="5" y="14" width="6" height="7" rx="1"/>
      <rect x="13" y="10" width="6" height="11" rx="1"/>
      <path d="M7 6h.01M11 6h.01M15 6h.01M19 6h.01"/>
    </svg>
  )
}

