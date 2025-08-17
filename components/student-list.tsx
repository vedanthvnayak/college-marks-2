"use client"

import { useEffect, useState } from "react"
import { getStudents, deleteStudent, deleteStudentEvaluations } from "@/lib/actions/student"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Loader2, FileX } from "lucide-react"

interface Student {
  id: string
  roll_no: string
  name: string
  group_no: string
  assigned_roll_no?: string
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

function DeleteEvaluationsButton({ studentId, studentName }: { studentId: string; studentName: string }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteStudentEvaluations(studentId)
      if (result.success) {
        // Refresh the student list
        window.location.reload()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      alert("An unexpected error occurred")
    } finally {
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className="border-orange-500 text-orange-600 hover:bg-orange-50"
      >
        <FileX className="h-4 w-4" />
      </Button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Evaluation Deletion</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete <strong>ALL evaluations</strong> for{" "}
              <strong>{studentName}</strong>? This will remove all marks and scores but keep the student. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDelete} 
                disabled={isDeleting}
                className="border-orange-500 text-orange-600 hover:bg-orange-50"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <FileX className="h-4 w-4" />
                    Delete Evaluations
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
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
          student.roll_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (student.assigned_roll_no && student.assigned_roll_no.toLowerCase().includes(searchTerm.toLowerCase())),
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
        <CardTitle className="text-xl font-semibold">
          Students ({filteredStudents.length})
          {searchTerm && <span className="text-sm font-normal text-muted-foreground ml-2">Search: "{searchTerm}"</span>}
        </CardTitle>
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
                  {student.assigned_roll_no && <span>Assigned: {student.assigned_roll_no}</span>}
                  <span>Group: {student.group_no}</span>
                  <span>College: {student.colleges.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DeleteEvaluationsButton studentId={student.id} studentName={student.name} />
                <DeleteButton studentId={student.id} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
