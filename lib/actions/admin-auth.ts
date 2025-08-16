"use server"

import { verifyAdminCredentials, createAdminSession } from "@/lib/auth/admin"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function adminSignIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const username = formData.get("username")
  const password = formData.get("password")

  if (!username || !password) {
    return { error: "Username and password are required" }
  }

  try {
    const admin = await verifyAdminCredentials(username.toString(), password.toString())

    if (!admin) {
      return { error: "Invalid username or password" }
    }

    const sessionToken = await createAdminSession(admin)
    const cookieStore = cookies()

    cookieStore.set("admin-session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return { success: true }
  } catch (error) {
    console.error("Admin sign in error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function adminSignOut() {
  const cookieStore = cookies()
  cookieStore.delete("admin-session")
  redirect("/admin/login")
}
