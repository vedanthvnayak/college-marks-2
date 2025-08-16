import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { verifyJudgeSession } from "@/lib/auth/judge"

export async function POST(request: NextRequest) {
  try {
    const { studentId, marks, comments } = await request.json()

    if (!studentId || marks === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("judge-session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const judge = await verifyJudgeSession(sessionToken)
    if (!judge) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const supabase = createServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    // Try to insert new marks first, fallback to upsert if constraint exists
    let { error } = await supabase.from("individual_marks").insert({
      judge_id: judge.id,
      student_id: studentId,
      marks: marks,
      comments: comments || null,
    })

    // If insert fails due to unique constraint, fallback to upsert
    if (error && error.code === '23505') {
      console.log("Unique constraint exists, falling back to upsert")
      const { error: upsertError } = await supabase.from("individual_marks").upsert(
        {
          judge_id: judge.id,
          student_id: studentId,
          marks: marks,
          comments: comments || null,
        },
        {
          onConflict: "judge_id,student_id",
        }
      )
      error = upsertError
    }

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Submit marks error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
