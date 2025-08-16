"use client"

import { useEffect, useState } from "react"
import { getStudents, deleteStudent } from "@/lib/actions/student"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, QrCode, Loader2 } from "lucide-react"

interface Student {
  id: string
  roll_no: string
  name: string
  group_no: string
  qr_code_data: string
  colleges: {
    name: string
    code: string
  }
  created_at: string
}

function DeleteButton({ studentId }: { studentId: string }) {
  return (
    <form action={deleteStudent}>
      <input type="hidden" name="studentId" value={studentId} />
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className="text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </form>
  )
}

function QRButton({ studentId }: { studentId: string }) {
  return (
    <a
      href={`/api/download-qr?studentId=${studentId}`}
      download
      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 text-primary hover:text-primary hover:bg-primary/10"
    >
      <QrCode className="h-4 w-4" />
    </a>
  )
}

function MassQRButton({ collegeId }: { collegeId: string }) {
  return (
    <a
      href={`/api/download-mass-qr?collegeId=${collegeId}`}
      download
      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2"
    >
      <QrCode className="h-4 w-4 mr-2" />
      Download All QR Codes
    </a>
  )
}

export default function StudentList({
  collegeId,
  searchTerm,
}: {
  collegeId?: string
  searchTerm?: string
}) {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStudents() {
      setLoading(true)
      setError(null)
      try {
        const { data, error } = await getStudents(collegeId, searchTerm)
        if (error) {
          setError(error)
        } else {
          setStudents(data)
        }
      } catch (err) {
        setError("Failed to load students")
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [collegeId, searchTerm])

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading students...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-destructive">Error loading students: {error}</div>
        </CardContent>
      </Card>
    )
  }

  const filteredStudents = searchTerm
    ? students.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.roll_no.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : students

  if (filteredStudents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Students {searchTerm && `(Search: "${searchTerm}")`}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <div className="text-4xl mb-4">👨‍🎓</div>
            <p className="text-lg mb-2">
              {searchTerm ? "No students found matching your search" : "No students uploaded yet"}
            </p>
            <p className="text-sm">
              {searchTerm ? "Try a different search term" : "Upload student data using the form above"}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            Students ({filteredStudents.length})
            {searchTerm && (
              <span className="text-sm font-normal text-muted-foreground ml-2">Search: "{searchTerm}"</span>
            )}
          </CardTitle>
          {collegeId && <MassQRButton collegeId={collegeId} />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredStudents.map((student: Student) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-card-foreground">{student.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {student.colleges.code}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Roll: {student.roll_no}</span>
                  <span>Group: {student.group_no}</span>
                  <span>College: {student.colleges.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <QRButton studentId={student.id} />
                <DeleteButton studentId={student.id} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
