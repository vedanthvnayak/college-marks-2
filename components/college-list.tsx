import { getColleges, deleteCollege } from "@/lib/actions/college"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Calendar, Hash } from "lucide-react"

interface College {
  id: string
  name: string
  code: string
  created_at: string
}

async function DeleteButton({ collegeId }: { collegeId: string }) {
  async function handleDelete() {
    "use server"
    await deleteCollege(collegeId)
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

export default async function CollegeList() {
  const { data: colleges, error } = await getColleges()

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-destructive">Error loading colleges: {error}</div>
        </CardContent>
      </Card>
    )
  }

  if (colleges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Colleges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <div className="text-4xl mb-4">🏫</div>
            <p className="text-lg mb-2">No colleges added yet</p>
            <p className="text-sm">Add your first college using the form above</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Colleges ({colleges.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {colleges.map((college: College) => (
            <div
              key={college.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-card-foreground text-lg">{college.name}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    <span className="font-mono">{college.code}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(college.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <DeleteButton collegeId={college.id} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
