"use client"

import { useRef, useEffect, useState } from "react"

interface CameraComponentProps {
  onFrame?: (canvas: HTMLCanvasElement) => void
  isRecording: boolean
}

export function CameraComponent({ onFrame, isRecording }: CameraComponentProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    let animationFrame: number

    const processFrame = () => {
      if (videoRef.current && canvasRef.current && isRecording) {
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        const video = videoRef.current

        if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight

          // Draw current frame to canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

          // Send frame for processing
          if (onFrame) {
            onFrame(canvas)
          }
        }
      }

      if (isRecording) {
        animationFrame = requestAnimationFrame(processFrame)
      }
    }

    if (isRecording) {
      processFrame()
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [isRecording, onFrame])

  return (
    <div className="relative">
      <video ref={videoRef} className="w-full h-auto" autoPlay playsInline muted />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
