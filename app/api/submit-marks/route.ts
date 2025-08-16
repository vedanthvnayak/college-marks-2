import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { judgeId, studentId, marks, comments } = await request.json()

    if (!judgeId || !studentId || marks === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    // Insert individual mark
    const { error } = await supabase.from("individual_marks").insert({
      judge_id: judgeId,
      student_id: studentId,
      marks: marks,
      comments: comments || null,
    })

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "You have already marked this student" }, { status: 400 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Submit marks error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
