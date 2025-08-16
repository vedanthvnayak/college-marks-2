"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createCollege(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const name = formData.get("name")
  const code = formData.get("code")

  if (!name || !code) {
    return { error: "College name and code are required" }
  }

  const supabase = createServerClient()
  if (!supabase) {
    return { error: "Database connection failed" }
  }

  try {
    const { data, error } = await supabase
      .from("colleges")
      .insert([
        {
          name: name.toString().trim(),
          code: code.toString().trim().toUpperCase(),
        },
      ])
      .select()
      .single()

    if (error) {
      if (error.code === "23505") {
        return { error: "College code already exists" }
      }
      return { error: error.message }
    }

    revalidatePath("/admin/colleges")
    return { success: "College created successfully", college: data }
  } catch (error) {
    console.error("Create college error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function getColleges() {
  const supabase = createServerClient()
  if (!supabase) {
    return { data: [], error: "Database connection failed" }
  }

  try {
    const { data, error } = await supabase.from("colleges").select("*").order("created_at", { ascending: false })

    if (error) {
      return { data: [], error: error.message }
    }

    return { data: data || [], error: null }
  } catch (error) {
    console.error("Get colleges error:", error)
    return { data: [], error: "Failed to fetch colleges" }
  }
}

export async function deleteCollege(collegeId: string) {
  const supabase = createServerClient()
  if (!supabase) {
    return { error: "Database connection failed" }
  }

  try {
    const { error } = await supabase.from("colleges").delete().eq("id", collegeId)

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/admin/colleges")
    return { success: "College deleted successfully" }
  } catch (error) {
    console.error("Delete college error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
