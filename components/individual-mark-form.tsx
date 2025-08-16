"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Save } from "lucide-react"
import { submitIndividualMark } from "@/lib/actions/marks"
import { useEffect } from "react"

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

interface IndividualMarkFormProps {
  student: Student
  judgeId: string
  onSuccess: () => void
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Submitting...
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          Submit Marks
        </>
      )}
    </Button>
  )
}

export default function IndividualMarkForm({ student, judgeId, onSuccess }: IndividualMarkFormProps) {
  const [state, formAction] = useActionState(submitIndividualMark, null)

  useEffect(() => {
    if (state?.success) {
      onSuccess()
    }
  }, [state, onSuccess])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Evaluation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Student Information */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{student.name}</h3>
            <Badge variant="secondary">{student.colleges.code}</Badge>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <div>Roll No: {student.roll_no}</div>
            <div>Group: {student.group_no}</div>
            <div>College: {student.colleges.name}</div>
          </div>
        </div>

        {/* Mark Form */}
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="studentId" value={student.id} />
          <input type="hidden" name="judgeId" value={judgeId} />

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
              <label htmlFor="marks" className="block text-sm font-medium text-card-foreground">
                Marks (0-100)
              </label>
              <Input
                id="marks"
                name="marks"
                type="number"
                min="0"
                max="100"
                step="0.5"
                placeholder="Enter marks"
                required
                className="bg-input border-border text-foreground text-lg text-center font-semibold"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="comments" className="block text-sm font-medium text-card-foreground">
                Comments (Optional)
              </label>
              <Textarea
                id="comments"
                name="comments"
                placeholder="Add evaluation comments..."
                rows={3}
                className="bg-input border-border text-foreground"
              />
            </div>
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  )
}
