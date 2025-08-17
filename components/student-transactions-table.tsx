"use client"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useState, useMemo } from "react"
import { User, Star, TrendingUp, Calendar, MessageSquare, Search } from "lucide-react"

interface StudentTransactionsTableProps {
  individualMarks: any[]
}

export function StudentTransactionsTable({ individualMarks }: StudentTransactionsTableProps) {
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
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name, roll no, or assigned roll no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Student Details
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  College & Group
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                  Total Points
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                  Transactions
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                  Transaction Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No students found
                  </td>
                </tr>
              ) : (
                filteredStudents.map((studentData: any) => (
                  <tr key={studentData.student.id} className="hover:bg-muted/30">
                    <td className="px-4 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{studentData.student?.name}</span>
                        </div>
                        <div className="space-y-1">
                          <Badge variant="outline" className="text-xs">
                            Roll: {studentData.student?.roll_no}
                          </Badge>
                          {studentData.student?.assigned_roll_no && (
                            <Badge variant="secondary" className="text-xs ml-1">
                              Assigned: {studentData.student?.assigned_roll_no}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        <p className="font-medium">{studentData.student?.college?.name}</p>
                        <p className="text-muted-foreground">Group {studentData.student?.group_no}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <div>
                          <div className="text-xl font-bold text-green-600">
                            {studentData.total.toFixed(1)}
                          </div>
                          <div className="text-xs text-muted-foreground">points</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Badge variant="outline" className="text-sm">
                        {studentData.transactions.length}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-2 max-w-md">
                        {studentData.transactions.map((transaction: any, index: number) => (
                          <div
                            key={transaction.id}
                            className={`p-3 rounded-lg border-l-4 ${
                              Number(transaction.marks) >= 0 
                                ? 'border-l-green-500 bg-green-50 dark:bg-green-950/20' 
                                : 'border-l-red-500 bg-red-50 dark:bg-red-950/20'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline" className="text-xs">
                                #{index + 1}
                              </Badge>
                              <Badge 
                                variant={Number(transaction.marks) >= 0 ? "default" : "destructive"}
                                className="text-xs"
                              >
                                {Number(transaction.marks) >= 0 ? '+' : ''}{transaction.marks} pts
                              </Badge>
                            </div>
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span className="font-medium">{transaction.judge?.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {new Date(transaction.created_at).toLocaleDateString()} at{" "}
                                  {new Date(transaction.created_at).toLocaleTimeString()}
                                </span>
                              </div>
                              {transaction.comments && (
                                <div className="flex items-start gap-1">
                                  <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                  <span className="italic text-xs">"{transaction.comments}"</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 