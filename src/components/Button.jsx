import React from 'react'

const Button = ({ children, onClick, variant = "primary", className = "", style = {}, type = "button", disabled = false }) => {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    borderRadius: '14px',
    fontWeight: '600',
    fontSize: '15px',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: disabled ? 0.5 : 1,
    fontFamily: 'inherit',
  }

  const variants = {
    primary: {
      ...base,
      background: 'linear-gradient(135deg, #FF8FAB 0%, #FF6B9D 50%, #E05585 100%)',
      color: 'white',
      boxShadow: '0 4px 15px rgba(255, 107, 157, 0.3)',
    },
    secondary: {
      ...base,
      background: 'rgba(255, 107, 157, 0.08)',
      color: '#FF6B9D',
      border: '1.5px solid rgba(255, 107, 157, 0.2)',
    },
    cream: {
      ...base,
      background: 'linear-gradient(135deg, #FFF9EB 0%, #FFE8B8 100%)',
      color: '#5C5349',
      boxShadow: '0 4px 15px rgba(245, 208, 169, 0.3)',
    },
    ghost: {
      ...base,
      background: 'transparent',
      color: '#7A6F62',
      padding: '8px 16px',
    },
    google: {
      ...base,
      background: '#FFFFFF',
      color: '#3D362F',
      border: '1.5px solid #E8DFD3',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...variants[variant], ...style }}
      className={className}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(-1px)'
          if (variant === 'primary') e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 107, 157, 0.4)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        if (variant === 'primary') e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 107, 157, 0.3)'
      }}
    >
      {children}
    </button>
  )
}

export default Button
