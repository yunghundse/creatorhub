import React from 'react'

const ContentProtection = ({ children, userId, timestamp }) => {
  const watermarkText = `${userId || 'user'} ${timestamp || new Date().toISOString().slice(0, 16)}`

  const handleContextMenu = (e) => {
    e.preventDefault()
  }

  // Generate repeated watermark positions for a diagonal pattern
  const watermarkPositions = []
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 4; col++) {
      watermarkPositions.push({
        top: `${row * 18 + 5}%`,
        left: `${col * 28 - 5}%`,
      })
    }
  }

  return (
    <div
      onContextMenu={handleContextMenu}
      onDragStart={(e) => e.preventDefault()}
      style={{
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
      }}
    >
      {/* Protected content */}
      {children}

      {/* Watermark overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 10,
          overflow: 'hidden',
        }}
      >
        {watermarkPositions.map((pos, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              top: pos.top,
              left: pos.left,
              transform: 'rotate(-30deg)',
              fontSize: '12px',
              fontWeight: '600',
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              color: 'rgba(42, 36, 32, 0.15)',
              whiteSpace: 'nowrap',
              letterSpacing: '1px',
              pointerEvents: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          >
            {watermarkText}
          </span>
        ))}
      </div>
    </div>
  )
}

export default ContentProtection
