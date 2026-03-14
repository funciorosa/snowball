'use client'

import { useEffect, useRef } from 'react'

interface Snowflake {
  x: number
  y: number
  size: number
  speed: number
  drift: number
  opacity: number
  angle: number
  angleSpeed: number
}

export default function SnowfallCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const flakesRef = useRef<Snowflake[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Init snowflakes
    flakesRef.current = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 1.2 + 0.4,
      drift: (Math.random() - 0.5) * 0.8,
      opacity: Math.random() * 0.5 + 0.15,
      angle: Math.random() * Math.PI * 2,
      angleSpeed: (Math.random() - 0.5) * 0.02,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      flakesRef.current.forEach((flake) => {
        ctx.beginPath()
        ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 235, 255, ${flake.opacity})`
        ctx.fill()

        // Small glow
        ctx.beginPath()
        ctx.arc(flake.x, flake.y, flake.size * 1.8, 0, Math.PI * 2)
        const gradient = ctx.createRadialGradient(
          flake.x, flake.y, 0,
          flake.x, flake.y, flake.size * 1.8
        )
        gradient.addColorStop(0, `rgba(125, 219, 255, ${flake.opacity * 0.3})`)
        gradient.addColorStop(1, 'rgba(125, 219, 255, 0)')
        ctx.fillStyle = gradient
        ctx.fill()

        // Update position
        flake.y += flake.speed
        flake.x += flake.drift
        flake.angle += flake.angleSpeed

        if (flake.y > canvas.height + 10) {
          flake.y = -10
          flake.x = Math.random() * canvas.width
        }
        if (flake.x > canvas.width + 10) flake.x = -10
        if (flake.x < -10) flake.x = canvas.width + 10
      })

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
