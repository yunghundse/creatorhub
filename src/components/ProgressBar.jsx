import React from 'react'

const ProgressBar = ({ progress, color = "#FF6B9D", height = 6 }) => (
  <div style={{
    height: `${height}px`,
    background: 'rgba(42, 36, 32, 0.06)',
    borderRadius: `${height / 2}px`,
    overflow: 'hidden'
  }}>
    <div style={{
      height: '100%',
      width: `${progress}%`,
      background: `linear-gradient(90deg, ${color}, ${color}dd)`,
      borderRadius: `${height / 2}px`,
      transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
    }} />
  </div>
)

export default ProgressBar
