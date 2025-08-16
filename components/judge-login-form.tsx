"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Gavel } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { judgeSignIn } from "@/lib/actions/judge-auth"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-medium rounded-lg h-[60px]"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        <>
          <Gavel className="mr-2 h-4 w-4" />
          Access Evaluation
        </>
      )}
    </Button>
  )
}

export default function JudgeLoginForm() {
  const router = useRouter()
  const [state, formAction] = useActionState(judgeSignIn, null)

  useEffect(() => {
    if (state?.success) {
      router.push("/judge")
    }
  }, [state, router])

  return (
    <div className="w-full max-w-md mx-auto px-4">
      <Card className="bg-card border-border shadow-lg">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
            <Gavel className="w-8 h-8 text-secondary-foreground" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold text-card-foreground">Judge Access</CardTitle>
            <CardDescription className="text-muted-foreground text-lg">College Evaluation System</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form action={formAction} className="space-y-6">
            {state?.error && (
              <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg text-sm">
                {state.error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="accessCode" className="block text-sm font-medium text-card-foreground">
                  Access Code
                </label>
                <Input
                  id="accessCode"
                  name="accessCode"
                  type="text"
                  placeholder="Enter your 8-character access code"
                  required
                  maxLength={8}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground h-12 text-base font-mono uppercase"
                  style={{ textTransform: "uppercase" }}
                />
              </div>
            </div>

            <SubmitButton />
          </form>

          <div className="text-center text-sm text-muted-foreground">
            <p>Enter the access code provided by your administrator</p>
            <p className="mt-1">Access codes are valid for 7 days</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
