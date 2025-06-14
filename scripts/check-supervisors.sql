-- Check existing supervisors in the system
-- فحص المشرفين الموجودين في النظام

SELECT id, full_name, email, role 
FROM public.users 
WHERE role = 'supervisor'
ORDER BY full_name;

-- If no supervisors exist, we need to create some first
-- إذا لم يوجد مشرفين، نحتاج لإنشاء بعضهم أولاً
