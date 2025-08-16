import { generateExcelTemplate } from "@/lib/actions/student"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { collegeId } = await request.json()

    if (!collegeId) {
      return NextResponse.json({ error: "College ID is required" }, { status: 400 })
    }

    const result = await generateExcelTemplate(collegeId)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const buffer = Buffer.from(result.buffer!)

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${result.filename}"`,
      },
    })
  } catch (error) {
    console.error("Download template error:", error)
    return NextResponse.json({ error: "Failed to generate template" }, { status: 500 })
  }
}
