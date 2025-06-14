"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Save, Users, FileText, Calendar } from "lucide-react"

interface Worker {
  id: string
  full_name: string
  employee_id: string
  daily_wage: number
  overtime_rate: number
}

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
  }
}

export default function SupervisorDashboard() {
  const [user, setUser] = useState<any>(null)
  const [workers, setWorkers] = useState<Worker[]>([])
  const [reports, setReports] = useState<MonthlyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  // Form states
  const [selectedWorker, setSelectedWorker] = useState("")
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [regularDays, setRegularDays] = useState(0)
  const [fridayDays, setFridayDays] = useState(0)
  const [holidayDays, setHolidayDays] = useState(0)
  const [overtimeHours, setOvertimeHours] = useState(0)

  useEffect(() => {
    checkAuth()
  }, [])

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

      if (userError || userData.role !== "supervisor") {
        router.push("/login")
        return
      }

      setUser(userData)
      await loadWorkers(user.id)
      await loadReports(user.id)
    } catch (error) {
      console.error("Auth error:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const loadWorkers = async (supervisorId: string) => {
    const { data, error } = await supabase
      .from("workers")
      .select("*")
      .eq("supervisor_id", supervisorId)
      .order("full_name")

    if (error) {
      setError("خطأ في تحميل بيانات العمال")
    } else {
      setWorkers(data || [])
    }
  }

  const loadReports = async (supervisorId: string) => {
    const { data, error } = await supabase
      .from("monthly_reports")
      .select(`
        *,
        workers!inner(full_name, employee_id, supervisor_id)
      `)
      .eq("workers.supervisor_id", supervisorId)
      .order("year", { ascending: false })
      .order("month", { ascending: false })

    if (error) {
      setError("خطأ في تحميل التقارير")
    } else {
      setReports(
        data?.map((report) => ({
          ...report,
          worker: {
            full_name: report.workers.full_name,
            employee_id: report.workers.employee_id,
          },
        })) || [],
      )
    }
  }

  const calculateTotalSalary = (
    worker: Worker,
    regularDays: number,
    fridayDays: number,
    holidayDays: number,
    overtimeHours: number,
  ) => {
    const regularSalary = regularDays * worker.daily_wage
    const fridaySalary = fridayDays * worker.daily_wage * 1.5
    const holidaySalary = holidayDays * worker.daily_wage * 2
    const overtimeSalary = overtimeHours * worker.overtime_rate

    return regularSalary + fridaySalary + holidaySalary + overtimeSalary
  }

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!selectedWorker) {
      setError("يرجى اختيار العامل")
      return
    }

    const worker = workers.find((w) => w.id === selectedWorker)
    if (!worker) return

    const totalSalary = calculateTotalSalary(worker, regularDays, fridayDays, holidayDays, overtimeHours)

    try {
      // Check if report already exists
      const { data: existingReport } = await supabase
        .from("monthly_reports")
        .select("id")
        .eq("worker_id", selectedWorker)
        .eq("month", selectedMonth)
        .eq("year", selectedYear)
        .single()

      if (existingReport) {
        // Update existing report
        const { error } = await supabase
          .from("monthly_reports")
          .update({
            regular_days: regularDays,
            friday_days: fridayDays,
            holiday_days: holidayDays,
            overtime_hours: overtimeHours,
            total_salary: totalSalary,
          })
          .eq("id", existingReport.id)

        if (error) throw error
        setSuccess("تم تحديث التقرير بنجاح")
      } else {
        // Create new report
        const { error } = await supabase.from("monthly_reports").insert({
          worker_id: selectedWorker,
          month: selectedMonth,
          year: selectedYear,
          regular_days: regularDays,
          friday_days: fridayDays,
          holiday_days: holidayDays,
          overtime_hours: overtimeHours,
          total_salary: totalSalary,
        })

        if (error) throw error
        setSuccess("تم حفظ التقرير بنجاح")
      }

      // Reset form
      setSelectedWorker("")
      setRegularDays(0)
      setFridayDays(0)
      setHolidayDays(0)
      setOvertimeHours(0)

      // Reload reports
      await loadReports(user.id)
    } catch (error: any) {
      setError(error.message || "حدث خطأ أثناء حفظ التقرير")
    }
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
      <DashboardHeader title="لوحة تحكم المشرف" userRole="supervisor" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي العمال</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workers.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">التقارير هذا الشهر</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  reports.filter((r) => r.month === new Date().getMonth() + 1 && r.year === new Date().getFullYear())
                    .length
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الشهر الحالي</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getMonthName(new Date().getMonth() + 1)}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="add-report" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add-report">إضافة تقرير</TabsTrigger>
            <TabsTrigger value="view-reports">عرض التقارير</TabsTrigger>
          </TabsList>

          <TabsContent value="add-report">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="mr-2 h-5 w-5" />
                  إضافة تقرير شهري
                </CardTitle>
                <CardDescription>أدخل بيانات الحضور والعمل الإضافي للعامل</CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="mb-4">
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmitReport} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="worker">العامل</Label>
                      <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر العامل" />
                        </SelectTrigger>
                        <SelectContent>
                          {workers.map((worker) => (
                            <SelectItem key={worker.id} value={worker.id}>
                              {worker.full_name} - {worker.employee_id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="month">الشهر</Label>
                      <Select
                        value={selectedMonth.toString()}
                        onValueChange={(value) => setSelectedMonth(Number.parseInt(value))}
                      >
                        <SelectTrigger>
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
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="year">السنة</Label>
                      <Select
                        value={selectedYear.toString()}
                        onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
                      >
                        <SelectTrigger>
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="regular-days">أيام العمل العادية</Label>
                      <Input
                        id="regular-days"
                        type="number"
                        min="0"
                        max="31"
                        value={regularDays}
                        onChange={(e) => setRegularDays(Number.parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="friday-days">أيام الجمعة</Label>
                      <Input
                        id="friday-days"
                        type="number"
                        min="0"
                        max="5"
                        value={fridayDays}
                        onChange={(e) => setFridayDays(Number.parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="holiday-days">أيام العطل</Label>
                      <Input
                        id="holiday-days"
                        type="number"
                        min="0"
                        max="10"
                        value={holidayDays}
                        onChange={(e) => setHolidayDays(Number.parseInt(e.target.value) || 0)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="overtime-hours">ساعات العمل الإضافي</Label>
                      <Input
                        id="overtime-hours"
                        type="number"
                        min="0"
                        max="200"
                        value={overtimeHours}
                        onChange={(e) => setOvertimeHours(Number.parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  {selectedWorker && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">معاينة الراتب</h4>
                      <p className="text-blue-800">
                        إجمالي الراتب المتوقع:{" "}
                        <span className="font-bold">
                          {calculateTotalSalary(
                            workers.find((w) => w.id === selectedWorker)!,
                            regularDays,
                            fridayDays,
                            holidayDays,
                            overtimeHours,
                          ).toFixed(2)}{" "}
                          دينار
                        </span>
                      </p>
                    </div>
                  )}

                  <Button type="submit" className="w-full">
                    <Save className="mr-2 h-4 w-4" />
                    حفظ التقرير
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="view-reports">
            <Card>
              <CardHeader>
                <CardTitle>التقارير المحفوظة</CardTitle>
                <CardDescription>عرض جميع التقارير الشهرية للعمال</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>اسم العامل</TableHead>
                        <TableHead>رقم الموظف</TableHead>
                        <TableHead>الشهر/السنة</TableHead>
                        <TableHead>أيام عادية</TableHead>
                        <TableHead>أيام جمعة</TableHead>
                        <TableHead>أيام عطل</TableHead>
                        <TableHead>ساعات إضافية</TableHead>
                        <TableHead>إجمالي الراتب</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">{report.worker.full_name}</TableCell>
                          <TableCell>{report.worker.employee_id}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {getMonthName(report.month)} {report.year}
                            </Badge>
                          </TableCell>
                          <TableCell>{report.regular_days}</TableCell>
                          <TableCell>{report.friday_days}</TableCell>
                          <TableCell>{report.holiday_days}</TableCell>
                          <TableCell>{report.overtime_hours}</TableCell>
                          <TableCell className="font-bold">{report.total_salary.toFixed(2)} د.أ</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {reports.length === 0 && <div className="text-center py-8 text-gray-500">لا توجد تقارير محفوظة</div>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
