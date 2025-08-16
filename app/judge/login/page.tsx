import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyJudgeSession } from "@/lib/auth/judge"
import JudgeLoginForm from "@/components/judge-login-form"

export default async function JudgeLoginPage() {
  // Check if judge is already logged in
  const cookieStore = cookies()
  const sessionToken = cookieStore.get("judge-session")?.value

  if (sessionToken) {
    const judge = await verifyJudgeSession(sessionToken)
    if (judge) {
      redirect("/judge")
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <JudgeLoginForm />
    </div>
  )
}
