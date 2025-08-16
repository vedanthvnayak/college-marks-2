import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyJudgeSession } from "@/lib/auth/judge"
import { getJudgeEvaluations } from "@/lib/actions/marks"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Users } from "lucide-react"
import Link from "next/link"

export default async function EvaluationsPage() {
  const cookieStore = cookies()
  const sessionToken = cookieStore.get("judge-session")?.value

  if (!sessionToken) {
    redirect("/judge/login")
  }

  const judge = await verifyJudgeSession(sessionToken)
  if (!judge) {
    redirect("/judge/login")
  }

  const { individual, team, error } = await getJudgeEvaluations(judge.id)

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
              <h1 className="text-2xl font-bold text-card-foreground">My Evaluations</h1>
              <p className="text-muted-foreground">View your completed evaluations and marks</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center text-destructive">Error loading evaluations: {error}</div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Individual Evaluations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Individual Evaluations ({individual.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {individual.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>No individual evaluations completed yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {individual.map((mark: any) => (
                    <div key={mark.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{mark.students.name}</h3>
                        <Badge variant="secondary" className="text-lg font-bold">
                          {mark.marks}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>
                          Roll: {mark.students.roll_no} | Group: {mark.students.group_no}
                        </div>
                        <div>College: {mark.students.colleges.name}</div>
                        {mark.comments && <div className="italic">"{mark.comments}"</div>}
                        <div>Evaluated: {new Date(mark.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Team Evaluations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Team Evaluations ({team.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {team.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>No team evaluations completed yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {team.map((mark: any) => (
                    <div key={mark.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Team {mark.group_no}</h3>
                        <Badge variant="secondary" className="text-lg font-bold">
                          {mark.marks}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>
                          College: {mark.colleges.name} ({mark.colleges.code})
                        </div>
                        {mark.comments && <div className="italic">"{mark.comments}"</div>}
                        <div>Evaluated: {new Date(mark.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
