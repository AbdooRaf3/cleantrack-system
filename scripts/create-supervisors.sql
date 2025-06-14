-- Create supervisors based on the areas mentioned in the data
-- إنشاء المشرفين بناءً على المناطق المذكورة في البيانات

-- First, let's create supervisor accounts (these need to be registered in auth first)
-- أولاً، نحتاج لإنشاء حسابات المشرفين (يجب تسجيلهم في auth أولاً)

-- For now, let's create a default supervisor to assign all workers to
-- في الوقت الحالي، سننشئ مشرف افتراضي لتعيين جميع العمال إليه

-- Insert a default supervisor (replace with actual supervisor data)
INSERT INTO public.users (id, email, full_name, role) 
VALUES 
  (gen_random_uuid(), 'supervisor1@madaba.gov.jo', 'مشرف عام - المنطقة الأولى', 'supervisor'),
  (gen_random_uuid(), 'supervisor2@madaba.gov.jo', 'مشرف عام - المنطقة الثانية', 'supervisor'),
  (gen_random_uuid(), 'supervisor3@madaba.gov.jo', 'مشرف عام - المنطقة الثالثة', 'supervisor')
ON CONFLICT (email) DO NOTHING;

-- Display created supervisors
SELECT 'تم إنشاء المشرفين:' as message;
SELECT id, full_name, email FROM public.users WHERE role = 'supervisor';
