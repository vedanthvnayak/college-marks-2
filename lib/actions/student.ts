"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import * as XLSX from "xlsx"

export async function generateExcelTemplate(collegeId: string) {
  const supabase = createServerClient()
  if (!supabase) {
    return { error: "Database connection failed" }
  }

  try {
    // Get college information
    const { data: college, error: collegeError } = await supabase
      .from("colleges")
      .select("name, code")
      .eq("id", collegeId)
      .single()

    if (collegeError || !college) {
      return { error: "College not found" }
    }

    // Create Excel workbook with template
    const workbook = XLSX.utils.book_new()

    // Create headers as specified
    const headers = ["No of students", "Roll No.", "Name", "Group No."]

    // Create sample data with instructions
    const sampleData = [
      headers,
      ["1", "CS001", "John Doe", "A1"],
      ["2", "CS002", "Jane Smith", "A1"],
      ["3", "CS003", "Bob Johnson", "B2"],
      ["", "", "", ""],
      ["Instructions:", "", "", ""],
      ["1. Fill student data starting from row 2", "", "", ""],
      ["2. No of students: Sequential number", "", "", ""],
      ["3. Roll No.: Unique student roll number", "", "", ""],
      ["4. Name: Full student name", "", "", ""],
      ["5. Group No.: Team/group identifier", "", "", ""],
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(sampleData)

    // Set column widths
    worksheet["!cols"] = [{ width: 15 }, { width: 15 }, { width: 25 }, { width: 15 }]

    XLSX.utils.book_append_sheet(workbook, worksheet, `${college.code}_Students`)

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

    return {
      success: true,
      buffer: Array.from(buffer),
      filename: `${college.code}_Student_Template.xlsx`,
    }
  } catch (error) {
    console.error("Generate template error:", error)
    return { error: "Failed to generate template" }
  }
}

export async function processStudentUpload(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const file = formData.get("file") as File
  const collegeId = formData.get("collegeId") as string

  if (!file || !collegeId) {
    return { error: "File and college selection are required" }
  }

  const supabase = createServerClient()
  if (!supabase) {
    return { error: "Database connection failed" }
  }

  try {
    // Read Excel file
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: "buffer" })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[]

    if (data.length < 2) {
      return { error: "Excel file must contain at least one student record" }
    }

    // Skip header row and process students
    const students = []
    for (let i = 1; i < data.length; i++) {
      const row = data[i]
      if (!row[1] || !row[2] || !row[3]) continue // Skip empty rows

      const rollNo = row[1]?.toString().trim()
      const name = row[2]?.toString().trim()
      const groupNo = row[3]?.toString().trim()

      if (rollNo && name && groupNo) {
        // Generate QR code data (unique identifier)
        const qrCodeData = `${collegeId}-${rollNo}-${Date.now()}`

        students.push({
          college_id: collegeId,
          roll_no: rollNo,
          name: name,
          group_no: groupNo,
          qr_code_data: qrCodeData,
        })
      }
    }

    if (students.length === 0) {
      return { error: "No valid student records found in the file" }
    }

    // Insert students into database
    const { data: insertedStudents, error } = await supabase.from("students").insert(students).select()

    if (error) {
      if (error.code === "23505") {
        return { error: "Some roll numbers already exist for this college" }
      }
      return { error: error.message }
    }

    revalidatePath("/admin/students")
    return {
      success: `Successfully uploaded ${insertedStudents.length} students`,
      students: insertedStudents,
    }
  } catch (error) {
    console.error("Process upload error:", error)
    return { error: "Failed to process Excel file. Please check the format." }
  }
}

export async function getStudents(collegeId?: string, searchTerm?: string) {
  const supabase = createServerClient()
  if (!supabase) {
    return { data: [], error: "Database connection failed" }
  }

  try {
    let query = supabase
      .from("students")
      .select(`
        *,
        colleges (
          name,
          code
        )
      `)
      .order("created_at", { ascending: false })

    if (collegeId) {
      query = query.eq("college_id", collegeId)
    }

    const { data, error } = await query

    if (error) {
      return { data: [], error: error.message }
    }

    // Apply search filtering on the server side if searchTerm is provided
    let filteredData = data || []
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filteredData = filteredData.filter(
        (student) =>
          student.name.toLowerCase().includes(searchLower) || student.roll_no.toLowerCase().includes(searchLower),
      )
    }

    return { data: filteredData, error: null }
  } catch (error) {
    console.error("Get students error:", error)
    return { data: [], error: "Failed to fetch students" }
  }
}

export async function generateQRCode(studentId: string) {
  const supabase = createServerClient()
  if (!supabase) {
    return { error: "Database connection failed" }
  }

  try {
    const { data: student, error } = await supabase
      .from("students")
      .select(`
        *,
        colleges (
          name,
          code
        )
      `)
      .eq("id", studentId)
      .single()

    if (error || !student) {
      return { error: "Student not found" }
    }

    // Generate QR code as SVG
    const QRCode = require("qrcode")
    const qrCodeSVG = await QRCode.toString(student.qr_code_data, {
      type: "svg",
      width: 200,
      margin: 2,
    })

    return {
      success: true,
      qrCode: qrCodeSVG,
      student: student,
      filename: `${student.colleges.code}_${student.roll_no}_${student.name.replace(/\s+/g, "_")}_QR.svg`,
    }
  } catch (error) {
    console.error("Generate QR code error:", error)
    return { error: "Failed to generate QR code" }
  }
}

export async function deleteStudent(studentId: string) {
  const supabase = createServerClient()
  if (!supabase) {
    return { error: "Database connection failed" }
  }

  try {
    const { error } = await supabase.from("students").delete().eq("id", studentId)

    if (error) {
      return { error: error.message }
    }

    revalidatePath("/admin/students")
    return { success: "Student deleted successfully" }
  } catch (error) {
    console.error("Delete student error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function generateMassQRCodes(collegeId: string) {
  const supabase = createServerClient()
  if (!supabase) {
    return { error: "Database connection failed" }
  }

  try {
    const { data: students, error } = await supabase
      .from("students")
      .select(`
        *,
        colleges (
          name,
          code
        )
      `)
      .eq("college_id", collegeId)
      .order("roll_no", { ascending: true })

    if (error || !students || students.length === 0) {
      return { error: "No students found for this college" }
    }

    const QRCode = require("qrcode")
    const qrCodes = []

    // Generate QR codes for all students
    for (const student of students) {
      const qrCodeDataURL = await QRCode.toDataURL(student.qr_code_data, {
        width: 150,
        margin: 2,
      })

      qrCodes.push({
        id: student.id,
        name: student.name,
        rollNo: student.roll_no,
        groupNo: student.group_no,
        collegeName: student.colleges.name,
        collegeCode: student.colleges.code,
        qrCode: qrCodeDataURL,
      })
    }

    return {
      success: true,
      qrCodes,
      collegeName: students[0].colleges.name,
      collegeCode: students[0].colleges.code,
    }
  } catch (error) {
    console.error("Generate mass QR codes error:", error)
    return { error: "Failed to generate QR codes" }
  }
}
