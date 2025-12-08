-- 查看员工账户信息
USE bank_management;

-- 显示所有员工的邮箱（用于登录）
SELECT 
    employee_id,
    first_name,
    last_name,
    email,
    position,
    branch_id
FROM employee
ORDER BY employee_id
LIMIT 20;

