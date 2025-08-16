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
          rollNo: mark.student?.roll_no || "N/A",
          assignedRollNo: mark.student?.assigned_roll_no || "N/A",
          collegeName: mark.student?.college?.name || "N/A",
          groupNo: mark.student?.group_no || "N/A",
          marks: [],
          comments: [],
          judges: [],
          dates: [],
          total: 0,
        })
      }

      const studentData = studentMarksMap.get(studentKey)
      studentData.marks.push(mark.marks)
      studentData.comments.push(mark.comments || "")
      studentData.judges.push(mark.judge?.name || "N/A")
      studentData.dates.push(new Date(mark.created_at).toLocaleDateString())
      studentData.total += Number(mark.marks) || 0
    })

    const excelData = Array.from(studentMarksMap.values()).map((student: any) => ({
      "Student Name": student.name,
      "Roll Number": student.rollNo,
      "Assigned Roll Number": student.assignedRollNo,
      "College": student.collegeName,
      "Group": student.groupNo,
      "All Marks": student.marks.join(", "),
      "All Comments": student.comments.join(" | "),
      "All Judges": student.judges.join(", "),
      "All Dates": student.dates.join(", "),
      "Total Marks": student.total.toFixed(2),
      "Transaction Count": student.marks.length,
    }))

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData)

    worksheet["!cols"] = [
      { width: 25 }, // Student Name
      { width: 15 }, // Roll Number
      { width: 20 }, // Assigned Roll Number
      { width: 25 }, // College
      { width: 10 }, // Group
      { width: 50 }, // All Marks
      { width: 60 }, // All Comments
      { width: 30 }, // All Judges
      { width: 40 }, // All Dates
      { width: 15 }, // Total Marks
      { width: 15 }, // Transaction Count
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
