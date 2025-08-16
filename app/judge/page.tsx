import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyJudgeSession } from "@/lib/auth/judge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LogOut, Edit } from "lucide-react"
import { judgeSignOut } from "@/lib/actions/judge-auth"
import Link from "next/link"

export default async function JudgeDashboard() {
  const cookieStore = cookies()
  const sessionToken = cookieStore.get("judge-session")?.value

  if (!sessionToken) {
    redirect("/judge/login")
  }

  const judge = await verifyJudgeSession(sessionToken)
  if (!judge) {
    redirect("/judge/login")
  }

  const daysLeft = Math.ceil(
    (new Date(judge.access_code_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  )

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">Judge Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome, {judge.name} - {judge.colleges.name} ({judge.colleges.code})
              </p>
            </div>
            <form action={judgeSignOut}>
              <Button type="submit" variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
          <Link href="/judge/evaluate">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-8 pb-8 text-center">
                <Edit className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Enter Student Marks</h3>
                <p className="text-muted-foreground mb-4">Find students by assigned roll number and enter marks</p>
                <Button size="lg" className="w-full">
                  Start Evaluation
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="mt-8 max-w-md mx-auto">
          <Card className="bg-secondary/10 border-secondary/20">
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-sm text-muted-foreground">
                Access expires in {daysLeft} day{daysLeft !== 1 ? "s" : ""} • Code: {judge.access_code}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
