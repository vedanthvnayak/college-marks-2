"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, Users, Trash2, AlertTriangle } from "lucide-react"
import StudentList from "./student-list"
import { deleteAllStudentsByCollege, deleteAllEvaluationsByCollege } from "@/lib/actions/student"

interface College {
  id: string
  name: string
  code: string
}

interface StudentManagementProps {
  colleges: College[]
}

export default function StudentManagement({ colleges }: StudentManagementProps) {
  const [selectedCollege, setSelectedCollege] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteMessage, setDeleteMessage] = useState("")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [collegeToDelete, setCollegeToDelete] = useState<College | null>(null)
  const [isDeletingEvaluations, setIsDeletingEvaluations] = useState(false)
  const [showDeleteEvaluationsConfirm, setShowDeleteEvaluationsConfirm] = useState(false)
  const [collegeToDeleteEvaluations, setCollegeToDeleteEvaluations] = useState<College | null>(null)

  const handleDeleteAllStudents = async (college: College) => {
    setCollegeToDelete(college)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = async () => {
    if (!collegeToDelete) return

    setIsDeleting(true)
    setDeleteMessage("")
    
    try {
      const result = await deleteAllStudentsByCollege(collegeToDelete.id)
      if (result.success) {
        setDeleteMessage(result.message || `Successfully deleted all students from ${collegeToDelete.name}`)
        // Refresh the page to show updated data
        setTimeout(() => {
          window.location.reload()
        }, 2000) // Give user time to see the success message
      } else {
        setDeleteMessage(`Error: ${result.error}`)
      }
    } catch (error) {
      setDeleteMessage("An unexpected error occurred")
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
      setCollegeToDelete(null)
    }
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setCollegeToDelete(null)
    setDeleteMessage("")
  }

  const handleDeleteAllEvaluations = async (college: College) => {
    setCollegeToDeleteEvaluations(college)
    setShowDeleteEvaluationsConfirm(true)
  }

  const confirmDeleteEvaluations = async () => {
    if (!collegeToDeleteEvaluations) return

    setIsDeletingEvaluations(true)
    setDeleteMessage("")
    
    try {
      const result = await deleteAllEvaluationsByCollege(collegeToDeleteEvaluations.id)
      if (result.success) {
        setDeleteMessage(result.message || `Successfully deleted all evaluations from ${collegeToDeleteEvaluations.name}`)
        // Refresh the page to show updated data
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setDeleteMessage(`Error: ${result.error}`)
      }
    } catch (error) {
      setDeleteMessage("An unexpected error occurred")
    } finally {
      setIsDeletingEvaluations(false)
      setShowDeleteEvaluationsConfirm(false)
      setCollegeToDeleteEvaluations(null)
    }
  }

  const cancelDeleteEvaluations = () => {
    setShowDeleteEvaluationsConfirm(false)
    setCollegeToDeleteEvaluations(null)
    setDeleteMessage("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Student Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students by name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="sm:w-64">
            <Select value={selectedCollege} onValueChange={setSelectedCollege}>
              <SelectTrigger>
                <SelectValue placeholder="Select college" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Colleges</SelectItem>
                {colleges.map((college) => (
                  <SelectItem key={college.id} value={college.id}>
                    {college.name} ({college.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedCollege === "all" ? (
          <div className="space-y-6">
            {colleges.map((college) => (
              <div key={college.id}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-card-foreground">
                    {college.name} ({college.code})
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAllEvaluations(college)}
                      className="flex items-center gap-2 border-orange-500 text-orange-600 hover:bg-orange-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete All Evaluations
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteAllStudents(college)}
                      className="flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete All Students
                    </Button>
                  </div>
                </div>
                <StudentList collegeId={college.id} searchTerm={searchTerm} />
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-card-foreground">
                {colleges.find(c => c.id === selectedCollege)?.name} ({colleges.find(c => c.id === selectedCollege)?.code})
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteAllEvaluations(colleges.find(c => c.id === selectedCollege)!)}
                  className="flex items-center gap-2 border-orange-500 text-orange-600 hover:bg-orange-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete All Evaluations
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteAllStudents(colleges.find(c => c.id === selectedCollege)!)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete All Students
                </Button>
              </div>
            </div>
            <StudentList collegeId={selectedCollege} searchTerm={searchTerm} />
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && collegeToDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background border border-border rounded-lg p-6 max-w-md mx-4">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <h3 className="text-lg font-semibold">Confirm Deletion</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete <strong>ALL students</strong> from{" "}
                <strong>{collegeToDelete.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={cancelDelete} disabled={isDeleting}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={confirmDelete} 
                  disabled={isDeleting}
                  className="flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete All Students
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Message */}
        {deleteMessage && (
          <div className={`p-4 rounded-lg border ${
            deleteMessage.includes("Successfully") 
              ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400"
              : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400"
          }`}>
            {deleteMessage}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
