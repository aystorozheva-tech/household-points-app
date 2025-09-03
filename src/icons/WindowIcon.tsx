import React from 'react'

export default function WindowIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" aria-hidden="true">
      <path d="M0 0h24v24H0V0z" fill="none"></path>
      <path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 9h-7V4h7v7zm-9-7v7H4V4h7zm-7 9h7v7H4v-7zm9 7v-7h7v7h-7z"></path>
    </svg>
  )
}

