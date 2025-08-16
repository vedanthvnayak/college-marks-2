import { type NextRequest, NextResponse } from "next/server"
import { generateQRCode } from "@/lib/actions/student"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const studentId = searchParams.get("studentId")

  if (!studentId) {
    return NextResponse.json({ error: "Student ID is required" }, { status: 400 })
  }

  try {
    const result = await generateQRCode(studentId)

    if (!result.success || !result.qrCode) {
      return NextResponse.json({ error: result.error || "Failed to generate QR code" }, { status: 500 })
    }

    // Return SVG file
    return new NextResponse(result.qrCode, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="${result.filename}"`,
      },
    })
  } catch (error) {
    console.error("Download QR error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
