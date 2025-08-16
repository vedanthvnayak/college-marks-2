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

    const studentMarksMap = new Map()

    individualMarks.forEach((mark: any) => {
      const studentKey = mark.student_id
      if (!studentMarksMap.has(studentKey)) {
        studentMarksMap.set(studentKey, {
          name: mark.student?.name || "N/A",
          assignedRollNo: mark.student?.assigned_roll_no || "N/A",
          marks: [],
          total: 0,
        })
      }

      const studentData = studentMarksMap.get(studentKey)
      studentData.marks.push(mark.marks)
      studentData.total += mark.marks
    })

    const excelData = Array.from(studentMarksMap.values()).map((student: any) => ({
      "Student Name": student.name,
      "Assigned Roll Number": student.assignedRollNo,
      "All Marks": student.marks.join(", "),
      Total: student.total,
    }))

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData)

    worksheet["!cols"] = [
      { width: 25 }, // Student Name
      { width: 20 }, // Assigned Roll Number
      { width: 40 }, // All Marks
      { width: 15 }, // Total
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
