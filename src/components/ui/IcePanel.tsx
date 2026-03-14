'use client'

import React from 'react'

interface IcePanelProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}

export default function IcePanel({ children, className = '', style = {}, onClick }: IcePanelProps) {
  return (
    <div
      className={`ice-panel ${className}`}
      style={{
        background: 'linear-gradient(145deg, rgba(12,35,90,0.85), rgba(6,20,58,0.92))',
        border: '1px solid rgba(70,160,255,0.22)',
        borderRadius: '14px',
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
