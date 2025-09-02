import React from 'react'

export default function BrokenHeartIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" className={className}>
      <path d="M16.5 3.5c-1.74 0-3.41.81-4.5 2.09C10.91 4.31 9.24 3.5 7.5 3.5A5.5 5.5 0 0 0 2 9c0 5.25 6.75 9.75 9.3 11.22.42.24.98.24 1.4 0C15.25 18.75 22 14.25 22 9a5.5 5.5 0 0 0-5.5-5.5Zm-4.41 13.07-1.96-2.67 2.12-2.12-2.75-3.67 3.5 2-.5 2.5 2 1-2.41 2.96Z"/>
    </svg>
  )
}

