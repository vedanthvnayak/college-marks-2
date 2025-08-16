import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyAdminSession } from "@/lib/auth/admin"
import { getColleges } from "@/lib/actions/college"
import { getStudents } from "@/lib/actions/student"
import { getJudges } from "@/lib/actions/judge"
import { getMarksStats } from "@/lib/actions/admin-marks"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, Users, FileSpreadsheet, QrCode, BarChart3 } from "lucide-react"
import { adminSignOut } from "@/lib/actions/admin-auth"
import Link from "next/link"

export default async function AdminDashboard() {
  const cookieStore = cookies()
  const sessionToken = cookieStore.get("admin-session")?.value

  if (!sessionToken) {
    redirect("/admin/login")
  }

  const admin = await verifyAdminSession(sessionToken)
  if (!admin) {
    redirect("/admin/login")
  }

  const { data: colleges } = await getColleges()
  const { data: students } = await getStudents()
  const { data: judges } = await getJudges()
  const { data: marksStats } = await getMarksStats()

  const collegeCount = colleges.length
  const studentCount = students.length
  const judgeCount = judges.length
  const evaluationCount = marksStats?.totalEvaluations || 0

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {admin.username}</p>
            </div>
            <form action={adminSignOut}>
              <Button type="submit" variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Colleges</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{collegeCount}</div>
              <p className="text-xs text-muted-foreground">
                {collegeCount === 0
                  ? "No colleges added yet"
                  : `${collegeCount} college${collegeCount > 1 ? "s" : ""} registered`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{studentCount}</div>
              <p className="text-xs text-muted-foreground">
                {studentCount === 0
                  ? "No students uploaded yet"
                  : `${studentCount} student${studentCount > 1 ? "s" : ""} registered`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Judges</CardTitle>
              <QrCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{judgeCount}</div>
              <p className="text-xs text-muted-foreground">
                {judgeCount === 0
                  ? "No judges assigned yet"
                  : `${judgeCount} judge${judgeCount > 1 ? "s" : ""} assigned`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Evaluations</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{evaluationCount}</div>
              <p className="text-xs text-muted-foreground">
                {evaluationCount === 0
                  ? "No evaluations completed"
                  : `${evaluationCount} evaluation${evaluationCount > 1 ? "s" : ""} completed`}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/colleges">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  Manage Colleges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Add and manage college information</p>
                <Button className="w-full">{collegeCount === 0 ? "Add First College" : "Manage Colleges"}</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/students">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileSpreadsheet className="h-5 w-5 mr-2 text-primary" />
                  Student Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Upload and manage student information</p>
                <Button className="w-full">{studentCount === 0 ? "Upload First Students" : "Manage Students"}</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/judges">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <QrCode className="h-5 w-5 mr-2 text-primary" />
                  Judge Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Assign judges and manage access codes</p>
                <Button className="w-full">{judgeCount === 0 ? "Add First Judge" : "Manage Judges"}</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/evaluations">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                  Evaluations Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">View all individual and team marks</p>
                <Button className="w-full">{evaluationCount === 0 ? "View Evaluations" : "View All Marks"}</Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}
