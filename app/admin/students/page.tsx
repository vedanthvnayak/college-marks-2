import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyAdminSession } from "@/lib/auth/admin"
import { getColleges } from "@/lib/actions/college"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import StudentUploadForm from "@/components/student-upload-form"
import StudentManagement from "@/components/student-management" // Added import for StudentManagement

export default async function StudentsPage() {
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

  if (colleges.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-card-foreground">Student Management</h1>
                <p className="text-muted-foreground">Upload and manage student data</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏫</div>
            <h2 className="text-2xl font-bold text-card-foreground mb-2">No Colleges Found</h2>
            <p className="text-muted-foreground mb-6">You need to add colleges before uploading student data.</p>
            <Link href="/admin/colleges">
              <Button>Add Colleges First</Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">Student Management</h1>
              <p className="text-muted-foreground">Upload and manage student data</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div>
            <StudentUploadForm colleges={colleges} />
          </div>
          <div>
            <StudentManagement colleges={colleges} /> {/* Updated to include StudentManagement */}
          </div>
        </div>
      </main>
    </div>
  )
}
