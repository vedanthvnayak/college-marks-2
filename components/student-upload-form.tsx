"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, Download } from "lucide-react"
import { processStudentUpload } from "@/lib/actions/student"
import { useEffect } from "react"

interface College {
  id: string
  name: string
  code: string
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing Upload...
        </>
      ) : (
        <>
          <Upload className="mr-2 h-4 w-4" />
          Upload Students
        </>
      )}
    </Button>
  )
}

export default function StudentUploadForm({ colleges }: { colleges: College[] }) {
  const [state, formAction] = useActionState(processStudentUpload, null)
  const [selectedCollege, setSelectedCollege] = useState<string>("")
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    if (state?.success) {
      // Reset form
      setSelectedCollege("")
      const form = document.getElementById("upload-form") as HTMLFormElement
      form?.reset()
    }
  }, [state])

  const handleDownloadTemplate = async () => {
    if (!selectedCollege) {
      alert("Please select a college first")
      return
    }

    setIsDownloading(true)
    try {
      const response = await fetch("/api/download-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeId: selectedCollege }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `Student_Template.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert("Failed to download template")
      }
    } catch (error) {
      console.error("Download error:", error)
      alert("Failed to download template")
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Upload Student Data</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Template Download Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Step 1: Download Template</h3>
          <div className="flex gap-4">
            <Select value={selectedCollege} onValueChange={setSelectedCollege}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select college for template" />
              </SelectTrigger>
              <SelectContent>
                {colleges.map((college) => (
                  <SelectItem key={college.id} value={college.id}>
                    {college.name} ({college.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleDownloadTemplate} disabled={!selectedCollege || isDownloading} variant="outline">
              {isDownloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download Template
            </Button>
          </div>
        </div>

        {/* Upload Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Step 2: Upload Filled Data</h3>
          <form id="upload-form" action={formAction} className="space-y-4">
            {state?.error && (
              <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg text-sm">
                {state.error}
              </div>
            )}

            {state?.success && (
              <div className="bg-green-500/10 border border-green-500/50 text-green-700 px-4 py-3 rounded-lg text-sm">
                {state.success}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="college" className="block text-sm font-medium text-card-foreground">
                  Select College
                </label>
                <Select name="collegeId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose college" />
                  </SelectTrigger>
                  <SelectContent>
                    {colleges.map((college) => (
                      <SelectItem key={college.id} value={college.id}>
                        {college.name} ({college.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="file" className="block text-sm font-medium text-card-foreground">
                  Excel File
                </label>
                <Input
                  id="file"
                  name="file"
                  type="file"
                  accept=".xlsx,.xls"
                  required
                  className="bg-input border-border text-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  Upload Excel file with student data (Headers: No of students, Roll No., Name, Group No., Assigned Roll
                  Number)
                </p>
              </div>
            </div>

            <SubmitButton />
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
