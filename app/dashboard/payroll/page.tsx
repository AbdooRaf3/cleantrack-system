"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Download, Search, FileText, DollarSign, Users, Calendar, TrendingUp } from "lucide-react"

interface MonthlyReport {
  id: string
  worker_id: string
  month: number
  year: number
  regular_days: number
  friday_days: number
  holiday_days: number
  overtime_hours: number
  total_salary: number
  worker: {
    full_name: string
    employee_id: string
    daily_wage: number
    overtime_rate: number
    supervisor: {
      full_name: string
    }
  }
}

export default function PayrollDashboard() {
  const [user, setUser] = useState<any>(null)
  const [reports, setReports] = useState<MonthlyReport[]>([])
  const [filteredReports, setFilteredReports] = useState<MonthlyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    filterReports()
  }, [reports, selectedMonth, selectedYear, searchTerm])

  const checkAuth = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      const { data: userData, error: userError } = await supabase.from("users").select("*").eq("id", user.id).single()

      if (userError || userData.role !== "payroll_manager") {
        router.push("/login")
        return
      }

      setUser(userData)
      await loadReports()
    } catch (error) {
      console.error("Auth error:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const loadReports = async () => {
    const { data, error } = await supabase
      .from("monthly_reports")
      .select(`
        *,
        workers!inner(
          full_name,
          employee_id,
          daily_wage,
          overtime_rate,
          users!workers_supervisor_id_fkey(full_name)
        )
      `)
      .order("year", { ascending: false })
      .order("month", { ascending: false })

    if (!error && data) {
      setReports(
        data.map((report) => ({
          ...report,
          worker: {
            full_name: report.workers.full_name,
            employee_id: report.workers.employee_id,
            daily_wage: report.workers.daily_wage,
            overtime_rate: report.workers.overtime_rate,
            supervisor: {
              full_name: report.workers.users?.full_name || "غير محدد",
            },
          },
        })),
      )
    }
  }

  const filterReports = () => {
    let filtered = reports.filter((r) => r.month === selectedMonth && r.year === selectedYear)

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.worker.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.worker.employee_id.includes(searchTerm),
      )
    }

    setFilteredReports(filtered)
  }

  const exportPayrollReport = () => {
    const csvContent = [
      [
        "رقم الموظف",
        "اسم العامل",
        "المشرف",
        "الأجر اليومي",
        "أجر الساعة الإضافية",
        "أيام عادية",
        "أيام جمعة",
        "أيام عطل",
        "ساعات إضافية",
        "راتب الأيام العادية",
        "راتب أيام الجمعة",
        "راتب أيام العطل",
        "راتب الساعات الإضافية",
        "إجمالي الراتب",
      ],
      ...filteredReports.map((report) => {
        const regularSalary = report.regular_days * report.worker.daily_wage
        const fridaySalary = report.friday_days * report.worker.daily_wage * 1.5
        const holidaySalary = report.holiday_days * report.worker.daily_wage * 2
        const overtimeSalary = report.overtime_hours * report.worker.overtime_rate

        return [
          report.worker.employee_id,
          report.worker.full_name,
          report.worker.supervisor.full_name,
          report.worker.daily_wage.toFixed(2),
          report.worker.overtime_rate.toFixed(2),
          report.regular_days,
          report.friday_days,
          report.holiday_days,
          report.overtime_hours,
          regularSalary.toFixed(2),
          fridaySalary.toFixed(2),
          holidaySalary.toFixed(2),
          overtimeSalary.toFixed(2),
          report.total_salary.toFixed(2),
        ]
      }),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `تقرير_الرواتب_${getMonthName(selectedMonth)}_${selectedYear}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getMonthName = (month: number) => {
    const months = [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ]
    return months[month - 1]
  }

  const getTotalSalaries = () => {
    return filteredReports.reduce((sum, report) => sum + report.total_salary, 0)
  }

  const getAverageSalary = () => {
    if (filteredReports.length === 0) return 0
    return getTotalSalaries() / filteredReports.length
  }

  const getMonthlyStats = () => {
    const currentMonthReports = reports.filter((r) => r.month === selectedMonth && r.year === selectedYear)
    const previousMonth = selectedMonth === 1 ? 12 : selectedMonth - 1
    const previousYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear
    const previousMonthReports = reports.filter((r) => r.month === previousMonth && r.year === previousYear)

    return {
      currentTotal: currentMonthReports.reduce((sum, r) => sum + r.total_salary, 0),
      previousTotal: previousMonthReports.reduce((sum, r) => sum + r.total_salary, 0),
      currentCount: currentMonthReports.length,
      previousCount: previousMonthReports.length,
    }
  }

  const stats = getMonthlyStats()
  const salaryChange =
    stats.previousTotal > 0 ? ((stats.currentTotal - stats.previousTotal) / stats.previousTotal) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title="لوحة تحكم مسؤول الرواتب" userRole="payroll_manager" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">إجمالي التقارير</CardTitle>
              <FileText className="h-4 w-4 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredReports.length}</div>
              <p className="text-xs text-blue-200">للشهر المحدد</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">إجمالي الرواتب</CardTitle>
              <DollarSign className="h-4 w-4 text-green-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTotalSalaries().toFixed(0)} د.أ</div>
              <p className="text-xs text-green-200 flex items-center">
                {salaryChange > 0 ? (
                  <>
                    <TrendingUp className="h-3 w-3 mr-1" />+{salaryChange.toFixed(1)}% من الشهر الماضي
                  </>
                ) : salaryChange < 0 ? (
                  <>
                    <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
                    {salaryChange.toFixed(1)}% من الشهر الماضي
                  </>
                ) : (
                  "لا يوجد تغيير"
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">متوسط الراتب</CardTitle>
              <Users className="h-4 w-4 text-purple-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getAverageSalary().toFixed(0)} د.أ</div>
              <p className="text-xs text-purple-200">للعامل الواحد</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-100">الشهر المحدد</CardTitle>
              <Calendar className="h-4 w-4 text-orange-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getMonthName(selectedMonth)}</div>
              <p className="text-xs text-orange-200">{selectedYear}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>تقارير الرواتب الشهرية</CardTitle>
                <CardDescription>عرض وتصدير تقارير الرواتب لجميع العمال</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="flex gap-2">
                  <Select
                    value={selectedMonth.toString()}
                    onValueChange={(value) => setSelectedMonth(Number.parseInt(value))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {getMonthName(i + 1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 5 }, (_, i) => (
                        <SelectItem key={2024 + i} value={(2024 + i).toString()}>
                          {2024 + i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={exportPayrollReport} disabled={filteredReports.length === 0}>
                  <Download className="mr-2 h-4 w-4" />
                  تصدير CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="البحث بالاسم أو رقم الموظف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Reports Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الموظف</TableHead>
                    <TableHead>اسم العامل</TableHead>
                    <TableHead>المشرف</TableHead>
                    <TableHead>أيام عادية</TableHead>
                    <TableHead>أيام جمعة</TableHead>
                    <TableHead>أيام عطل</TableHead>
                    <TableHead>ساعات إضافية</TableHead>
                    <TableHead>إجمالي الراتب</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.worker.employee_id}</TableCell>
                      <TableCell>{report.worker.full_name}</TableCell>
                      <TableCell>{report.worker.supervisor.full_name}</TableCell>
                      <TableCell>{report.regular_days}</TableCell>
                      <TableCell>{report.friday_days}</TableCell>
                      <TableCell>{report.holiday_days}</TableCell>
                      <TableCell>{report.overtime_hours}</TableCell>
                      <TableCell className="font-bold">{report.total_salary.toFixed(2)} د.أ</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-600">
                          مكتمل
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredReports.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm
                    ? "لا توجد نتائج للبحث المحدد"
                    : `لا توجد تقارير لشهر ${getMonthName(selectedMonth)} ${selectedYear}`}
                </div>
              )}
            </div>

            {/* Summary */}
            {filteredReports.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-blue-800">عدد العمال:</span>
                    <span className="mr-2 text-blue-900">{filteredReports.length}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">إجمالي الرواتب:</span>
                    <span className="mr-2 text-blue-900 font-bold">{getTotalSalaries().toFixed(2)} د.أ</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">متوسط الراتب:</span>
                    <span className="mr-2 text-blue-900">{getAverageSalary().toFixed(2)} د.أ</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
