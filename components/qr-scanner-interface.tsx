"use client"

import { useState } from "react"
import QRScanner from "@/components/qr-scanner"
import IndividualMarkForm from "@/components/individual-mark-form"
import { getStudentByQRCode } from "@/lib/actions/marks"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

interface Student {
  id: string
  roll_no: string
  name: string
  group_no: string
  colleges: {
    name: string
    code: string
  }
}

export default function QRScannerInterface({ judgeId }: { judgeId: string }) {
  const [isScanning, setIsScanning] = useState(false)
  const [student, setStudent] = useState<Student | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleScan = async (qrData: string) => {
    setLoading(true)
    setError("")

    try {
      const result = await getStudentByQRCode(qrData)

      if (result.error || !result.data) {
        setError(result.error || "Student not found")
        return
      }

      setStudent(result.data)
      setIsScanning(false)
    } catch (err) {
      setError("Failed to process QR code")
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = () => {
    // Reset to scanner after successful submission
    setStudent(null)
    setError("")
  }

  const resetScanner = () => {
    setStudent(null)
    setError("")
    setIsScanning(false)
  }

  if (student) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Enter Student Marks</h2>
          <Button variant="outline" onClick={resetScanner}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Scan Another
          </Button>
        </div>
        <IndividualMarkForm student={student} judgeId={judgeId} onSuccess={handleSuccess} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <QRScanner onScan={handleScan} isScanning={isScanning} setIsScanning={setIsScanning} />

      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">Processing QR code...</div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">{error}</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
