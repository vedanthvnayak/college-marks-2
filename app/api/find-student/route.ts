import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assignedRollNo = searchParams.get("assignedRollNo")

    if (!assignedRollNo) {
      return NextResponse.json({ error: "Assigned roll number is required" }, { status: 400 })
    }

    const supabase = createClient()

    const { data: student, error } = await supabase
      .from("students")
      .select(`
        id,
        name,
        roll_no,
        assigned_roll_no,
        group_no,
        college:colleges(name)
      `)
      .eq("assigned_roll_no", assignedRollNo)
      .single()

    if (error || !student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json({ student })
  } catch (error) {
    console.error("Error finding student:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
