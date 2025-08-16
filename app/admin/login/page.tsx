import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyAdminSession } from "@/lib/auth/admin"
import AdminLoginForm from "@/components/admin-login-form"

export default async function AdminLoginPage() {
  // Check if admin is already logged in
  const cookieStore = cookies()
  const sessionToken = cookieStore.get("admin-session")?.value

  if (sessionToken) {
    const admin = await verifyAdminSession(sessionToken)
    if (admin) {
      redirect("/admin")
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <AdminLoginForm />
    </div>
  )
}
