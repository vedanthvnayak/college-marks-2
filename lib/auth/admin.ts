import { createServerClient } from "@/lib/supabase/server"
import bcrypt from "bcryptjs"

export interface Admin {
  id: string
  username: string
  created_at: string
}

export async function verifyAdminCredentials(username: string, password: string): Promise<Admin | null> {
  const supabase = createServerClient()
  if (!supabase) {
    return null
  }

  try {
    const { data: admin, error } = await supabase
      .from("admins")
      .select("id, username, password_hash, created_at")
      .eq("username", username)
      .single()

    if (error || !admin) {
      return null
    }

    const isValidPassword = await bcrypt.compare(password, admin.password_hash)

    if (!isValidPassword) {
      return null
    }

    return {
      id: admin.id,
      username: admin.username,
      created_at: admin.created_at,
    }
  } catch (error) {
    console.error("Admin verification error:", error)
    return null
  }
}

export async function createAdminSession(admin: Admin) {
  const sessionData = {
    adminId: admin.id,
    username: admin.username,
    loginTime: new Date().toISOString(),
  }

  return btoa(JSON.stringify(sessionData))
}

export async function verifyAdminSession(sessionToken: string): Promise<Admin | null> {
  try {
    const sessionData = JSON.parse(atob(sessionToken))
    const supabase = createServerClient()
    if (!supabase) return null

    const { data: admin, error } = await supabase
      .from("admins")
      .select("id, username, created_at")
      .eq("id", sessionData.adminId)
      .single()

    if (error || !admin) {
      return null
    }

    return admin
  } catch (error) {
    console.error("Session verification error:", error)
    return null
  }
}
