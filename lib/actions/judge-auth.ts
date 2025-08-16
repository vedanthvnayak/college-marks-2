"use server"

import { verifyJudgeAccessCode, createJudgeSession } from "@/lib/auth/judge"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function judgeSignIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const accessCode = formData.get("accessCode")

  if (!accessCode) {
    return { error: "Access code is required" }
  }

  try {
    const judge = await verifyJudgeAccessCode(accessCode.toString())

    if (!judge) {
      return { error: "Invalid or expired access code" }
    }

    const sessionToken = await createJudgeSession(judge)
    const cookieStore = cookies()

    cookieStore.set("judge-session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return { success: true }
  } catch (error) {
    console.error("Judge sign in error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function judgeSignOut() {
  const cookieStore = cookies()
  cookieStore.delete("judge-session")
  redirect("/judge/login")
}
