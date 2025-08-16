"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, UserPlus } from "lucide-react"
import { createJudge } from "@/lib/actions/judge"
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
          Creating Judge...
        </>
      ) : (
        <>
          <UserPlus className="mr-2 h-4 w-4" />
          Create Judge
        </>
      )}
    </Button>
  )
}

export default function JudgeForm({ colleges }: { colleges: College[] }) {
  const [state, formAction] = useActionState(createJudge, null)

  useEffect(() => {
    if (state?.success) {
      // Reset form
      const form = document.getElementById("judge-form") as HTMLFormElement
      form?.reset()
    }
  }, [state])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Add New Judge</CardTitle>
      </CardHeader>
      <CardContent>
        <form id="judge-form" action={formAction} className="space-y-4">
          {state?.error && (
            <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg text-sm">
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-700 px-4 py-3 rounded-lg text-sm">
              {state.success}
              {state.judge && (
                <div className="mt-2 p-2 bg-green-500/5 rounded border">
                  <strong>Access Code: {state.judge.access_code}</strong>
                  <br />
                  <small>Valid until: {new Date(state.judge.access_code_expires_at).toLocaleDateString()}</small>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-card-foreground">
                Judge Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter judge name"
                required
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="collegeId" className="block text-sm font-medium text-card-foreground">
                Assign to College
              </label>
              <Select name="collegeId" required>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select college" />
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
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  )
}
