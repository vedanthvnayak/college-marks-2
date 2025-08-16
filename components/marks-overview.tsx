"use client"

import { Badge } from "@/components/ui/badge"

import { CardContent } from "@/components/ui/card"

import { Card } from "@/components/ui/card"

import { Input } from "@/components/ui/input"

import { useState } from "react"

import { User, Star } from "lucide-react"

interface MarksOverviewProps {
  individualMarks: any[]
}

export function MarksOverview({ individualMarks }: MarksOverviewProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredIndividualMarks = individualMarks.filter((mark) => {
    const matchesSearch =
      mark.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mark.student?.roll_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mark.student?.assigned_roll_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mark.judge?.name?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by student name, roll no, assigned roll no, or judge..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* Individual Marks */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center">
          <User className="h-5 w-5 mr-2 text-primary" />
          All Mark Transactions ({filteredIndividualMarks.length})
        </h3>
        <div className="grid gap-4">
          {filteredIndividualMarks.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">No marks found</p>
              </CardContent>
            </Card>
          ) : (
            filteredIndividualMarks.map((mark) => (
              <Card key={mark.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{mark.student?.name}</h4>
                        <Badge variant="outline">Roll: {mark.student?.roll_no}</Badge>
                        {mark.student?.assigned_roll_no && (
                          <Badge variant="secondary">Assigned: {mark.student?.assigned_roll_no}</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>
                          {mark.student?.college?.name} • Group {mark.student?.group_no}
                        </p>
                        <p>Evaluated by: {mark.judge?.name}</p>
                        <p>
                          {new Date(mark.created_at).toLocaleDateString()} at{" "}
                          {new Date(mark.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-2xl font-bold">{mark.marks}</span>
                      <span className="text-muted-foreground">points</span>
                    </div>
                  </div>
                  {mark.comments && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm">{mark.comments}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
