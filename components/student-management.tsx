"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Users } from "lucide-react"
import StudentList from "./student-list"

interface College {
  id: string
  name: string
  code: string
}

interface StudentManagementProps {
  colleges: College[]
}

export default function StudentManagement({ colleges }: StudentManagementProps) {
  const [selectedCollege, setSelectedCollege] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Student Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students by name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="sm:w-64">
            <Select value={selectedCollege} onValueChange={setSelectedCollege}>
              <SelectTrigger>
                <SelectValue placeholder="Select college" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Colleges</SelectItem>
                {colleges.map((college) => (
                  <SelectItem key={college.id} value={college.id}>
                    {college.name} ({college.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedCollege === "all" ? (
          <div className="space-y-6">
            {colleges.map((college) => (
              <div key={college.id}>
                <h3 className="text-lg font-semibold mb-4 text-card-foreground">
                  {college.name} ({college.code})
                </h3>
                <StudentList collegeId={college.id} searchTerm={searchTerm} />
              </div>
            ))}
          </div>
        ) : (
          <StudentList collegeId={selectedCollege} searchTerm={searchTerm} />
        )}
      </CardContent>
    </Card>
  )
}
