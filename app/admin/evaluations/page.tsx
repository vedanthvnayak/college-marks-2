import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyAdminSession } from "@/lib/auth/admin"
import { getAllMarks } from "@/lib/actions/admin-marks"
import { getColleges } from "@/lib/actions/college"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, BarChart3, User, Download } from "lucide-react"
import Link from "next/link"
import { StudentTransactionsTable } from "@/components/student-transactions-table"

export default async function EvaluationsPage() {
  const cookieStore = cookies()
  const sessionToken = cookieStore.get("admin-session")?.value

  if (!sessionToken) {
    redirect("/admin/login")
  }

  const admin = await verifyAdminSession(sessionToken)
  if (!admin) {
    redirect("/admin/login")
  }

  const { data: marksData, error } = await getAllMarks()
  const { data: colleges } = await getColleges()

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-destructive">Error loading evaluations: {error}</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const { individualMarks } = marksData || { individualMarks: [] }
  const totalEvaluations = individualMarks.length

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <h1 className="text-2xl font-bold text-card-foreground">Evaluations Overview</h1>
                <p className="text-muted-foreground">View and export all student marks</p>
              </div>
              <div className="flex items-center gap-2">
                <Select onValueChange={(value) => {
                  if (value && value !== 'select') {
                    const url = value === 'all' 
                      ? '/api/export-evaluations' 
                      : `/api/export-evaluations?college=${encodeURIComponent(value)}`
                    window.open(url, '_blank')
                  }
                }}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select College to Download" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="select" disabled>Select College</SelectItem>
                    {colleges.map((college: any) => (
                      <SelectItem key={college.id} value={college.name}>
                        {college.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  onClick={() => window.open('/api/export-evaluations', '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Student Transactions Table
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StudentTransactionsTable individualMarks={individualMarks} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
