"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Camera, CameraOff, Type } from "lucide-react"
import { jsQR } from "jsqr"

interface QRScannerProps {
  onScan: (data: string) => void
  isScanning: boolean
  setIsScanning: (scanning: boolean) => void
}

export default function QRScanner({ onScan, isScanning, setIsScanning }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [manualInput, setManualInput] = useState("")
  const [useManualInput, setUseManualInput] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    let stream: MediaStream | null = null
    let animationId: number

    const startCamera = async () => {
      try {
        const permission = await navigator.permissions.query({ name: "camera" as PermissionName })

        if (permission.state === "denied") {
          throw new Error("Camera permission denied")
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }

        const scanQRCode = async () => {
          if (videoRef.current && canvasRef.current && isScanning) {
            const video = videoRef.current
            const canvas = canvasRef.current
            const context = canvas.getContext("2d")

            if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
              canvas.width = video.videoWidth
              canvas.height = video.videoHeight
              context.drawImage(video, 0, 0, canvas.width, canvas.height)

              const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
              const code = jsQR(imageData.data, imageData.width, imageData.height)

              if (code) {
                onScan(code.data)
                setIsScanning(false)
              }
            }
          }

          if (isScanning) {
            animationId = requestAnimationFrame(scanQRCode)
          }
        }

        scanQRCode()
      } catch (err) {
        console.error("Camera access error:", err)
        setError("Camera access denied. Please allow camera permission and try again, or use manual input.")
        setUseManualInput(true)
      }
    }

    if (isScanning && !useManualInput) {
      startCamera()
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [isScanning, useManualInput])

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim())
      setManualInput("")
    }
  }

  const toggleScanning = () => {
    setIsScanning(!isScanning)
    setError("")
  }

  const toggleInputMethod = () => {
    setUseManualInput(!useManualInput)
    setIsScanning(false)
    setError("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>QR Code Scanner</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={toggleInputMethod}>
              {useManualInput ? <Camera className="h-4 w-4" /> : <Type className="h-4 w-4" />}
            </Button>
            {!useManualInput && (
              <Button variant="outline" size="sm" onClick={toggleScanning}>
                {isScanning ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {useManualInput ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Enter QR Code Data</label>
              <Input
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Paste or type QR code data"
                className="font-mono"
              />
            </div>
            <Button onClick={handleManualSubmit} className="w-full" disabled={!manualInput.trim()}>
              Submit Code
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: "4/3" }}>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                style={{ display: isScanning ? "block" : "none" }}
              />
              <canvas ref={canvasRef} className="hidden" />
              {!isScanning && (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="text-center">
                    <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm opacity-75">Camera is off</p>
                  </div>
                </div>
              )}
              {isScanning && (
                <div className="absolute inset-0 border-2 border-primary rounded-lg">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white rounded-lg"></div>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {isScanning ? "Point camera at QR code to scan" : "Click camera button to start scanning"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
