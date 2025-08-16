"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Users, Star } from "lucide-react"
import { useState } from "react"

interface MarksOverviewProps {
  individualMarks: any[]
  teamMarks: any[]
}

export function MarksOverview({ individualMarks, teamMarks }: MarksOverviewProps) {
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredIndividualMarks = individualMarks.filter((mark) => {
    const matchesSearch =
      mark.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mark.student?.roll_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mark.judge?.name?.toLowerCase().includes(searchTerm.toLowerCase())

    if (filter === "all") return matchesSearch
    if (filter === "individual") return matchesSearch
    return false
  })

  const filteredTeamMarks = teamMarks.filter((mark) => {
    const matchesSearch =
      mark.college?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mark.judge?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mark.group_no?.toString().includes(searchTerm)

    if (filter === "all") return matchesSearch
    if (filter === "team") return matchesSearch
    return false
  })

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by student name, roll no, or judge..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter marks" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Marks</SelectItem>
            <SelectItem value="individual">Individual Only</SelectItem>
            <SelectItem value="team">Team Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Individual Marks */}
      {(filter === "all" || filter === "individual") && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center">
            <User className="h-5 w-5 mr-2 text-primary" />
            Individual Marks ({filteredIndividualMarks.length})
          </h3>
          <div className="grid gap-4">
            {filteredIndividualMarks.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-center">No individual marks found</p>
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
                          <Badge variant="outline">{mark.student?.roll_no}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>
                            {mark.student?.college?.name} • Group {mark.student?.group_no}
                          </p>
                          <p>Evaluated by: {mark.judge?.name}</p>
                          <p>{new Date(mark.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-2xl font-bold">{mark.marks}</span>
                        <span className="text-muted-foreground">/100</span>
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
      )}

      {/* Team Marks */}
      {(filter === "all" || filter === "team") && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary" />
            Team Marks ({filteredTeamMarks.length})
          </h3>
          <div className="grid gap-4">
            {filteredTeamMarks.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-center">No team marks found</p>
                </CardContent>
              </Card>
            ) : (
              filteredTeamMarks.map((mark) => (
                <Card key={mark.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">Group {mark.group_no}</h4>
                          <Badge variant="secondary">{mark.college?.name}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>Evaluated by: {mark.judge?.name}</p>
                          <p>{new Date(mark.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-2xl font-bold">{mark.marks}</span>
                        <span className="text-muted-foreground">/100</span>
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
      )}
    </div>
  )
}
