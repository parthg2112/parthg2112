'use client'

import { useEffect, useRef } from 'react'

export default function AudioVisualizer() {
  const canvasRef = useRef(null)
  const audioRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const audio = audioRef.current

    if (!canvas || !audio) return

    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = 100

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const source = audioCtx.createMediaElementSource(audio)
    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 2048

    const bufferLength = analyser.fftSize
    const dataArray = new Uint8Array(bufferLength)

    source.connect(analyser)
    analyser.connect(audioCtx.destination)

    const draw = () => {
      requestAnimationFrame(draw)
      analyser.getByteTimeDomainData(dataArray)

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.lineWidth = 2
      ctx.strokeStyle = '#0ff'
      ctx.beginPath()

      const sliceWidth = canvas.width / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * canvas.height) / 2

        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        x += sliceWidth
      }

      ctx.lineTo(canvas.width, canvas.height / 2)
      ctx.stroke()
    }

    draw()

    const handleResize = () => (canvas.width = window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      <audio
        ref={audioRef}
        src="/audio/beach.mp3"
        autoPlay
        loop
        style={{ display: 'none' }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100vw',
          height: '100px',
          zIndex: 50,
          pointerEvents: 'none',
          filter: 'drop-shadow(0 0 8px #f5f3e4) brightness(1.2)',
        }}
      />
    </>
  )
}
