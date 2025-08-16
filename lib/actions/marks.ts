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

  if (!studentId || !judgeId || !marks) {
    return { error: "Student, judge, and marks are required" }
  }

  const marksValue = Number.parseFloat(marks.toString())
  if (isNaN(marksValue) || marksValue < 0 || marksValue > 100) {
    return { error: "Marks must be a number between 0 and 100" }
  }

  const supabase = createServerClient()
  if (!supabase) {
    return { error: "Database connection failed" }
  }

  try {
    const { data, error } = await supabase
      .from("individual_marks")
      .upsert(
        {
          student_id: studentId.toString(),
          judge_id: judgeId.toString(),
          marks: marksValue,
          comments: comments?.toString() || null,
        },
        { onConflict: "student_id,judge_id" },
      )
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/judge/scanner")
    revalidatePath("/judge/evaluations")
    return { success: "Individual marks submitted successfully", data }
  } catch (error) {
    console.error("Submit individual mark error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function submitTeamMark(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const collegeId = formData.get("collegeId")
  const groupNo = formData.get("groupNo")
  const judgeId = formData.get("judgeId")
  const marks = formData.get("marks")
  const comments = formData.get("comments")

  if (!collegeId || !groupNo || !judgeId || !marks) {
    return { error: "College, group, judge, and marks are required" }
  }

  const marksValue = Number.parseFloat(marks.toString())
  if (isNaN(marksValue) || marksValue < 0 || marksValue > 100) {
    return { error: "Marks must be a number between 0 and 100" }
  }

  const supabase = createServerClient()
  if (!supabase) {
    return { error: "Database connection failed" }
  }

  try {
    const { data, error } = await supabase
      .from("team_marks")
      .upsert(
        {
          college_id: collegeId.toString(),
          group_no: groupNo.toString(),
          judge_id: judgeId.toString(),
          marks: marksValue,
          comments: comments?.toString() || null,
        },
        { onConflict: "college_id,group_no,judge_id" },
      )
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/judge/teams")
    revalidatePath("/judge/evaluations")
    return { success: "Team marks submitted successfully", data }
  } catch (error) {
    console.error("Submit team mark error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function getStudentByQRCode(qrCodeData: string) {
  const supabase = createServerClient()
  if (!supabase) {
    return { data: null, error: "Database connection failed" }
  }

  try {
    const { data: student, error } = await supabase
      .from("students")
      .select(`
        *,
        colleges (
          name,
          code
        )
      `)
      .eq("qr_code_data", qrCodeData)
      .single()

    if (error || !student) {
      return { data: null, error: "Student not found" }
    }

    return { data: student, error: null }
  } catch (error) {
    console.error("Get student by QR code error:", error)
    return { data: null, error: "Failed to find student" }
  }
}

export async function getJudgeEvaluations(judgeId: string) {
  const supabase = createServerClient()
  if (!supabase) {
    return { individual: [], team: [], error: "Database connection failed" }
  }

  try {
    // Get individual marks
    const { data: individualMarks, error: individualError } = await supabase
      .from("individual_marks")
      .select(`
        *,
        students (
          roll_no,
          name,
          group_no,
          colleges (
            name,
            code
          )
        )
      `)
      .eq("judge_id", judgeId)
      .order("created_at", { ascending: false })

    // Get team marks
    const { data: teamMarks, error: teamError } = await supabase
      .from("team_marks")
      .select(`
        *,
        colleges (
          name,
          code
        )
      `)
      .eq("judge_id", judgeId)
      .order("created_at", { ascending: false })

    if (individualError || teamError) {
      return {
        individual: [],
        team: [],
        error: individualError?.message || teamError?.message,
      }
    }

    return {
      individual: individualMarks || [],
      team: teamMarks || [],
      error: null,
    }
  } catch (error) {
    console.error("Get judge evaluations error:", error)
    return { individual: [], team: [], error: "Failed to fetch evaluations" }
  }
}

export async function getTeamsByCollege(collegeId: string) {
  const supabase = createServerClient()
  if (!supabase) {
    return { data: [], error: "Database connection failed" }
  }

  try {
    const { data: teams, error } = await supabase
      .from("students")
      .select("group_no")
      .eq("college_id", collegeId)
      .order("group_no")

    if (error) {
      return { data: [], error: error.message }
    }

    // Get unique group numbers
    const uniqueGroups = [...new Set(teams.map((team) => team.group_no))].sort()

    return { data: uniqueGroups, error: null }
  } catch (error) {
    console.error("Get teams by college error:", error)
    return { data: [], error: "Failed to fetch teams" }
  }
}
