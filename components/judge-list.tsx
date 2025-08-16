import { getJudges, regenerateAccessCode, toggleJudgeStatus, deleteJudge } from "@/lib/actions/judge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, RefreshCw, Power, PowerOff, Clock, User } from "lucide-react"

interface Judge {
  id: string
  name: string
  access_code: string
  access_code_expires_at: string
  is_active: boolean
  colleges: {
    name: string
    code: string
  }
  created_at: string
}

async function DeleteButton({ judgeId }: { judgeId: string }) {
  async function handleDelete() {
    "use server"
    await deleteJudge(judgeId)
  }

  return (
    <form action={handleDelete}>
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className="text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </form>
  )
}

async function RegenerateButton({ judgeId }: { judgeId: string }) {
  async function handleRegenerate() {
    "use server"
    await regenerateAccessCode(judgeId)
  }

  return (
    <form action={handleRegenerate}>
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className="text-primary hover:text-primary hover:bg-primary/10 bg-transparent"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    </form>
  )
}

async function ToggleStatusButton({ judgeId, isActive }: { judgeId: string; isActive: boolean }) {
  async function handleToggle() {
    "use server"
    await toggleJudgeStatus(judgeId, !isActive)
  }

  return (
    <form action={handleToggle}>
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className={isActive ? "text-orange-600 hover:bg-orange-50" : "text-green-600 hover:bg-green-50"}
      >
        {isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
      </Button>
    </form>
  )
}

export default async function JudgeList({ collegeId }: { collegeId?: string }) {
  const { data: judges, error } = await getJudges(collegeId)

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-destructive">Error loading judges: {error}</div>
        </CardContent>
      </Card>
    )
  }

  if (judges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Judges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <div className="text-4xl mb-4">👨‍⚖️</div>
            <p className="text-lg mb-2">No judges assigned yet</p>
            <p className="text-sm">Create judges using the form above</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Judges ({judges.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {judges.map((judge: Judge) => {
            const isExpired = new Date(judge.access_code_expires_at) < new Date()
            const daysLeft = Math.ceil(
              (new Date(judge.access_code_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
            )

            return (
              <div
                key={judge.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-card-foreground flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {judge.name}
                    </h3>
                    <Badge variant={judge.is_active ? "default" : "secondary"}>
                      {judge.is_active ? "Active" : "Inactive"}
                    </Badge>
                    {isExpired && <Badge variant="destructive">Expired</Badge>}
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>
                      College: {judge.colleges.name} ({judge.colleges.code})
                    </div>
                    <div className="font-mono bg-muted px-2 py-1 rounded text-xs inline-block">
                      Access Code: {judge.access_code}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {isExpired ? (
                        <span className="text-destructive">Expired</span>
                      ) : (
                        <span>
                          {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <RegenerateButton judgeId={judge.id} />
                  <ToggleStatusButton judgeId={judge.id} isActive={judge.is_active} />
                  <DeleteButton judgeId={judge.id} />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
