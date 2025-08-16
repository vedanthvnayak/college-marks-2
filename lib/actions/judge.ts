"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createJudge(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const name = formData.get("name")
  const collegeId = formData.get("collegeId")

  if (!name || !collegeId) {
    return { error: "Judge name and college selection are required" }
  }

  const supabase = createServerClient()
  if (!supabase) {
    return { error: "Database connection failed" }
  }

  try {
    // Generate access code (8 character alphanumeric)
    const accessCode = Math.random().toString(36).substring(2, 10).toUpperCase()

    // Set expiration to 7 days from now
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + 7)

    const { data, error } = await supabase
      .from("judges")
      .insert([
        {
          name: name.toString().trim(),
          college_id: collegeId.toString(),
          access_code: accessCode,
          access_code_expires_at: expirationDate.toISOString(),
          is_active: true,
        },
      ])
      .select(`
        *,
        colleges (
          name,
          code
        )
      `)
      .single()

    if (error) {
      if (error.code === "23505") {
        return { error: "Access code already exists, please try again" }
      }
      return { error: error.message }
    }

    revalidatePath("/admin/judges")
    return { success: "Judge created successfully", judge: data }
  } catch (error) {
    console.error("Create judge error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function getJudges(collegeId?: string) {
  const supabase = createServerClient()
  if (!supabase) {
    return { data: [], error: "Database connection failed" }
  }

  try {
    let query = supabase
      .from("judges")
      .select(`
        *,
        colleges (
          name,
          code
        )
      `)
      .order("created_at", { ascending: false })

    if (collegeId) {
      query = query.eq("college_id", collegeId)
    }

    const { data, error } = await query

    if (error) {
      return { data: [], error: error.message }
    }

    return { data: data || [], error: null }
  } catch (error) {
    console.error("Get judges error:", error)
    return { data: [], error: "Failed to fetch judges" }
  }
}

export async function regenerateAccessCode(judgeId: string) {
  const supabase = createServerClient()
  if (!supabase) {
    return { error: "Database connection failed" }
  }

  try {
    // Generate new access code
    const accessCode = Math.random().toString(36).substring(2, 10).toUpperCase()

    // Set new expiration to 7 days from now
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + 7)

    const { data, error } = await supabase
      .from("judges")
      .update({
        access_code: accessCode,
        access_code_expires_at: expirationDate.toISOString(),
        is_active: true,
      })
      .eq("id", judgeId)
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/admin/judges")
    return { success: "Access code regenerated successfully", judge: data }
  } catch (error) {
    console.error("Regenerate access code error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function toggleJudgeStatus(judgeId: string, isActive: boolean) {
  const supabase = createServerClient()
  if (!supabase) {
    return { error: "Database connection failed" }
  }

  try {
    const { error } = await supabase.from("judges").update({ is_active: isActive }).eq("id", judgeId)

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/admin/judges")
    return { success: `Judge ${isActive ? "activated" : "deactivated"} successfully` }
  } catch (error) {
    console.error("Toggle judge status error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function deleteJudge(judgeId: string) {
  const supabase = createServerClient()
  if (!supabase) {
    return { error: "Database connection failed" }
  }

  try {
    const { error } = await supabase.from("judges").delete().eq("id", judgeId)

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/admin/judges")
    return { success: "Judge deleted successfully" }
  } catch (error) {
    console.error("Delete judge error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
