import { getJudges, regenerateAccessCode, toggleJudgeStatus, deleteJudge } from "@/lib/actions/judge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, RefreshCw, Power, PowerOff, Clock, User, GraduationCap } from "lucide-react"
import ShareJudgeButton from "./share-judge-button"

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
        className="text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent border-destructive/30 transition-all duration-200"
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
        className="text-primary hover:text-primary hover:bg-primary/10 bg-transparent border-primary/30 transition-all duration-200"
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
        className={`transition-all duration-200 ${
          isActive
            ? "text-orange-600 hover:bg-orange-50 border-orange-200"
            : "text-green-600 hover:bg-green-50 border-green-200"
        }`}
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
      <Card className="shadow-sm border-border/50">
        <CardContent className="pt-6">
          <div className="text-center text-destructive">Error loading judges: {error}</div>
        </CardContent>
      </Card>
    )
  }

  if (judges.length === 0) {
    return (
      <Card className="shadow-sm border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-card-foreground flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Judges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-card-foreground mb-2">No judges assigned yet</h3>
            <p className="text-sm">Create judges using the form above to get started</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-card-foreground flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          Judges ({judges.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {judges.map((judge: Judge) => {
            const isExpired = new Date(judge.access_code_expires_at) < new Date()
            const daysLeft = Math.ceil(
              (new Date(judge.access_code_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
            )

            return (
              <div
                key={judge.id}
                className="group p-4 border border-border/50 rounded-xl bg-card hover:shadow-md transition-all duration-200 hover:border-primary/20"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-card-foreground truncate">{judge.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={judge.is_active ? "default" : "secondary"} className="text-xs">
                            {judge.is_active ? "Active" : "Inactive"}
                          </Badge>
                          {isExpired && (
                            <Badge variant="destructive" className="text-xs">
                              Expired
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">
                          {judge.colleges.name} ({judge.colleges.code})
                        </span>
                      </div>
                      <div className="bg-muted/50 px-3 py-2 rounded-lg">
                        <div className="text-xs text-muted-foreground mb-1">Access Code</div>
                        <div className="font-mono text-sm text-card-foreground">{judge.access_code}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        {isExpired ? (
                          <span className="text-destructive font-medium">Expired</span>
                        ) : (
                          <span>
                            {daysLeft} day{daysLeft !== 1 ? "s" : ""} remaining
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <ShareJudgeButton
                      judgeName={judge.name}
                      accessCode={judge.access_code}
                      collegeCode={judge.colleges.code}
                    />
                    <RegenerateButton judgeId={judge.id} />
                    <ToggleStatusButton judgeId={judge.id} isActive={judge.is_active} />
                    <DeleteButton judgeId={judge.id} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
