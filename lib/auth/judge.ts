import { createServerClient } from "@/lib/supabase/server"

export interface Judge {
  id: string
  name: string
  college_id: string
  access_code: string
  access_code_expires_at: string
  is_active: boolean
  colleges: {
    name: string
    code: string
  }
}

export async function verifyJudgeAccessCode(accessCode: string): Promise<Judge | null> {
  const supabase = createServerClient()
  if (!supabase) return null

  try {
    const { data: judge, error } = await supabase
      .from("judges")
      .select(`
        *,
        colleges (
          name,
          code
        )
      `)
      .eq("access_code", accessCode.toUpperCase())
      .eq("is_active", true)
      .single()

    if (error || !judge) {
      return null
    }

    // Check if access code is expired
    const expirationDate = new Date(judge.access_code_expires_at)
    const now = new Date()

    if (now > expirationDate) {
      return null
    }

    return judge
  } catch (error) {
    console.error("Judge verification error:", error)
    return null
  }
}

export async function createJudgeSession(judge: Judge) {
  const sessionData = {
    judgeId: judge.id,
    name: judge.name,
    collegeId: judge.college_id,
    collegeName: judge.colleges.name,
    collegeCode: judge.colleges.code,
    loginTime: new Date().toISOString(),
  }

  return btoa(JSON.stringify(sessionData))
}

export async function verifyJudgeSession(sessionToken: string): Promise<Judge | null> {
  try {
    const sessionData = JSON.parse(atob(sessionToken))
    const supabase = createServerClient()
    if (!supabase) return null

    const { data: judge, error } = await supabase
      .from("judges")
      .select(`
        *,
        colleges (
          name,
          code
        )
      `)
      .eq("id", sessionData.judgeId)
      .eq("is_active", true)
      .single()

    if (error || !judge) {
      return null
    }

    // Check if access code is still valid
    const expirationDate = new Date(judge.access_code_expires_at)
    const now = new Date()

    if (now > expirationDate) {
      return null
    }

    return judge
  } catch (error) {
    console.error("Judge session verification error:", error)
    return null
  }
}
