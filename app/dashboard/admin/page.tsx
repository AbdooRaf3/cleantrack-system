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
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Users,
  FileText,
  DollarSign,
  Download,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  TrendingUp,
  Building2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Copy,
} from "lucide-react"

interface Worker {
  id: string
  full_name: string
  employee_id: string
  supervisor_id: string
  daily_wage: number
  overtime_rate: number
  supervisor: {
    full_name: string
  }
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
    supervisor: {
      full_name: string
    }
  }
}

interface Supervisor {
  id: string
  full_name: string
  email: string
  created_at: string
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [workers, setWorkers] = useState<Worker[]>([])
  const [reports, setReports] = useState<MonthlyReport[]>([])
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const router = useRouter()

  // Worker form states
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false)
  const [workerForm, setWorkerForm] = useState({
    full_name: "",
    employee_id: "",
    supervisor_id: "",
    daily_wage: 0,
    overtime_rate: 0,
  })

  // Supervisor form states
  const [isAddSupervisorOpen, setIsAddSupervisorOpen] = useState(false)
  const [supervisorForm, setSupervisorForm] = useState({
    full_name: "",
    email: "",
    password: "",
  })
  const [supervisorLoading, setSupervisorLoading] = useState(false)
  const [supervisorError, setSupervisorError] = useState("")
  const [supervisorSuccess, setSupervisorSuccess] = useState("")
  const [showInstructions, setShowInstructions] = useState(false)

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

      if (userError || userData.role !== "admin") {
        router.push("/login")
        return
      }

      setUser(userData)
      await loadData()
    } catch (error) {
      console.error("Auth error:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const loadData = async () => {
    await Promise.all([loadWorkers(), loadReports(), loadSupervisors()])
  }

  const loadWorkers = async () => {
    const { data, error } = await supabase
      .from("workers")
      .select(`
        *,
        users!workers_supervisor_id_fkey(full_name)
      `)
      .order("full_name")

    if (!error && data) {
      setWorkers(
        data.map((worker) => ({
          ...worker,
          supervisor: {
            full_name: worker.users?.full_name || "غير محدد",
          },
        })),
      )
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
            supervisor: {
              full_name: report.workers.users?.full_name || "غير محدد",
            },
          },
        })),
      )
    }
  }

  const loadSupervisors = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email, created_at")
      .eq("role", "supervisor")
      .order("full_name")

    if (!error && data) {
      setSupervisors(data)
    }
  }

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault()

    const { error } = await supabase.from("workers").insert([workerForm])

    if (!error) {
      setIsAddWorkerOpen(false)
      setWorkerForm({
        full_name: "",
        employee_id: "",
        supervisor_id: "",
        daily_wage: 0,
        overtime_rate: 0,
      })
      await loadWorkers()
    }
  }

  const handleAddSupervisor = async (e: React.FormEvent) => {
    e.preventDefault()
    setSupervisorLoading(true)
    setSupervisorError("")
    setSupervisorSuccess("")

    try {
      // Since we can't use admin.createUser with anon key, we'll show instructions instead
      const instructions = `
تعليمات إضافة المشرف الجديد:

1. اطلب من المشرف التسجيل في النظام باستخدام:
   - البريد الإلكتروني: ${supervisorForm.email}
   - كلمة المرور: ${supervisorForm.password}

2. بعد التسجيل، قم بتشغيل هذا الكود في Supabase SQL Editor:

INSERT INTO public.users (id, email, full_name, role)
SELECT id, email, '${supervisorForm.full_name}', 'supervisor'
FROM auth.users 
WHERE email = '${supervisorForm.email}';

3. أو يمكنك نسخ معرف المستخدم من Authentication > Users وتشغيل:

INSERT INTO public.users (id, email, full_name, role) VALUES
('USER_ID_HERE', '${supervisorForm.email}', '${supervisorForm.full_name}', 'supervisor');
      `

      setSupervisorSuccess(instructions)
      setShowInstructions(true)
    } catch (error: any) {
      setSupervisorError(error.message || "حدث خطأ أثناء إعداد المشرف")
    } finally {
      setSupervisorLoading(false)
    }
  }

  const copyInstructions = async () => {
    const instructions = `تعليمات إضافة المشرف الجديد:

1. اطلب من المشرف التسجيل في النظام باستخدام:
   - البريد الإلكتروني: ${supervisorForm.email}
   - كلمة المرور: ${supervisorForm.password}

2. بعد التسجيل، قم بتشغيل هذا الكود في Supabase SQL Editor:

INSERT INTO public.users (id, email, full_name, role)
SELECT id, email, '${supervisorForm.full_name}', 'supervisor'
FROM auth.users 
WHERE email = '${supervisorForm.email}';

3. أو يمكنك نسخ معرف المستخدم من Authentication > Users وتشغيل:

INSERT INTO public.users (id, email, full_name, role) VALUES
('USER_ID_HERE', '${supervisorForm.email}', '${supervisorForm.full_name}', 'supervisor');`

    try {
      await navigator.clipboard.writeText(instructions)
      alert("تم نسخ التعليمات!")
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  const exportToCSV = () => {
    const filteredReports = reports.filter((r) => r.month === selectedMonth && r.year === selectedYear)

    const csvContent = [
      ["اسم العامل", "رقم الموظف", "المشرف", "أيام عادية", "أيام جمعة", "أيام عطل", "ساعات إضافية", "إجمالي الراتب"],
      ...filteredReports.map((report) => [
        report.worker.full_name,
        report.worker.employee_id,
        report.worker.supervisor.full_name,
        report.regular_days,
        report.friday_days,
        report.holiday_days,
        report.overtime_hours,
        report.total_salary.toFixed(2),
      ]),
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
    return reports
      .filter((r) => r.month === selectedMonth && r.year === selectedYear)
      .reduce((sum, report) => sum + report.total_salary, 0)
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
  const countChange =
    stats.previousCount > 0 ? ((stats.currentCount - stats.previousCount) / stats.previousCount) * 100 : 0

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
      <DashboardHeader title="لوحة تحكم المدير" userRole="admin" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">إجمالي العمال</CardTitle>
              <Users className="h-4 w-4 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workers.length}</div>
              <p className="text-xs text-blue-200">{workers.filter((w) => w.supervisor_id).length} عامل نشط</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-100">المشرفين</CardTitle>
              <Building2 className="h-4 w-4 text-green-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{supervisors.length}</div>
              <p className="text-xs text-green-200">{supervisors.length > 0 ? "جميعهم نشطين" : "لا يوجد مشرفين"}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">التقارير الشهرية</CardTitle>
              <FileText className="h-4 w-4 text-purple-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reports.filter((r) => r.month === selectedMonth && r.year === selectedYear).length}
              </div>
              <p className="text-xs text-purple-200 flex items-center">
                {countChange > 0 ? (
                  <>
                    <TrendingUp className="h-3 w-3 mr-1" />+{countChange.toFixed(1)}% من الشهر الماضي
                  </>
                ) : countChange < 0 ? (
                  <>
                    <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
                    {countChange.toFixed(1)}% من الشهر الماضي
                  </>
                ) : (
                  "لا يوجد تغيير"
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-100">إجمالي الرواتب</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getTotalSalaries().toFixed(0)} د.أ</div>
              <p className="text-xs text-orange-200 flex items-center">
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
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <UserPlus className="h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">إضافة مشرف جديد</h3>
              <p className="text-sm text-gray-600 text-center mb-4">أضف مشرف جديد لإدارة مجموعة من العمال</p>
              <Dialog open={isAddSupervisorOpen} onOpenChange={setIsAddSupervisorOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    إضافة مشرف
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>إضافة مشرف جديد</DialogTitle>
                    <DialogDescription>أدخل بيانات المشرف الجديد. ستحصل على تعليمات لإكمال العملية.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddSupervisor} className="space-y-4">
                    {supervisorError && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{supervisorError}</AlertDescription>
                      </Alert>
                    )}
                    {showInstructions && supervisorSuccess && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-2">
                            <p className="font-medium">تم إعداد بيانات المشرف!</p>
                            <pre className="text-xs bg-gray-100 p-2 rounded whitespace-pre-wrap">
                              {supervisorSuccess}
                            </pre>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={copyInstructions}
                              className="w-full"
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              نسخ التعليمات
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                    {!showInstructions && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="supervisor_full_name">الاسم الكامل</Label>
                          <Input
                            id="supervisor_full_name"
                            value={supervisorForm.full_name}
                            onChange={(e) => setSupervisorForm({ ...supervisorForm, full_name: e.target.value })}
                            placeholder="أدخل الاسم الكامل"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="supervisor_email">البريد الإلكتروني</Label>
                          <Input
                            id="supervisor_email"
                            type="email"
                            value={supervisorForm.email}
                            onChange={(e) => setSupervisorForm({ ...supervisorForm, email: e.target.value })}
                            placeholder="example@madaba.gov.jo"
                            required
                            dir="ltr"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="supervisor_password">كلمة المرور</Label>
                          <Input
                            id="supervisor_password"
                            type="password"
                            value={supervisorForm.password}
                            onChange={(e) => setSupervisorForm({ ...supervisorForm, password: e.target.value })}
                            placeholder="كلمة مرور قوية"
                            required
                            dir="ltr"
                            minLength={6}
                          />
                          <p className="text-xs text-gray-500">يجب أن تكون كلمة المرور 6 أحرف على الأقل</p>
                        </div>
                      </>
                    )}
                    <div className="flex gap-2">
                      {!showInstructions ? (
                        <>
                          <Button type="submit" disabled={supervisorLoading} className="flex-1">
                            {supervisorLoading ? (
                              <>
                                <Clock className="mr-2 h-4 w-4 animate-spin" />
                                جاري الإعداد...
                              </>
                            ) : (
                              <>
                                <UserPlus className="mr-2 h-4 w-4" />
                                إعداد المشرف
                              </>
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsAddSupervisorOpen(false)}
                            disabled={supervisorLoading}
                          >
                            إلغاء
                          </Button>
                        </>
                      ) : (
                        <Button
                          type="button"
                          onClick={() => {
                            setIsAddSupervisorOpen(false)
                            setShowInstructions(false)
                            setSupervisorSuccess("")
                            setSupervisorForm({ full_name: "", email: "", password: "" })
                          }}
                          className="w-full"
                        >
                          إغلاق
                        </Button>
                      )}
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed border-green-200 hover:border-green-400 transition-colors">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Plus className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">إضافة عامل جديد</h3>
              <p className="text-sm text-gray-600 text-center mb-4">أضف عامل جديد وحدد المشرف المسؤول عنه</p>
              <Dialog open={isAddWorkerOpen} onOpenChange={setIsAddWorkerOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    إضافة عامل
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إضافة عامل جديد</DialogTitle>
                    <DialogDescription>أدخل بيانات العامل الجديد</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddWorker} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">الاسم الكامل</Label>
                      <Input
                        id="full_name"
                        value={workerForm.full_name}
                        onChange={(e) => setWorkerForm({ ...workerForm, full_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employee_id">رقم الموظف</Label>
                      <Input
                        id="employee_id"
                        value={workerForm.employee_id}
                        onChange={(e) => setWorkerForm({ ...workerForm, employee_id: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supervisor_id">المشرف</Label>
                      <Select
                        value={workerForm.supervisor_id}
                        onValueChange={(value) => setWorkerForm({ ...workerForm, supervisor_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المشرف" />
                        </SelectTrigger>
                        <SelectContent>
                          {supervisors.map((supervisor) => (
                            <SelectItem key={supervisor.id} value={supervisor.id}>
                              {supervisor.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="daily_wage">الأجر اليومي</Label>
                        <Input
                          id="daily_wage"
                          type="number"
                          step="0.01"
                          value={workerForm.daily_wage}
                          onChange={(e) =>
                            setWorkerForm({ ...workerForm, daily_wage: Number.parseFloat(e.target.value) || 0 })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="overtime_rate">أجر الساعة الإضافية</Label>
                        <Input
                          id="overtime_rate"
                          type="number"
                          step="0.01"
                          value={workerForm.overtime_rate}
                          onChange={(e) =>
                            setWorkerForm({ ...workerForm, overtime_rate: Number.parseFloat(e.target.value) || 0 })
                          }
                          required
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full">
                      إضافة العامل
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card className="border-2 border-dashed border-purple-200 hover:border-purple-400 transition-colors">
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Download className="h-12 w-12 text-purple-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">تصدير التقارير</h3>
              <p className="text-sm text-gray-600 text-center mb-4">صدّر تقارير الرواتب الشهرية بصيغة CSV</p>
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="mr-2 h-4 w-4" />
                تصدير CSV
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reports">التقارير والرواتب</TabsTrigger>
            <TabsTrigger value="workers">إدارة العمال</TabsTrigger>
            <TabsTrigger value="supervisors">إدارة المشرفين</TabsTrigger>
          </TabsList>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>تقارير الرواتب الشهرية</CardTitle>
                    <CardDescription>عرض وتصدير تقارير الرواتب لجميع العمال</CardDescription>
                  </div>
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
                    <Button onClick={exportToCSV}>
                      <Download className="mr-2 h-4 w-4" />
                      تصدير CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>اسم العامل</TableHead>
                        <TableHead>رقم الموظف</TableHead>
                        <TableHead>المشرف</TableHead>
                        <TableHead>أيام عادية</TableHead>
                        <TableHead>أيام جمعة</TableHead>
                        <TableHead>أيام عطل</TableHead>
                        <TableHead>ساعات إضافية</TableHead>
                        <TableHead>إجمالي الراتب</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports
                        .filter((r) => r.month === selectedMonth && r.year === selectedYear)
                        .map((report) => (
                          <TableRow key={report.id}>
                            <TableCell className="font-medium">{report.worker.full_name}</TableCell>
                            <TableCell>{report.worker.employee_id}</TableCell>
                            <TableCell>{report.worker.supervisor.full_name}</TableCell>
                            <TableCell>{report.regular_days}</TableCell>
                            <TableCell>{report.friday_days}</TableCell>
                            <TableCell>{report.holiday_days}</TableCell>
                            <TableCell>{report.overtime_hours}</TableCell>
                            <TableCell className="font-bold">{report.total_salary.toFixed(2)} د.أ</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                  {reports.filter((r) => r.month === selectedMonth && r.year === selectedYear).length === 0 && (
                    <div className="text-center py-8 text-gray-500">لا توجد تقارير للشهر المحدد</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workers">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>إدارة العمال</CardTitle>
                    <CardDescription>عرض وإدارة جميع العمال في النظام</CardDescription>
                  </div>
                  <Dialog open={isAddWorkerOpen} onOpenChange={setIsAddWorkerOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        إضافة عامل جديد
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>إضافة عامل جديد</DialogTitle>
                        <DialogDescription>أدخل بيانات العامل الجديد</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddWorker} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="full_name">الاسم الكامل</Label>
                          <Input
                            id="full_name"
                            value={workerForm.full_name}
                            onChange={(e) => setWorkerForm({ ...workerForm, full_name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="employee_id">رقم الموظف</Label>
                          <Input
                            id="employee_id"
                            value={workerForm.employee_id}
                            onChange={(e) => setWorkerForm({ ...workerForm, employee_id: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="supervisor_id">المشرف</Label>
                          <Select
                            value={workerForm.supervisor_id}
                            onValueChange={(value) => setWorkerForm({ ...workerForm, supervisor_id: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="اختر المشرف" />
                            </SelectTrigger>
                            <SelectContent>
                              {supervisors.map((supervisor) => (
                                <SelectItem key={supervisor.id} value={supervisor.id}>
                                  {supervisor.full_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="daily_wage">الأجر اليومي</Label>
                            <Input
                              id="daily_wage"
                              type="number"
                              step="0.01"
                              value={workerForm.daily_wage}
                              onChange={(e) =>
                                setWorkerForm({ ...workerForm, daily_wage: Number.parseFloat(e.target.value) || 0 })
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="overtime_rate">أجر الساعة الإضافية</Label>
                            <Input
                              id="overtime_rate"
                              type="number"
                              step="0.01"
                              value={workerForm.overtime_rate}
                              onChange={(e) =>
                                setWorkerForm({ ...workerForm, overtime_rate: Number.parseFloat(e.target.value) || 0 })
                              }
                              required
                            />
                          </div>
                        </div>
                        <Button type="submit" className="w-full">
                          إضافة العامل
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>اسم العامل</TableHead>
                        <TableHead>رقم الموظف</TableHead>
                        <TableHead>المشرف</TableHead>
                        <TableHead>الأجر اليومي</TableHead>
                        <TableHead>أجر الساعة الإضافية</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {workers.map((worker) => (
                        <TableRow key={worker.id}>
                          <TableCell className="font-medium">{worker.full_name}</TableCell>
                          <TableCell>{worker.employee_id}</TableCell>
                          <TableCell>{worker.supervisor.full_name}</TableCell>
                          <TableCell>{worker.daily_wage.toFixed(2)} د.أ</TableCell>
                          <TableCell>{worker.overtime_rate.toFixed(2)} د.أ</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {workers.length === 0 && <div className="text-center py-8 text-gray-500">لا يوجد عمال في النظام</div>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="supervisors">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>إدارة المشرفين</CardTitle>
                    <CardDescription>عرض وإدارة جميع المشرفين في النظام</CardDescription>
                  </div>
                  <Dialog open={isAddSupervisorOpen} onOpenChange={setIsAddSupervisorOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        إضافة مشرف جديد
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>الاسم</TableHead>
                        <TableHead>البريد الإلكتروني</TableHead>
                        <TableHead>عدد العمال</TableHead>
                        <TableHead>تاريخ الإضافة</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {supervisors.map((supervisor) => (
                        <TableRow key={supervisor.id}>
                          <TableCell className="font-medium">{supervisor.full_name}</TableCell>
                          <TableCell>{supervisor.email}</TableCell>
                          <TableCell>{workers.filter((w) => w.supervisor_id === supervisor.id).length}</TableCell>
                          <TableCell>{new Date(supervisor.created_at).toLocaleDateString("ar-SA")}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-green-600">
                              نشط
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {supervisors.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <UserPlus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">لا يوجد مشرفين</p>
                      <p className="text-gray-500 mb-4">ابدأ بإضافة مشرف جديد لإدارة العمال</p>
                      <Dialog open={isAddSupervisorOpen} onOpenChange={setIsAddSupervisorOpen}>
                        <DialogTrigger asChild>
                          <Button>
                            <UserPlus className="mr-2 h-4 w-4" />
                            إضافة أول مشرف
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
