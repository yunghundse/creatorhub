import React from 'react'

const Card = ({ children, className = "", style = {}, onClick, hover = true }) => (
  <div
    onClick={onClick}
    className={`glass-card ${hover ? '' : ''} ${className}`}
    style={{
      padding: '20px',
      cursor: onClick ? 'pointer' : 'default',
      ...style
    }}
  >
    {children}
  </div>
)

export default Card
