-- Create February 2025 Reports - Fixed Version
-- إنشاء تقارير شهر فبراير 2025 - النسخة المحدثة

-- Insert monthly reports for February 2025
INSERT INTO public.monthly_reports (worker_id, month, year, regular_days, friday_days, holiday_days, overtime_hours, total_salary)
SELECT 
    w.id as worker_id,
    2 as month,
    2025 as year,
    28 as regular_days, -- Standard working days in February
    4 as friday_days,   -- 4 Fridays in February 2025
    0 as holiday_days,  -- No holidays in the data
    -- Overtime hours based on employee data
    CASE 
        WHEN w.employee_id IN ('4833', '393055', '151023', '211357', '494004', '544015', '654092', '704110') THEN 10
        WHEN w.employee_id IN ('231440', '283017', '343039', '433073', '754119', '794128', '614077') THEN 14
        WHEN w.employee_id IN ('9910', '273011', '564025', '684102') THEN 2
        ELSE 4
    END as overtime_hours,
    -- Calculate total salary
    (28 * w.daily_wage) + -- Regular days
    (4 * w.daily_wage * 1.5) + -- Friday premium (1.5x)
    (CASE 
        WHEN w.employee_id IN ('4833', '393055', '151023', '211357', '494004', '544015', '654092', '704110') THEN 10
        WHEN w.employee_id IN ('231440', '283017', '343039', '433073', '754119', '794128', '614077') THEN 14
        WHEN w.employee_id IN ('9910', '273011', '564025', '684102') THEN 2
        ELSE 4
    END * w.overtime_rate) as total_salary
FROM workers w
WHERE w.employee_id IN (
    '1820', '2828', '3832', '4833', '5855', '6856', '7861', '8899', '9910', '9921', 
    '11923', '12930', '13946', '14999', '151023', '161045', '171050', '181068', 
    '191298', '201311', '211357', '221421', '231440', '243004', '253006', '263009', 
    '273011', '283017', '293018', '303019', '313020', '323022', '333026', '343039', 
    '353042', '363048', '373049', '383052', '393055', '403057', '413059', '423066', 
    '433073', '443080', '453082', '473085', '483089', '494004', '504006', '514009', 
    '524012', '534013', '544015', '554017', '564025', '574026', '584033', '594036', 
    '604038', '614077', '624078', '634081', '644084', '654092', '664093', '674101', 
    '684102', '694106', '704110', '714111', '724113', '734116', '744118', '754119', 
    '764121', '774123', '784124', '794128', '804129', '814131', '824134', '834138', 
    '845057', '855071', '867051', '879097', '8830023', '8950507', '9050553'
)
ON CONFLICT (worker_id, month, year) DO NOTHING;

-- Display success message and summary
SELECT 'تم إنشاء ' || COUNT(*) || ' تقرير شهري لشهر فبراير 2025!' as message 
FROM monthly_reports 
WHERE month = 2 AND year = 2025;

-- Show summary statistics
SELECT 
    'إحصائيات التقارير:' as summary,
    COUNT(*) as total_reports,
    SUM(total_salary) as total_salaries,
    AVG(total_salary) as average_salary,
    SUM(regular_days) as total_regular_days,
    SUM(overtime_hours) as total_overtime_hours
FROM monthly_reports 
WHERE month = 2 AND year = 2025;
