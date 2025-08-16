import { type NextRequest, NextResponse } from "next/server"
import { generateMassQRCodes } from "@/lib/actions/student"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const collegeId = searchParams.get("collegeId")

  if (!collegeId) {
    return NextResponse.json({ error: "College ID is required" }, { status: 400 })
  }

  try {
    const result = await generateMassQRCodes(collegeId)

    if (!result.success || !result.qrCodes) {
      return NextResponse.json({ error: result.error || "Failed to generate QR codes" }, { status: 500 })
    }

    // Generate HTML for PDF-like layout with 8 QR codes per sheet
    const qrCodes = result.qrCodes
    const sheets = []

    for (let i = 0; i < qrCodes.length; i += 8) {
      const sheetQRs = qrCodes.slice(i, i + 8)
      sheets.push(sheetQRs)
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${result.collegeCode} QR Codes</title>
          <style>
            @page { size: A4; margin: 20mm; }
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
            .sheet { page-break-after: always; }
            .sheet:last-child { page-break-after: avoid; }
            .header { text-align: center; margin-bottom: 20px; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
            .qr-item { 
              border: 1px solid #ddd; 
              padding: 15px; 
              text-align: center; 
              border-radius: 8px;
              break-inside: avoid;
            }
            .qr-code { margin-bottom: 10px; }
            .student-info { font-size: 12px; line-height: 1.4; }
            .student-name { font-weight: bold; margin-bottom: 5px; }
            .student-details { color: #666; }
          </style>
        </head>
        <body>
          ${sheets
            .map(
              (sheet, sheetIndex) => `
            <div class="sheet">
              <div class="header">
                <h2>${result.collegeName} (${result.collegeCode})</h2>
                <p>Student QR Codes - Sheet ${sheetIndex + 1}</p>
              </div>
              <div class="grid">
                ${sheet
                  .map(
                    (student) => `
                  <div class="qr-item">
                    <div class="qr-code">
                      <img src="${student.qrCode}" alt="QR Code for ${student.name}" style="width: 120px; height: 120px;" />
                    </div>
                    <div class="student-info">
                      <div class="student-name">${student.name}</div>
                      <div class="student-details">
                        Roll: ${student.rollNo}<br>
                        Group: ${student.groupNo}<br>
                        ${student.collegeName}
                      </div>
                    </div>
                  </div>
                `,
                  )
                  .join("")}
              </div>
            </div>
          `,
            )
            .join("")}
        </body>
      </html>
    `

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="${result.collegeCode}_All_QR_Codes.html"`,
      },
    })
  } catch (error) {
    console.error("Download mass QR error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
