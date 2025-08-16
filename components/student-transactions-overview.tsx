"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState, useMemo } from "react"
import { User, Star, TrendingUp, Calendar, MessageSquare } from "lucide-react"

interface StudentTransactionsOverviewProps {
  individualMarks: any[]
}

export function StudentTransactionsOverview({ individualMarks }: StudentTransactionsOverviewProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Group marks by student
  const studentTransactions = useMemo(() => {
    const grouped = individualMarks.reduce((acc, mark) => {
      const studentId = mark.student_id
      if (!acc[studentId]) {
        acc[studentId] = {
          student: mark.student,
          transactions: [],
          total: 0,
        }
      }
      acc[studentId].transactions.push(mark)
      acc[studentId].total += Number(mark.marks) || 0
      return acc
    }, {})
    return Object.values(grouped)
  }, [individualMarks])

  const filteredStudents = studentTransactions.filter((studentData: any) => {
    const matchesSearch =
      studentData.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentData.student?.roll_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      studentData.student?.assigned_roll_no?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by student name, roll no, or assigned roll no..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Student Cards */}
      <div className="space-y-6">
        {filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">No students found</p>
            </CardContent>
          </Card>
        ) : (
          filteredStudents.map((studentData: any) => (
            <Card key={studentData.student.id} className="border-2">
              <CardHeader className="bg-muted/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      <h3 className="text-xl font-bold">{studentData.student?.name}</h3>
                      <Badge variant="outline">Roll: {studentData.student?.roll_no}</Badge>
                      {studentData.student?.assigned_roll_no && (
                        <Badge variant="secondary">Assigned: {studentData.student?.assigned_roll_no}</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>
                        {studentData.student?.college?.name} • Group {studentData.student?.group_no}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {studentData.total.toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Points ({studentData.transactions.length} transactions)
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg flex items-center">
                    <Star className="h-4 w-4 mr-2 text-yellow-500" />
                    Transaction History
                  </h4>
                  
                  {studentData.transactions.map((transaction: any, index: number) => (
                    <div
                      key={transaction.id}
                      className={`p-4 rounded-lg border ${
                        index % 2 === 0 ? 'bg-muted/30' : 'bg-background'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              Transaction #{index + 1}
                            </Badge>
                            <Badge 
                              variant={Number(transaction.marks) >= 0 ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {Number(transaction.marks) >= 0 ? '+' : ''}{transaction.marks} points
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3" />
                              <span>Judge: {transaction.judge?.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(transaction.created_at).toLocaleDateString()} at{" "}
                                {new Date(transaction.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                            {transaction.comments && (
                              <div className="flex items-start gap-2">
                                <MessageSquare className="h-3 w-3 mt-0.5" />
                                <span className="italic">"{transaction.comments}"</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
} 