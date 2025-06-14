"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Database, Copy, CheckCircle, ExternalLink, User, Key, AlertTriangle, UserPlus, Info } from "lucide-react"

export default function SetupGuidePage() {
  const [copied, setCopied] = useState<string>("")
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [supabaseKey, setSupabaseKey] = useState("")

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(""), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const setupScript = `-- CleanTrack Database Setup Script
-- تشغيل هذا الكود في Supabase SQL Editor

-- تفعيل امتداد UUID
create extension if not exists "uuid-ossp";

-- إنشاء جدول المستخدمين
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text not null,
  role text check (role in ('supervisor', 'payroll_manager', 'admin')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- إنشاء جدول العمال
create table public.workers (
  id uuid default uuid_generate_v4() primary key,
  full_name text not null,
  employee_id text unique not null,
  supervisor_id uuid references public.users(id) on delete cascade not null,
  daily_wage decimal(10,2) not null default 0,
  overtime_rate decimal(10,2) not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- إنشاء جدول التقارير الشهرية
create table public.monthly_reports (
  id uuid default uuid_generate_v4() primary key,
  worker_id uuid references public.workers(id) on delete cascade not null,
  month integer check (month >= 1 and month <= 12) not null,
  year integer check (year >= 2020 and year <= 2050) not null,
  regular_days integer default 0 not null,
  friday_days integer default 0 not null,
  holiday_days integer default 0 not null,
  overtime_hours decimal(5,2) default 0 not null,
  total_salary decimal(10,2) default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(worker_id, month, year)
);

-- إنشاء دالة تحديث updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- إنشاء المحفزات (Triggers)
create trigger handle_users_updated_at before update on public.users
  for each row execute procedure public.handle_updated_at();

create trigger handle_workers_updated_at before update on public.workers
  for each row execute procedure public.handle_updated_at();

create trigger handle_monthly_reports_updated_at before update on public.monthly_reports
  for each row execute procedure public.handle_updated_at();

-- تفعيل Row Level Security
alter table public.users enable row level security;
alter table public.workers enable row level security;
alter table public.monthly_reports enable row level security;

-- سياسات الأمان للمستخدمين
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- سياسات الأمان للعمال
create policy "Supervisors can view their workers" on public.workers
  for select using (
    supervisor_id = auth.uid() or
    exists (
      select 1 from public.users
      where id = auth.uid() and role in ('admin', 'payroll_manager')
    )
  );

create policy "Supervisors can insert their workers" on public.workers
  for insert with check (
    supervisor_id = auth.uid() or
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Supervisors can update their workers" on public.workers
  for update using (
    supervisor_id = auth.uid() or
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- سياسات الأمان للتقارير الشهرية
create policy "Supervisors can view reports for their workers" on public.monthly_reports
  for select using (
    exists (
      select 1 from public.workers w
      where w.id = worker_id and (
        w.supervisor_id = auth.uid() or
        exists (
          select 1 from public.users u
          where u.id = auth.uid() and u.role in ('admin', 'payroll_manager')
        )
      )
    )
  );

create policy "Supervisors can insert reports for their workers" on public.monthly_reports
  for insert with check (
    exists (
      select 1 from public.workers w
      where w.id = worker_id and w.supervisor_id = auth.uid()
    ) or
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

create policy "Supervisors can update reports for their workers" on public.monthly_reports
  for update using (
    exists (
      select 1 from public.workers w
      where w.id = worker_id and w.supervisor_id = auth.uid()
    ) or
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role = 'admin'
    )
  );

-- منح الصلاحيات اللازمة
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;

-- رسالة نجاح
select 'تم إعداد قاعدة البيانات بنجاح! 🎉' as message;`

  const envTemplate = `# Supabase Configuration for CleanTrack
# استبدل هذه القيم بالقيم الحقيقية من مشروع Supabase الخاص بك

NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl || "https://your-project-ref.supabase.co"}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey || "your-anon-key-here"}

# ملاحظات:
# 1. احصل على هذه القيم من Supabase Dashboard > Settings > API
# 2. تأكد من أن URL يبدأ بـ https:// وينتهي بـ .supabase.co
# 3. Anon Key يجب أن يكون طويلاً (أكثر من 100 حرف)
# 4. لا تشارك هذه القيم مع أحد`

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Database className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">دليل الإعداد الكامل</h1>
          <p className="mt-2 text-gray-600">خطوات تفصيلية لإعداد نظام CleanTrack مع Supabase</p>
        </div>

        <Tabs defaultValue="step1" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="step1">1. إنشاء المشروع</TabsTrigger>
            <TabsTrigger value="step2">2. قاعدة البيانات</TabsTrigger>
            <TabsTrigger value="step3">3. متغيرات البيئة</TabsTrigger>
            <TabsTrigger value="step4">4. المستخدم الأول</TabsTrigger>
            <TabsTrigger value="step5">5. إضافة المشرفين</TabsTrigger>
          </TabsList>

          {/* Step 1: Create Supabase Project */}
          <TabsContent value="step1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ExternalLink className="mr-2 h-5 w-5" />
                  الخطوة 1: إنشاء مشروع Supabase
                </CardTitle>
                <CardDescription>إنشاء مشروع جديد على منصة Supabase</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">الخطوات:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>
                        اذهب إلى{" "}
                        <a
                          href="https://supabase.com"
                          target="_blank"
                          className="text-blue-600 hover:underline"
                          rel="noreferrer"
                        >
                          supabase.com
                        </a>
                      </li>
                      <li>اضغط على "Start your project"</li>
                      <li>سجل دخول أو أنشئ حساب جديد</li>
                      <li>اضغط على "New Project"</li>
                      <li>اختر Organization أو أنشئ واحدة جديدة</li>
                      <li>
                        أدخل تفاصيل المشروع:
                        <ul className="list-disc list-inside ml-4 mt-1">
                          <li>Name: CleanTrack</li>
                          <li>Database Password: كلمة مرور قوية</li>
                          <li>Region: اختر الأقرب لك</li>
                        </ul>
                      </li>
                      <li>اضغط "Create new project"</li>
                      <li>انتظر حتى يكتمل الإعداد (2-3 دقائق)</li>
                    </ol>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">نصائح مهمة:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• احفظ كلمة مرور قاعدة البيانات في مكان آمن</li>
                      <li>• اختر منطقة قريبة لتحسين الأداء</li>
                      <li>• يمكنك استخدام الخطة المجانية للبداية</li>
                      <li>• سيتم إنشاء قاعدة بيانات PostgreSQL تلقائياً</li>
                    </ul>
                  </div>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    بعد إنشاء المشروع، ستحصل على لوحة تحكم Supabase مع جميع الأدوات المطلوبة.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-center">
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    فتح Supabase Dashboard
                    <ExternalLink className="mr-1 h-4 w-4" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 2: Database Setup */}
          <TabsContent value="step2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="mr-2 h-5 w-5" />
                  الخطوة 2: إعداد قاعدة البيانات
                </CardTitle>
                <CardDescription>تشغيل سكريبت SQL لإنشاء الجداول والصلاحيات</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">الخطوات:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>اذهب إلى مشروع Supabase الخاص بك</li>
                      <li>من القائمة الجانبية، اختر "SQL Editor"</li>
                      <li>اضغط على "New Query"</li>
                      <li>انسخ والصق الكود أدناه</li>
                      <li>اضغط "Run" أو Ctrl+Enter</li>
                      <li>تأكد من ظهور رسالة النجاح</li>
                    </ol>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">ما سيتم إنشاؤه:</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• جدول المستخدمين (users)</li>
                      <li>• جدول العمال (workers)</li>
                      <li>• جدول التقارير الشهرية (monthly_reports)</li>
                      <li>• سياسات الأمان (RLS Policies)</li>
                      <li>• المحفزات (Triggers)</li>
                    </ul>
                  </div>
                </div>

                <div className="relative">
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm max-h-96">
                    <code>{setupScript}</code>
                  </pre>
                  <Button
                    onClick={() => copyToClipboard(setupScript, "setup")}
                    className="absolute top-2 right-2"
                    size="sm"
                    variant="secondary"
                  >
                    <Copy className="mr-1 h-4 w-4" />
                    {copied === "setup" ? "تم النسخ!" : "نسخ"}
                  </Button>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>مهم:</strong> تأكد من تشغيل هذا الكود بالكامل بدون أخطاء قبل الانتقال للخطوة التالية.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 3: Environment Variables */}
          <TabsContent value="step3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="mr-2 h-5 w-5" />
                  الخطوة 3: إعداد متغيرات البيئة
                </CardTitle>
                <CardDescription>الحصول على مفاتيح API وإعدادها في المشروع</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">الحصول على المفاتيح:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>في مشروع Supabase، اذهب إلى Settings</li>
                      <li>اختر "API" من القائمة الفرعية</li>
                      <li>انسخ "Project URL"</li>
                      <li>انسخ "anon public" key</li>
                      <li>أدخل القيم في النموذج أدناه</li>
                      <li>انسخ محتوى ملف .env.local</li>
                      <li>أنشئ ملف .env.local في جذر المشروع</li>
                      <li>الصق المحتوى واحفظ الملف</li>
                    </ol>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">تحذيرات أمنية:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• لا تشارك هذه المفاتيح مع أحد</li>
                      <li>• لا تضعها في Git أو GitHub</li>
                      <li>• ملف .env.local محلي فقط</li>
                      <li>• استخدم anon key وليس service_role</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="supabase-url">Supabase Project URL</Label>
                      <Input
                        id="supabase-url"
                        placeholder="https://xxxxx.supabase.co"
                        value={supabaseUrl}
                        onChange={(e) => setSupabaseUrl(e.target.value)}
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <Label htmlFor="supabase-key">Supabase Anon Key</Label>
                      <Input
                        id="supabase-key"
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        value={supabaseKey}
                        onChange={(e) => setSupabaseKey(e.target.value)}
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <Label>محتوى ملف .env.local</Label>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm mt-2">
                      <code>{envTemplate}</code>
                    </pre>
                    <Button
                      onClick={() => copyToClipboard(envTemplate, "env")}
                      className="absolute top-8 right-2"
                      size="sm"
                      variant="secondary"
                    >
                      <Copy className="mr-1 h-4 w-4" />
                      {copied === "env" ? "تم النسخ!" : "نسخ"}
                    </Button>
                  </div>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    بعد حفظ ملف .env.local، أعد تشغيل خادم التطوير (npm run dev) ليتم تحميل المتغيرات الجديدة.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 4: First User */}
          <TabsContent value="step4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  الخطوة 4: إنشاء المستخدم الأول (المدير)
                </CardTitle>
                <CardDescription>إنشاء حساب المدير الأول للنظام</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">الخطوات:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>اذهب إلى صفحة تسجيل الدخول في التطبيق</li>
                      <li>أنشئ حساب جديد بالبريد الإلكتروني المطلوب</li>
                      <li>تأكد من تأكيد البريد الإلكتروني</li>
                      <li>
                        اذهب إلى Supabase Dashboard {">"} Authentication {">"} Users
                      </li>
                      <li>انسخ User ID للمستخدم الجديد</li>
                      <li>اذهب إلى SQL Editor</li>
                      <li>شغل الكود أدناه (استبدل القيم)</li>
                    </ol>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">معلومات المدير:</h4>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• سيكون له صلاحية كاملة</li>
                      <li>• يمكنه إضافة مستخدمين جدد</li>
                      <li>• يمكنه إدارة جميع العمال</li>
                      <li>• يمكنه عرض جميع التقارير</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>مهم:</strong> يجب إنشاء الحساب في Authentication أولاً، ثم إضافة البيانات في جدول users.
                    </AlertDescription>
                  </Alert>

                  <div className="relative">
                    <Label>كود إضافة المدير الأول</Label>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm mt-2">
                      <code>{`-- استبدل القيم التالية بالقيم الحقيقية
INSERT INTO public.users (id, email, full_name, role) VALUES
('USER_ID_FROM_AUTH', 'admin@madaba.gov.jo', 'اسم المدير', 'admin');

-- مثال:
-- INSERT INTO public.users (id, email, full_name, role) VALUES
--   ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'admin@madaba.gov.jo', 'أحمد المدير', 'admin');`}</code>
                    </pre>
                    <Button
                      onClick={() =>
                        copyToClipboard(
                          `INSERT INTO public.users (id, email, full_name, role) VALUES
('USER_ID_FROM_AUTH', 'admin@madaba.gov.jo', 'اسم المدير', 'admin');`,
                          "admin",
                        )
                      }
                      className="absolute top-8 right-2"
                      size="sm"
                      variant="secondary"
                    >
                      <Copy className="mr-1 h-4 w-4" />
                      {copied === "admin" ? "تم النسخ!" : "نسخ"}
                    </Button>
                  </div>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    بعد إضافة المدير، يمكنك تسجيل الدخول والوصول إلى لوحة تحكم المدير لإدارة النظام.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Step 5: Adding Supervisors */}
          <TabsContent value="step5">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="mr-2 h-5 w-5" />
                  الخطوة 5: إضافة المشرفين
                </CardTitle>
                <CardDescription>كيفية إضافة المشرفين الجدد للنظام</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">طريقة إضافة المشرفين:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>سجل دخول كمدير في النظام</li>
                      <li>اذهب إلى لوحة تحكم المدير</li>
                      <li>اضغط على "إضافة مشرف جديد"</li>
                      <li>أدخل بيانات المشرف (الاسم، البريد، كلمة المرور)</li>
                      <li>اضغط "إعداد المشرف"</li>
                      <li>ستظهر تعليمات مفصلة</li>
                      <li>انسخ التعليمات واتبعها</li>
                    </ol>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">ما يحدث عند الإضافة:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• النظام يعطيك تعليمات واضحة</li>
                      <li>• المشرف يسجل بنفسه في النظام</li>
                      <li>• تقوم بتشغيل كود SQL بسيط</li>
                      <li>• يصبح المشرف جاهز للاستخدام</li>
                    </ul>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>ملاحظة:</strong> هذه الطريقة آمنة وتضمن أن كل مشرف يحصل على حساب منفصل وآمن.
                  </AlertDescription>
                </Alert>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-3">مثال على التعليمات التي ستظهر:</h4>
                  <div className="text-sm text-green-700 space-y-2">
                    <p>
                      <strong>1.</strong> اطلب من المشرف التسجيل باستخدام:
                    </p>
                    <ul className="list-disc list-inside ml-4">
                      <li>البريد الإلكتروني: supervisor@madaba.gov.jo</li>
                      <li>كلمة المرور: [كلمة المرور المحددة]</li>
                    </ul>
                    <p>
                      <strong>2.</strong> بعد التسجيل، شغل هذا الكود في SQL Editor:
                    </p>
                    <pre className="bg-white p-2 rounded text-xs mt-2">
                      {`INSERT INTO public.users (id, email, full_name, role)
SELECT id, email, 'اسم المشرف', 'supervisor'
FROM auth.users 
WHERE email = 'supervisor@madaba.gov.jo';`}
                    </pre>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <h4 className="font-semibold">آمن</h4>
                    </div>
                    <p className="text-sm text-gray-600">كل مشرف له حساب منفصل وآمن</p>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <h4 className="font-semibold">سهل</h4>
                    </div>
                    <p className="text-sm text-gray-600">تعليمات واضحة خطوة بخطوة</p>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <h4 className="font-semibold">مرن</h4>
                    </div>
                    <p className="text-sm text-gray-600">يمكن إضافة أي عدد من المشرفين</p>
                  </Card>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>تهانينا!</strong> النظام جاهز الآن للاستخدام الكامل. يمكن للمشرفين إدخال تقارير العمال
                    ولمسؤولي الرواتب عرض وتصدير البيانات.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-center space-x-4 space-x-reverse">
                  <Button asChild>
                    <a href="/login">
                      <User className="mr-2 h-4 w-4" />
                      تسجيل الدخول للنظام
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/">العودة للصفحة الرئيسية</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">🎯 نصائح للنجاح</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <ul className="space-y-2">
              <li>• اتبع الخطوات بالترتيب المحدد</li>
              <li>• تأكد من نجاح كل خطوة قبل الانتقال للتالية</li>
              <li>• احفظ جميع كلمات المرور والمفاتيح بأمان</li>
            </ul>
            <ul className="space-y-2">
              <li>• اختبر النظام بعد كل خطوة</li>
              <li>• تأكد من عمل تسجيل الدخول</li>
              <li>• راجع الأخطاء في Console إذا واجهت مشاكل</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
