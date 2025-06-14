-- Import Workers Data from February 2025 Attendance Report
-- تشغيل هذا الكود في Supabase SQL Editor لإضافة العمال

-- First, let's assume we have supervisors with these IDs (replace with actual supervisor IDs)
-- يجب استبدال هذه المعرفات بالمعرفات الحقيقية للمشرفين

-- Insert workers data
INSERT INTO public.workers (full_name, employee_id, supervisor_id, daily_wage, overtime_rate) VALUES
-- Malik Al-Abbasiya - Layli Area
('محمد إبراهيم محمد إسماعيل', '1820', (SELECT id FROM users WHERE full_name LIKE '%مالك%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('محمد حسن معروف محمد', '2828', (SELECT id FROM users WHERE full_name LIKE '%مالك%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('عمرو محمد شحاته محمد', '4833', (SELECT id FROM users WHERE full_name LIKE '%مالك%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('إبراهيم حسن قنديل احمد', '5855', (SELECT id FROM users WHERE full_name LIKE '%مالك%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('أشرف محمد ذكي محمد', '8899', (SELECT id FROM users WHERE full_name LIKE '%مالك%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('احمد قياتي عبدالوهاب محمد', '9921', (SELECT id FROM users WHERE full_name LIKE '%مالك%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('رضا مصطفى حمدي مرسي', '12930', (SELECT id FROM users WHERE full_name LIKE '%مالك%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('احمد عبدالغني احمد احمد', '201311', (SELECT id FROM users WHERE full_name LIKE '%مالك%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('أشرف عشري محمد مهني', '231440', (SELECT id FROM users WHERE full_name LIKE '%مالك%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('ربيع صبيح محمد احمد', '283017', (SELECT id FROM users WHERE full_name LIKE '%مالك%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('إبراهيم زكي عياد رزق', '303019', (SELECT id FROM users WHERE full_name LIKE '%مالك%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('إسماعيل حسن محمود إسماعيل', '343039', (SELECT id FROM users WHERE full_name LIKE '%مالك%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('رمضان حسين محمد طلبة', '393055', (SELECT id FROM users WHERE full_name LIKE '%مالك%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('سعيد عبدالحليم محمد محمد طلبة', '403057', (SELECT id FROM users WHERE full_name LIKE '%مالك%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('حجازي الدخلي جلوي محمد', '413059', (SELECT id FROM users WHERE full_name LIKE '%مالك%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('رمضان صلاح رجب', '423066', (SELECT id FROM users WHERE full_name LIKE '%مالك%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('عبد الحميد ضاحي مصطفى احمد', '433073', (SELECT id FROM users WHERE full_name LIKE '%مالك%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('خلف إبراهيم محمد إبراهيم', '443080', (SELECT id FROM users WHERE full_name LIKE '%مالك%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('حسن محمد عقل محمد', '483089', (SELECT id FROM users WHERE full_name LIKE '%مالك%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('خالد محمد علي العطيفي', '504006', (SELECT id FROM users WHERE full_name LIKE '%مالك%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('محمد حسن عبدالهادي علي', '634081', (SELECT id FROM users WHERE full_name LIKE '%مالك%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('ياسر عيد محمد شحاته', '694106', (SELECT id FROM users WHERE full_name LIKE '%مالك%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('عبدالمنعم صلاح راضي شحاته', '804129', (SELECT id FROM users WHERE full_name LIKE '%مالك%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('عمرو صلاح إسماعيل إبراهيم', '824134', (SELECT id FROM users WHERE full_name LIKE '%مالك%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),

-- Ahmad Saeed - Agriculture Area
('إبراهيم عبدالمحسن أمين عثمان', '6856', (SELECT id FROM users WHERE full_name LIKE '%أحمد سعيد%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('إيهاب محمد أبوزيد محمد', '11923', (SELECT id FROM users WHERE full_name LIKE '%أحمد سعيد%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('محمد غزلول عبدالمطلب علي', '171050', (SELECT id FROM users WHERE full_name LIKE '%أحمد سعيد%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('حسن حسني حسن عبدالمجيد', '191298', (SELECT id FROM users WHERE full_name LIKE '%أحمد سعيد%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('عبدالرحمن عبدالحليم عبدالرحمن حسن', '333026', (SELECT id FROM users WHERE full_name LIKE '%أحمد سعيد%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('وليد محمد حبشي سعد', '383052', (SELECT id FROM users WHERE full_name LIKE '%أحمد سعيد%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('ياسر جمعه احمد علي', '754119', (SELECT id FROM users WHERE full_name LIKE '%أحمد سعيد%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('خالد جمال فتحي محمد', '794128', (SELECT id FROM users WHERE full_name LIKE '%أحمد سعيد%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),

-- Ahmad Al-Qatish - Zaidiya Area
('نادي سرحان عبداللطيف إبراهيم', '7861', (SELECT id FROM users WHERE full_name LIKE '%أحمد القطيش%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('حجازي شحاته محمد', '14999', (SELECT id FROM users WHERE full_name LIKE '%أحمد القطيش%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('خالد فلاح نجيب محمد', '243004', (SELECT id FROM users WHERE full_name LIKE '%أحمد القطيش%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('إسماعيل حسن احمد عبدالله', '453082', (SELECT id FROM users WHERE full_name LIKE '%أحمد القطيش%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('رضا محمد عبدالحميد مرسي', '584033', (SELECT id FROM users WHERE full_name LIKE '%أحمد القطيش%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('محمد فلخ السيد علي', '664093', (SELECT id FROM users WHERE full_name LIKE '%أحمد القطيش%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('عبدالله محمد محمد عبدالوهاب', '734116', (SELECT id FROM users WHERE full_name LIKE '%أحمد القطيش%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('احمد جمعه احمد علي', '845057', (SELECT id FROM users WHERE full_name LIKE '%أحمد القطيش%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),

-- Hamza Al-Karama - Camp Area
('علاء محمد محمد عبدالوهاب', '151023', (SELECT id FROM users WHERE full_name LIKE '%حمزة الكرامة%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('خالد محمد علي أبوزيد', '211357', (SELECT id FROM users WHERE full_name LIKE '%حمزة الكرامة%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('طه محمود شحاته بكر', '263009', (SELECT id FROM users WHERE full_name LIKE '%حمزة الكرامة%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('سماح محي أمين احمد', '473085', (SELECT id FROM users WHERE full_name LIKE '%حمزة الكرامة%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('محمد حسين محمد خالد', '494004', (SELECT id FROM users WHERE full_name LIKE '%حمزة الكرامة%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('وليد خلف عبدالحليم طلبة', '574026', (SELECT id FROM users WHERE full_name LIKE '%حمزة الكرامة%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('إبراهيم مرسي كامل مرسي', '594036', (SELECT id FROM users WHERE full_name LIKE '%حمزة الكرامة%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('محمد احمد محمد عبدالحليم', '614077', (SELECT id FROM users WHERE full_name LIKE '%حمزة الكرامة%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('ياسر عيد عبدالوهاب علي', '624078', (SELECT id FROM users WHERE full_name LIKE '%حمزة الكرامة%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('احمد محمد جابر عبدالغني', '834138', (SELECT id FROM users WHERE full_name LIKE '%حمزة الكرامة%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),

-- Othman Al-Rafai - City Center
('علاء محمد شحاته محمد', '13946', (SELECT id FROM users WHERE full_name LIKE '%عثمان الرفاعي%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('احمد جاد علي حافظ', '161045', (SELECT id FROM users WHERE full_name LIKE '%عثمان الرفاعي%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('أبومهدي زكي السيد', '293018', (SELECT id FROM users WHERE full_name LIKE '%عثمان الرفاعي%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('إبراهيم فتحي إبراهيم حسن', '8950507', (SELECT id FROM users WHERE full_name LIKE '%عثمان الرفاعي%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),

-- Jalal Abu Issa - Eastern Area
('محمد حسن محمد احمد', '9910', (SELECT id FROM users WHERE full_name LIKE '%جلال أبوعيسى%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('ياسر عبدالعزيز حسن غنيم', '253006', (SELECT id FROM users WHERE full_name LIKE '%جلال أبوعيسى%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('احمد علي احمد علي', '273011', (SELECT id FROM users WHERE full_name LIKE '%جلال أبوعيسى%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('مختار محمد عبدالحميد مرسي', '323022', (SELECT id FROM users WHERE full_name LIKE '%جلال أبوعيسى%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('رمضان إبراهيم رمضان محمد', '363048', (SELECT id FROM users WHERE full_name LIKE '%جلال أبوعيسى%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('رضا محمد عبدالخير أبوالخير', '564025', (SELECT id FROM users WHERE full_name LIKE '%جلال أبوعيسى%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('رضا خلف عبدالحميد السيد', '684102', (SELECT id FROM users WHERE full_name LIKE '%جلال أبوعيسى%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('عاطف فانوس رزق بطرس', '724113', (SELECT id FROM users WHERE full_name LIKE '%جلال أبوعيسى%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('محمود علي احمد علي', '764121', (SELECT id FROM users WHERE full_name LIKE '%جلال أبوعيسى%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('عبدالرزاق علي حسن حسين', '867051', (SELECT id FROM users WHERE full_name LIKE '%جلال أبوعيسى%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('خالد محمد عبدالحميد مرسي', '8830023', (SELECT id FROM users WHERE full_name LIKE '%جلال أبوعيسى%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),

-- Ahmad Saeed Al-Rawajeh - Hanina Area
('خالد رمضان محمد إبراهيم', '3832', (SELECT id FROM users WHERE full_name LIKE '%أحمد سعيد الرواجح%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('خالد محمد إبراهيم علي أبوزيد', '221421', (SELECT id FROM users WHERE full_name LIKE '%أحمد سعيد الرواجح%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('محمد عبدالرزاق أبوزيد محمد علي', '313020', (SELECT id FROM users WHERE full_name LIKE '%أحمد سعيد الرواجح%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('احمد إبراهيم محمد إسماعيل', '353042', (SELECT id FROM users WHERE full_name LIKE '%أحمد سعيد الرواجح%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('احمد إبراهيم عبدالغني محمد', '373049', (SELECT id FROM users WHERE full_name LIKE '%أحمد سعيد الرواجح%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('محمد خالد محمد عبدالحميد', '814131', (SELECT id FROM users WHERE full_name LIKE '%أحمد سعيد الرواجح%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('أبوغنيمة السيد حسن محمد', '774123', (SELECT id FROM users WHERE full_name LIKE '%أحمد سعيد الرواجح%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('جمعه أبوغنيمه السيد جوليي', '879097', (SELECT id FROM users WHERE full_name LIKE '%أحمد سعيد الرواجح%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),

-- Municipality Administration - Messengers
('أشرف محمود إبراهيم محمد', '181068', (SELECT id FROM users WHERE full_name LIKE '%إدارة البلدية%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('عمرو عبدالفتاح الريدي فتح الباب', '514009', (SELECT id FROM users WHERE full_name LIKE '%إدارة البلدية%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('سيد علي إبراهيم عبدالعظيم', '524012', (SELECT id FROM users WHERE full_name LIKE '%إدارة البلدية%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),
('محمد احمد خالد احمد', '534013', (SELECT id FROM users WHERE full_name LIKE '%إدارة البلدية%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('علاء علي حسين مخلوف', '544015', (SELECT id FROM users WHERE full_name LIKE '%إدارة البلدية%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('احمد حسن توفيق حسن', '554017', (SELECT id FROM users WHERE full_name LIKE '%إدارة البلدية%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('محروس بشرى مرزوق يوسف', '654092', (SELECT id FROM users WHERE full_name LIKE '%إدارة البلدية%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('علاء حسن راشد عبدالله', '674101', (SELECT id FROM users WHERE full_name LIKE '%إدارة البلدية%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('إبراهيم يوسف السيد علي', '704110', (SELECT id FROM users WHERE full_name LIKE '%إدارة البلدية%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('رضا سيد عبدالهادي', '744118', (SELECT id FROM users WHERE full_name LIKE '%إدارة البلدية%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),

-- Operations/Works
('كامل احمد محمد أمين', '604038', (SELECT id FROM users WHERE full_name LIKE '%الأشغال%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('محمود رشيد محمود رشيد', '714111', (SELECT id FROM users WHERE full_name LIKE '%الأشغال%' AND role = 'supervisor' LIMIT 1), 9.00, 9.00),
('محروس جمعه احمد علي', '784124', (SELECT id FROM users WHERE full_name LIKE '%الأشغال%' AND role = 'supervisor' LIMIT 1), 8.25, 8.25),

-- Other Areas
('محمد عيد وزير أحمد', '644084', (SELECT id FROM users WHERE role = 'supervisor' LIMIT 1), 8.25, 8.25),
('محمود رضا السيد عبدالهادي', '855071', (SELECT id FROM users WHERE role = 'supervisor' LIMIT 1), 9.00, 9.00),
('أمين عبدالفتاح علي سيف', '9050553', (SELECT id FROM users WHERE role = 'supervisor' LIMIT 1), 9.00, 9.00);

-- Display success message
SELECT 'تم إضافة ' || COUNT(*) || ' عامل بنجاح!' as message FROM workers;
