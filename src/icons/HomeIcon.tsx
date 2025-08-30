import React from 'react'

const styles = {
  Icon: {
    color: '#030303',
    fill: '#030303',
    fontSize: '24px',
    top: '608px',
    left: '32px',
    width: '24px',
    height: '32px',
  },
};

export default function HomeIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
  <svg style={styles.Icon}  viewBox="0 0 24 24">
    <path d="M0 0h24v24H0z" fill="none">
    </path>
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z">
    </path>
  </svg>
  )
}