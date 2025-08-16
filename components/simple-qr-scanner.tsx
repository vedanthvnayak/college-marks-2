"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Camera, User } from "lucide-react"

interface Student {
  id: string
  name: string
  roll_no: string
  group_no: string
  college_name: string
}

interface SimpleQRScannerProps {
  judgeId: string
}

export default function SimpleQRScanner({ judgeId }: SimpleQRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [student, setStudent] = useState<Student | null>(null)
  const [manualCode, setManualCode] = useState("")
  const [marks, setMarks] = useState("")
  const [comments, setComments] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startScanning = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMessage("Camera not supported on this device. Please use manual entry.")
        return
      }

      console.log("[v0] Starting camera access...")
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      console.log("[v0] Camera stream obtained:", stream)

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setIsScanning(true)
        setMessage("")

        await videoRef.current.play()

        videoRef.current.onloadedmetadata = () => {
          console.log("[v0] Video metadata loaded, video should be visible")
        }
      }
    } catch (error) {
      console.error("[v0] Camera access error:", error)
      if (error.name === "NotAllowedError") {
        setMessage("Camera permission denied. Please allow camera access and try again, or use manual entry.")
      } else if (error.name === "NotFoundError") {
        setMessage("No camera found. Please use manual entry.")
      } else {
        setMessage("Camera access failed. Please use manual entry.")
      }
    }
  }

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  const handleManualEntry = async () => {
    if (!manualCode.trim()) return

    try {
      const response = await fetch(`/api/get-student-by-qr?code=${encodeURIComponent(manualCode)}`)
      const data = await response.json()

      if (data.success) {
        setStudent(data.student)
        setMessage("")
      } else {
        setMessage(data.error || "Student not found")
      }
    } catch (error) {
      setMessage("Error finding student")
    }
  }

  const submitMarks = async () => {
    if (!student || !marks.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/submit-marks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judgeId,
          studentId: student.id,
          marks: Number.parseFloat(marks),
          comments: comments.trim(),
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage("Marks submitted successfully!")
        setStudent(null)
        setMarks("")
        setComments("")
        setManualCode("")
      } else {
        setMessage(data.error || "Failed to submit marks")
      }
    } catch (error) {
      setMessage("Error submitting marks")
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  return (
    <div className="max-w-md mx-auto space-y-4">
      {!student ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Scan Student QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isScanning ? (
              <Button onClick={startScanning} className="w-full">
                <Camera className="h-4 w-4 mr-2" />
                Start Camera
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden border-2 border-gray-300">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "block",
                      backgroundColor: "black",
                    }}
                  />
                  {!videoRef.current?.srcObject && (
                    <div className="absolute inset-0 flex items-center justify-center text-white bg-black bg-opacity-75">
                      <p className="text-sm">Starting Camera...</p>
                    </div>
                  )}
                </div>
                <Button onClick={stopScanning} variant="outline" className="w-full bg-transparent">
                  Stop Camera
                </Button>
                <p className="text-xs text-gray-600 text-center">
                  Point camera at QR code to scan, or use manual entry below
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Or Enter QR Code Manually</Label>
              <div className="flex gap-2">
                <Input value={manualCode} onChange={(e) => setManualCode(e.target.value)} placeholder="Enter QR code" />
                <Button onClick={handleManualEntry}>Find</Button>
              </div>
            </div>

            {message && (
              <p className={`text-sm ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>{message}</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Enter Marks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg space-y-1">
              <p className="font-medium">{student.name}</p>
              <p className="text-sm text-gray-600">Roll No: {student.roll_no}</p>
              <p className="text-sm text-gray-600">Group: {student.group_no}</p>
              <p className="text-sm text-gray-600">College: {student.college_name}</p>
            </div>

            <div className="space-y-2">
              <Label>Marks (0-100)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                placeholder="Enter marks"
              />
            </div>

            <div className="space-y-2">
              <Label>Comments (Optional)</Label>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add comments..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={submitMarks} disabled={!marks.trim() || isSubmitting} className="flex-1">
                {isSubmitting ? "Submitting..." : "Submit Marks"}
              </Button>
              <Button
                onClick={() => {
                  setStudent(null)
                  setMarks("")
                  setComments("")
                  setMessage("")
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>

            {message && (
              <p className={`text-sm ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>{message}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
