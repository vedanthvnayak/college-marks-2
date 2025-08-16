import { type NextRequest, NextResponse } from "next/server"
import { getAllMarks } from "@/lib/actions/admin-marks"
import * as XLSX from "xlsx"

export async function GET(request: NextRequest) {
  try {
    const { data: marksData, error } = await getAllMarks()

    if (error || !marksData) {
      return NextResponse.json({ error: "Failed to fetch evaluations" }, { status: 500 })
    }

    const { individualMarks } = marksData

    // Create Excel workbook
    const workbook = XLSX.utils.book_new()

    // Prepare data for Excel
    const excelData = individualMarks.map((mark: any) => ({
      "Student Name": mark.student?.name || "N/A",
      "Roll Number": mark.student?.roll_no || "N/A",
      "Assigned Roll Number": mark.student?.assigned_roll_no || "N/A",
      "Group Number": mark.student?.group_no || "N/A",
      College: mark.student?.college?.name || "N/A",
      "Judge Name": mark.judge?.name || "N/A",
      Marks: mark.marks,
      Comments: mark.comments || "",
      "Evaluated At": new Date(mark.created_at).toLocaleString(),
    }))

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData)

    // Set column widths
    worksheet["!cols"] = [
      { width: 20 }, // Student Name
      { width: 15 }, // Roll Number
      { width: 20 }, // Assigned Roll Number
      { width: 15 }, // Group Number
      { width: 25 }, // College
      { width: 15 }, // College Code
      { width: 20 }, // Judge Name
      { width: 10 }, // Marks
      { width: 30 }, // Comments
      { width: 20 }, // Evaluated At
    ]

    XLSX.utils.book_append_sheet(workbook, worksheet, "Student Evaluations")

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    const filename = `Student_Evaluations_${new Date().toISOString().split("T")[0]}.xlsx`

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Export evaluations error:", error)
    return NextResponse.json({ error: "Failed to export evaluations" }, { status: 500 })
  }
}
