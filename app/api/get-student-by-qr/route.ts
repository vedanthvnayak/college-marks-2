import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.json({ error: "QR code is required" }, { status: 400 })
  }

  const supabase = createServerClient()
  if (!supabase) {
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
  }

  try {
    const { data: student, error } = await supabase
      .from("students")
      .select(`
        id,
        name,
        roll_no,
        group_no,
        colleges (
          name
        )
      `)
      .eq("qr_code_data", code)
      .single()

    if (error || !student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      student: {
        id: student.id,
        name: student.name,
        roll_no: student.roll_no,
        group_no: student.group_no,
        college_name: student.colleges?.name || "Unknown College",
      },
    })
  } catch (error) {
    console.error("Get student by QR error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
