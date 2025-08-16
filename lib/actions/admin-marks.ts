"use server"

import { createClient } from "@/lib/supabase/server"

export async function getAllMarks() {
  try {
    const supabase = createClient()

    // Get individual marks with student, judge, and college details
    const { data: individualMarks, error: individualError } = await supabase
      .from("individual_marks")
      .select(`
        *,
        student:students(
          roll_no,
          name,
          group_no,
          assigned_roll_no,
          college:colleges(name, code)
        ),
        judge:judges(name)
      `)
      .order("created_at", { ascending: false })

    if (individualError) {
      console.error("Error fetching individual marks:", individualError)
      return { data: null, error: individualError.message }
    }

    // Get team marks with judge and college details
    const { data: teamMarks, error: teamError } = await supabase
      .from("team_marks")
      .select(`
        *,
        college:colleges(name, code),
        judge:judges(name)
      `)
      .order("created_at", { ascending: false })

    if (teamError) {
      console.error("Error fetching team marks:", teamError)
      return { data: null, error: teamError.message }
    }

    return {
      data: {
        individualMarks: individualMarks || [],
        teamMarks: teamMarks || [],
      },
      error: null,
    }
  } catch (error) {
    console.error("Error in getAllMarks:", error)
    return { data: null, error: "Failed to fetch marks data" }
  }
}

export async function getMarksStats() {
  try {
    const supabase = createClient()

    // Get individual marks count
    const { count: individualCount, error: individualError } = await supabase
      .from("individual_marks")
      .select("*", { count: "exact", head: true })

    if (individualError) {
      console.error("Error counting individual marks:", individualError)
      return { data: null, error: individualError.message }
    }

    // Get team marks count
    const { count: teamCount, error: teamError } = await supabase
      .from("team_marks")
      .select("*", { count: "exact", head: true })

    if (teamError) {
      console.error("Error counting team marks:", teamError)
      return { data: null, error: teamError.message }
    }

    // Get unique students evaluated
    const { data: studentsEvaluated, error: studentsError } = await supabase
      .from("individual_marks")
      .select("student_id")
      .distinct()

    if (studentsError) {
      console.error("Error counting evaluated students:", studentsError)
      return { data: null, error: studentsError.message }
    }

    return {
      data: {
        totalEvaluations: (individualCount || 0) + (teamCount || 0),
        individualMarks: individualCount || 0,
        teamMarks: teamCount || 0,
        studentsEvaluated: studentsEvaluated?.length || 0,
      },
      error: null,
    }
  } catch (error) {
    console.error("Error in getMarksStats:", error)
    return { data: null, error: "Failed to fetch marks statistics" }
  }
}
