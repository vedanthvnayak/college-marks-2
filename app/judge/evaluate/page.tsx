"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

interface Student {
  id: string
  name: string
  roll_no: string
  assigned_roll_no: string
  group_no: string
}

export default function EvaluatePage() {
  const [assignedRollNo, setAssignedRollNo] = useState("")
  const [student, setStudent] = useState<Student | null>(null)
  const [marks, setMarks] = useState("")
  const [comments, setComments] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  const findStudent = async () => {
    if (!assignedRollNo.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/find-student?assignedRollNo=${assignedRollNo}`)
      const data = await response.json()

      if (data.student) {
        setStudent(data.student)
        setMessage("")
      } else {
        setStudent(null)
        setMessage("Student not found with this assigned roll number")
      }
    } catch (error) {
      setMessage("Error finding student")
    } finally {
      setLoading(false)
    }
  }

  const submitMarks = async () => {
    if (!student || marks === "") return

    setSubmitting(true)
    try {
      const response = await fetch("/api/submit-marks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          marks: Number.parseFloat(marks),
          comments,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage("Marks submitted successfully!")
        setMarks("")
        setComments("")
        setStudent(null)
        setAssignedRollNo("")
      } else {
        setMessage("Error submitting marks")
      }
    } catch (error) {
      setMessage("Error submitting marks")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/judge">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Enter Student Marks</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Find Student</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assignedRollNo">Assigned Roll Number</Label>
              <div className="flex gap-2">
                <Input
                  id="assignedRollNo"
                  value={assignedRollNo}
                  onChange={(e) => setAssignedRollNo(e.target.value)}
                  placeholder="Enter assigned roll number"
                />
                <Button onClick={findStudent} disabled={loading}>
                  {loading ? "Finding..." : "Find"}
                </Button>
              </div>
            </div>

            {message && (
              <div
                className={`text-sm p-2 rounded ${
                  message.includes("successfully") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {message}
              </div>
            )}
          </CardContent>
        </Card>

        {student && (
          <Card>
            <CardHeader>
              <CardTitle>Student Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p className="font-medium">{student.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Roll No.</Label>
                  <p className="font-medium">{student.roll_no}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Group</Label>
                  <p className="font-medium">{student.group_no}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Assigned Roll</Label>
                  <p className="font-medium">{student.assigned_roll_no}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="marks">Marks (can be negative)</Label>
                <Input
                  id="marks"
                  type="number"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  placeholder="Enter marks"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="comments">Comments (optional)</Label>
                <Textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Enter comments"
                  rows={3}
                />
              </div>

              <Button onClick={submitMarks} disabled={submitting || marks === ""} className="w-full">
                {submitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Submit Marks
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
