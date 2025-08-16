"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Check } from "lucide-react"
import { toast } from "sonner"

interface ShareJudgeButtonProps {
  judgeName: string
  accessCode: string
  collegeCode: string
}

export default function ShareJudgeButton({ judgeName, accessCode, collegeCode }: ShareJudgeButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const judgeUrl = `${window.location.origin}/judge/login`
    const shareText = `🎓 Judge Access Details for ${judgeName}

📍 College: ${collegeCode}
🔑 Access Code: ${accessCode}
🌐 Login URL: ${judgeUrl}

Valid for 7 days from creation.`

    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      toast.success("Judge details copied to clipboard!")

      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy to clipboard")
    }
  }

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      size="sm"
      className="bg-accent/10 hover:bg-accent/20 border-accent/30 text-accent-foreground transition-all duration-200"
    >
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
    </Button>
  )
}
