import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assignedRollNo = searchParams.get("assignedRollNo")

    if (!assignedRollNo) {
      return NextResponse.json({ success: false, error: "Assigned roll number is required" })
    }

    const supabase = createClient()

    const { data: student, error } = await supabase
      .from("students")
      .select("id, name, roll_no, assigned_roll_no, group_no")
      .eq("assigned_roll_no", assignedRollNo)
      .single()

    if (error || !student) {
      return NextResponse.json({ success: false, error: "Student not found" })
    }

    return NextResponse.json({ success: true, student })
  } catch (error) {
    console.error("Error finding student:", error)
    return NextResponse.json({ success: false, error: "Internal server error" })
  }
}
