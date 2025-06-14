import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, FileText, Settings, LogIn, BookOpen, Shield, Clock, BarChart3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <Building2 className="mx-auto h-16 w-16 text-blue-600 mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">نظام CleanTrack</h1>
          <p className="text-xl text-gray-600 mb-8">نظام إدارة الحضور اليومي لعمال النظافة - بلدية مادبا</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <LogIn className="mr-2 h-5 w-5" />
                تسجيل الدخول
              </Button>
            </Link>
            <Link href="/setup-guide">
              <Button variant="outline" size="lg">
                <BookOpen className="mr-2 h-5 w-5" />
                دليل الإعداد
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-blue-600" />
                المشرفين
              </CardTitle>
              <CardDescription>إدخال وإدارة تقارير الحضور اليومي للعمال</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-green-500" />
                  إدخال أيام العمل العادية
                </li>
                <li className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-orange-500" />
                  تسجيل أيام الجمعة والعطل
                </li>
                <li className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-purple-500" />
                  إدخال ساعات العمل الإضافي
                </li>
                <li className="flex items-center">
                  <BarChart3 className="mr-2 h-4 w-4 text-blue-500" />
                  عرض التقارير الشخصية
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-green-600" />
                مسؤول الرواتب
              </CardTitle>
              <CardDescription>عرض وتصدير تقارير الرواتب الشهرية</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center">
                  <BarChart3 className="mr-2 h-4 w-4 text-green-500" />
                  عرض جميع تقارير الرواتب
                </li>
                <li className="flex items-center">
                  <FileText className="mr-2 h-4 w-4 text-blue-500" />
                  تصدير البيانات بصيغة CSV
                </li>
                <li className="flex items-center">
                  <Settings className="mr-2 h-4 w-4 text-purple-500" />
                  تصفية التقارير حسب الشهر
                </li>
                <li className="flex items-center">
                  <FileText className="mr-2 h-4 w-4 text-orange-500" />
                  طباعة كشوف الرواتب
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5 text-purple-600" />
                المدير
              </CardTitle>
              <CardDescription>إدارة شاملة للنظام والمستخدمين</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-purple-500" />
                  إدارة جميع العمال والمشرفين
                </li>
                <li className="flex items-center">
                  <BarChart3 className="mr-2 h-4 w-4 text-green-500" />
                  عرض جميع التقارير
                </li>
                <li className="flex items-center">
                  <Shield className="mr-2 h-4 w-4 text-blue-500" />
                  إضافة مستخدمين جدد
                </li>
                <li className="flex items-center">
                  <FileText className="mr-2 h-4 w-4 text-orange-500" />
                  تصدير التقارير الشاملة
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* System Features */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">مميزات النظام</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">أمان عالي</h3>
              <p className="text-sm text-gray-600">حماية البيانات بأحدث معايير الأمان</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">سرعة في الأداء</h3>
              <p className="text-sm text-gray-600">استجابة سريعة وأداء محسّن</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">تقارير تفصيلية</h3>
              <p className="text-sm text-gray-600">إحصائيات شاملة وتقارير دقيقة</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">سهولة الاستخدام</h3>
              <p className="text-sm text-gray-600">واجهة بسيطة ومفهومة للجميع</p>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">البدء مع النظام</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <LogIn className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">تسجيل الدخول</h3>
              <p className="text-gray-600 mb-4">ادخل إلى النظام باستخدام بيانات الاعتماد الخاصة بك</p>
              <Link href="/login">
                <Button className="w-full">
                  <LogIn className="mr-2 h-4 w-4" />
                  تسجيل الدخول الآن
                </Button>
              </Link>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">دليل الإعداد</h3>
              <p className="text-gray-600 mb-4">اتبع الدليل التفصيلي لإعداد النظام لأول مرة</p>
              <Link href="/setup-guide">
                <Button variant="outline" className="w-full">
                  <BookOpen className="mr-2 h-4 w-4" />
                  دليل الإعداد
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2025 بلدية مادبا - جميع الحقوق محفوظة</p>
          <p>تم تطوير النظام خصيصاً لإدارة عمال النظافة بكفاءة وشفافية</p>
        </div>
      </div>
    </div>
  )
}
