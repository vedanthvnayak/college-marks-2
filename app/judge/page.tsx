import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyJudgeSession } from "@/lib/auth/judge"
import { getJudgeEvaluations } from "@/lib/actions/marks"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, QrCode, Users } from "lucide-react"
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

  const { individual, team } = await getJudgeEvaluations(judge.id)
  const individualCount = individual.length
  const teamCount = team.length

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
        <div className="mb-6">
          <Card className="bg-secondary/10 border-secondary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-card-foreground">Access Status</h3>
                  <p className="text-sm text-muted-foreground">
                    Your access expires in {daysLeft} day{daysLeft !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Access Code</div>
                  <div className="font-mono text-lg font-bold">{judge.access_code}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/judge/scanner">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <QrCode className="h-5 w-5 mr-2 text-primary" />
                  Individual Evaluation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Scan student QR codes to enter individual marks</p>
                <Button className="w-full">
                  {individualCount === 0 ? "Start Evaluating" : `${individualCount} Students Evaluated`}
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/judge/teams">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  Team Evaluation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Enter marks for team/group performances</p>
                <Button className="w-full">
                  {teamCount === 0 ? "Evaluate Teams" : `${teamCount} Teams Evaluated`}
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {(individualCount > 0 || teamCount > 0) && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Evaluation Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{individualCount}</div>
                    <div className="text-sm text-muted-foreground">Individual Evaluations</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{teamCount}</div>
                    <div className="text-sm text-muted-foreground">Team Evaluations</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
