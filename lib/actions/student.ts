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

    const headers = ["No of students", "Roll No.", "Name", "Group No.", "Assigned Roll Number"]

    // Create sample data with instructions
    const sampleData = [
      headers,
      ["1", "CS001", "John Doe", "A1", "ARN001"],
      ["2", "CS002", "Jane Smith", "A1", "ARN002"],
      ["3", "CS003", "Bob Johnson", "B2", "ARN003"],
      ["", "", "", "", ""],
      ["Instructions:", "", "", "", ""],
      ["1. Fill student data starting from row 2", "", "", "", ""],
      ["2. No of students: Sequential number", "", "", "", ""],
      ["3. Roll No.: Unique student roll number", "", "", "", ""],
      ["4. Name: Full student name", "", "", "", ""],
      ["5. Group No.: Team/group identifier", "", "", "", ""],
      ["6. Assigned Roll Number: Unique identifier for evaluation", "", "", "", ""],
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(sampleData)

    worksheet["!cols"] = [{ width: 15 }, { width: 15 }, { width: 25 }, { width: 15 }, { width: 20 }]

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
      if (!row[1] || !row[2] || !row[3] || !row[4]) continue // Skip empty rows

      const rollNo = row[1]?.toString().trim()
      const name = row[2]?.toString().trim()
      const groupNo = row[3]?.toString().trim()
      const assignedRollNo = row[4]?.toString().trim()

      if (rollNo && name && groupNo && assignedRollNo) {
        students.push({
          college_id: collegeId,
          roll_no: rollNo,
          name: name,
          group_no: groupNo,
          assigned_roll_no: assignedRollNo,
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
        return { error: "Some roll numbers or assigned roll numbers already exist for this college" }
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
          student.name.toLowerCase().includes(searchLower) ||
          student.roll_no.toLowerCase().includes(searchLower) ||
          student.assigned_roll_no?.toLowerCase().includes(searchLower),
      )
    }

    return { data: filteredData, error: null }
  } catch (error) {
    console.error("Get students error:", error)
    return { data: [], error: "Failed to fetch students" }
  }
}

export async function deleteAllStudentsByCollege(collegeId: string) {
  const supabase = createServerClient()
  if (!supabase) {
    return { error: "Database connection failed" }
  }

  try {
    console.log(`Starting deletion for college ID: ${collegeId}`)

    // Get all student IDs for this college first
    const { data: students, error: fetchError } = await supabase
      .from("students")
      .select("id")
      .eq("college_id", collegeId)

    if (fetchError) {
      console.error("Error fetching students:", fetchError)
      return { error: `Failed to fetch students: ${fetchError.message}` }
    }

    if (!students || students.length === 0) {
      console.log("No students found to delete")
      return { success: true, message: "No students found to delete" }
    }

    const studentIds = students.map(s => s.id)
    console.log(`Found ${students.length} students to delete:`, studentIds)

    // Check if there are any individual marks for these students
    const { data: marksCount, error: marksCountError } = await supabase
      .from("individual_marks")
      .select("id", { count: "exact" })
      .in("student_id", studentIds)

    if (marksCountError) {
      console.error("Error counting marks:", marksCountError)
    } else {
      console.log(`Found ${marksCount?.length || 0} individual marks to delete`)
    }

    // Delete all individual marks for these students
    const { error: marksError } = await supabase
      .from("individual_marks")
      .delete()
      .in("student_id", studentIds)

    if (marksError) {
      console.error("Error deleting marks:", marksError)
      return { error: `Failed to delete marks: ${marksError.message}` }
    }

    console.log("Successfully deleted individual marks")

    // Delete all team marks for this college (if any)
    const { error: teamMarksError } = await supabase
      .from("team_marks")
      .delete()
      .eq("college_id", collegeId)

    if (teamMarksError) {
      console.error("Error deleting team marks:", teamMarksError)
      return { error: `Failed to delete team marks: ${teamMarksError.message}` }
    }

    console.log("Successfully deleted team marks")

    // Finally delete all students from the college
    const { error: studentsError } = await supabase
      .from("students")
      .delete()
      .eq("college_id", collegeId)

    if (studentsError) {
      console.error("Error deleting students:", studentsError)
      return { error: `Failed to delete students: ${studentsError.message}` }
    }

    console.log("Successfully deleted students")

    revalidatePath("/admin/students")
    return { 
      success: true, 
      message: `Successfully deleted ${students.length} students and all related data from college` 
    }
  } catch (error) {
    console.error("Delete all students error:", error)
    return { error: "Failed to delete students" }
  }
}

export async function deleteStudentEvaluations(studentId: string) {
  const supabase = createServerClient()
  if (!supabase) {
    return { error: "Database connection failed" }
  }

  try {
    console.log(`Starting deletion of evaluations for student ID: ${studentId}`)

    // Delete all individual marks for this student
    const { error: marksError } = await supabase
      .from("individual_marks")
      .delete()
      .eq("student_id", studentId)

    if (marksError) {
      console.error("Error deleting student marks:", marksError)
      return { error: `Failed to delete student marks: ${marksError.message}` }
    }

    console.log("Successfully deleted student evaluations")
    revalidatePath("/admin/students")
    revalidatePath("/admin/evaluations")
    
    return { 
      success: true, 
      message: "Successfully deleted all evaluations for this student" 
    }
  } catch (error) {
    console.error("Delete student evaluations error:", error)
    return { error: "Failed to delete student evaluations" }
  }
}

export async function deleteAllEvaluationsByCollege(collegeId: string) {
  const supabase = createServerClient()
  if (!supabase) {
    return { error: "Database connection failed" }
  }

  try {
    console.log(`Starting deletion of all evaluations for college ID: ${collegeId}`)

    // Get all student IDs for this college
    const { data: students, error: fetchError } = await supabase
      .from("students")
      .select("id")
      .eq("college_id", collegeId)

    if (fetchError) {
      console.error("Error fetching students:", fetchError)
      return { error: `Failed to fetch students: ${fetchError.message}` }
    }

    if (!students || students.length === 0) {
      console.log("No students found for this college")
      return { success: true, message: "No students found for this college" }
    }

    const studentIds = students.map(s => s.id)
    console.log(`Found ${students.length} students for evaluation deletion`)

    // Delete all individual marks for these students
    const { error: marksError } = await supabase
      .from("individual_marks")
      .delete()
      .in("student_id", studentIds)

    if (marksError) {
      console.error("Error deleting marks:", marksError)
      return { error: `Failed to delete marks: ${marksError.message}` }
    }

    // Delete all team marks for this college
    const { error: teamMarksError } = await supabase
      .from("team_marks")
      .delete()
      .eq("college_id", collegeId)

    if (teamMarksError) {
      console.error("Error deleting team marks:", teamMarksError)
      return { error: "Failed to delete team marks: ${teamMarksError.message}" }
    }

    console.log("Successfully deleted all evaluations for college")
    revalidatePath("/admin/students")
    revalidatePath("/admin/evaluations")
    
    return { 
      success: true, 
      message: `Successfully deleted all evaluations for ${students.length} students in this college` 
    }
  } catch (error) {
    console.error("Delete all evaluations by college error:", error)
    return { error: "Failed to delete evaluations" }
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

export async function generateQRCode(studentId: string) {
  return { error: "QR code functionality has been removed. Please use assigned roll numbers instead." }
}

export async function generateMassQRCodes(collegeId: string) {
  return { error: "QR code functionality has been removed. Please use assigned roll numbers instead." }
}
