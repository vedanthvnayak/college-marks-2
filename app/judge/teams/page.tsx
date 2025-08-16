import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyJudgeSession } from "@/lib/auth/judge"
import { getTeamsByCollege } from "@/lib/actions/marks"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import TeamMarkForm from "@/components/team-mark-form"
import { Card, CardContent } from "@/components/ui/card"

export default async function TeamsPage() {
  const cookieStore = cookies()
  const sessionToken = cookieStore.get("judge-session")?.value

  if (!sessionToken) {
    redirect("/judge/login")
  }

  const judge = await verifyJudgeSession(sessionToken)
  if (!judge) {
    redirect("/judge/login")
  }

  const teamsResult = await getTeamsByCollege(judge.college_id)

  if (teamsResult.error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold text-red-600 mb-2">Error Loading Teams</h2>
            <p className="text-muted-foreground mb-4">{teamsResult.error}</p>
            <Link href="/judge">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link href="/judge">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">Team Evaluation</h1>
              <p className="text-muted-foreground">Enter marks for team performances</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TeamMarkForm
          collegeId={judge.college_id}
          collegeName={judge.colleges.name}
          collegeCode={judge.colleges.code}
          teams={teamsResult.data}
          judgeId={judge.id}
        />
      </main>
    </div>
  )
}
