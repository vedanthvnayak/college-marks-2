"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Save } from "lucide-react"
import { submitTeamMark } from "@/lib/actions/marks"
import { useEffect } from "react"

interface TeamMarkFormProps {
  collegeId: string
  collegeName: string
  collegeCode: string
  teams: string[]
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
          Submit Team Marks
        </>
      )}
    </Button>
  )
}

export default function TeamMarkForm({
  collegeId,
  collegeName,
  collegeCode,
  teams,
  judgeId,
  onSuccess,
}: TeamMarkFormProps) {
  const [state, formAction] = useActionState(submitTeamMark, null)
  const [selectedTeam, setSelectedTeam] = useState("")

  useEffect(() => {
    if (state?.success) {
      onSuccess()
      setSelectedTeam("")
    }
  }, [state, onSuccess])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Evaluation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* College Information */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">{collegeName}</h3>
            <Badge variant="secondary">{collegeCode}</Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Available Teams: {teams.length > 0 ? teams.join(", ") : "No teams found"}
          </div>
        </div>

        {teams.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No teams found for this college.</p>
            <p className="text-sm mt-2">Students must be uploaded first to create teams.</p>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="collegeId" value={collegeId} />
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
                <label htmlFor="groupNo" className="block text-sm font-medium text-card-foreground">
                  Select Team/Group
                </label>
                <Select name="groupNo" value={selectedTeam} onValueChange={setSelectedTeam} required>
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue placeholder="Choose team to evaluate" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team} value={team}>
                        Team {team}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="marks" className="block text-sm font-medium text-card-foreground">
                  Team Marks (0-100)
                </label>
                <Input
                  id="marks"
                  name="marks"
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  placeholder="Enter team marks"
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
                  placeholder="Add team evaluation comments..."
                  rows={3}
                  className="bg-input border-border text-foreground"
                />
              </div>
            </div>

            <SubmitButton />
          </form>
        )}
      </CardContent>
    </Card>
  )
}
