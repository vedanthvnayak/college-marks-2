"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function submitIndividualMark(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const studentId = formData.get("studentId")
  const judgeId = formData.get("judgeId")
  const marks = formData.get("marks")
  const comments = formData.get("comments")

  if (!studentId || !judgeId || marks === null || marks === "") {
    return { error: "Student, judge, and marks are required" }
  }

  const marksValue = Number.parseFloat(marks.toString())
  if (isNaN(marksValue)) {
    return { error: "Marks must be a valid number" }
  }

  const supabase = createServerClient()
  if (!supabase) {
    return { error: "Database connection failed" }
  }

  try {
    // Always insert new marks instead of upserting
    const { data, error } = await supabase
      .from("individual_marks")
      .insert({
        student_id: studentId.toString(),
        judge_id: judgeId.toString(),
        marks: marksValue,
        comments: comments?.toString() || null,
      })
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/judge/evaluate")
    return { success: "Individual marks submitted successfully", data }
  } catch (error) {
    console.error("Submit individual mark error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function getJudgeEvaluations(judgeId: string) {
  const supabase = createServerClient()
  if (!supabase) {
    return { individual: [], error: "Database connection failed" }
  }

  try {
    // Get individual marks only
    const { data: individualMarks, error: individualError } = await supabase
      .from("individual_marks")
      .select(`
        *,
        students (
          roll_no,
          name,
          assigned_roll_no,
          group_no,
          colleges (
            name,
            code
          )
        )
      `)
      .eq("judge_id", judgeId)
      .order("created_at", { ascending: false })

    if (individualError) {
      return {
        individual: [],
        error: individualError.message,
      }
    }

    return {
      individual: individualMarks || [],
      error: null,
    }
  } catch (error) {
    console.error("Get judge evaluations error:", error)
    return { individual: [], error: "Failed to fetch evaluations" }
  }
}

export async function getStudentByQRCode(qrCode: string) {
  return { error: "QR code functionality has been removed. Please use assigned roll numbers instead." }
}

export async function submitTeamMark(prevState: any, formData: FormData) {
  return { error: "Team evaluation functionality has been removed." }
}

export async function getTeamsByCollege(collegeId: string) {
  return { data: [], error: "Team evaluation functionality has been removed." }
}
