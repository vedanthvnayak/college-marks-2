import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { verifyJudgeSession } from "@/lib/auth/judge"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import SimpleQRScanner from "@/components/simple-qr-scanner"

export default async function QRScannerPage() {
  const cookieStore = cookies()
  const sessionToken = cookieStore.get("judge-session")?.value

  if (!sessionToken) {
    redirect("/judge/login")
  }

  const judge = await verifyJudgeSession(sessionToken)
  if (!judge) {
    redirect("/judge/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link href="/judge">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">QR Scanner</h1>
              <p className="text-muted-foreground">Scan student QR codes to enter marks</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SimpleQRScanner judgeId={judge.id} />
      </main>
    </div>
  )
}
