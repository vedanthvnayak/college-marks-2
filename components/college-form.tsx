"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus } from "lucide-react"
import { createCollege } from "@/lib/actions/college"
import { useEffect } from "react"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Adding College...
        </>
      ) : (
        <>
          <Plus className="mr-2 h-4 w-4" />
          Add College
        </>
      )}
    </Button>
  )
}

export default function CollegeForm() {
  const [state, formAction] = useActionState(createCollege, null)

  useEffect(() => {
    if (state?.success) {
      // Reset form by reloading the page
      window.location.reload()
    }
  }, [state])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Add New College</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
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
              <label htmlFor="name" className="block text-sm font-medium text-card-foreground">
                College Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter college name"
                required
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="code" className="block text-sm font-medium text-card-foreground">
                College Code
              </label>
              <Input
                id="code"
                name="code"
                type="text"
                placeholder="Enter college code (e.g., ABC123)"
                required
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  )
}
