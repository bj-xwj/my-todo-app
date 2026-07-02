-- 员工考勤管理系统数据库SQL (PostgreSQL/Supabase)
-- 创建时间: 2026-06-22

-- ============================================
-- 1. 启用扩展
-- ============================================
extension if not exists "uuid-ossp";

-- ============================================
-- 2. 自定义类型 (枚举)
-- ============================================
create type user_role as enum ('admin', 'manager', 'employee');
create type leave_type as enum ('sick', 'annual', 'personal', 'maternity', 'paternity', 'other');
create type request_status as enum ('pending', 'approved', 'rejected');
create type attendance_status as enum ('normal', 'late', 'early_leave', 'absent', 'on_leave', 'field_work');
create type overtime_type as enum ('weekday', 'weekend', 'holiday');

-- ============================================
-- 3. 员工信息表 (profiles)
-- ============================================
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    employee_no varchar(20) unique not null,
    email varchar(255) not null,
    full_name varchar(100),
    role user_role default 'employee',
    department varchar(100),
    position varchar(100),
    phone varchar(20),
    avatar_url text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

comment on table public.profiles is '员工信息表';
comment on column public.profiles.id is '关联auth.users的UUID';
comment on column public.profiles.employee_no is '员工工号';
comment on column public.profiles.role is '角色：admin管理员, manager部门主管, employee普通员工';

-- ============================================
-- 4. 班次配置表 (shift_config)
-- ============================================
create table if not exists public.shift_config (
    id uuid primary key default uuid_generate_v4(),
    name varchar(50) not null,
    work_start_time time not null,
    work_end_time time not null,
    break_start_time time,
    break_end_time time,
    grace_minutes int default 15,
    is_default boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

comment on table public.shift_config is '班次配置表';

-- ============================================
-- 5. 考勤记录表 (attendance_records)
-- ============================================
create table if not exists public.attendance_records (
    id uuid primary key default uuid_generate_v4(),
    employee_id uuid not null references public.profiles(id) on delete cascade,
    record_date date not null,
    shift_id uuid references public.shift_config(id),
    check_in timestamptz,
    check_out timestamptz,
    check_in_location jsonb,
    check_out_location jsonb,
    work_hours numeric(4,2) default 0,
    overtime_hours numeric(4,2) default 0,
    status attendance_status default 'normal',
    late_minutes int default 0,
    early_minutes int default 0,
    note text,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    constraint unique_employee_date unique (employee_id, record_date)
);

comment on table public.attendance_records is '考勤记录表';
comment on column public.attendance_records.work_hours is '工作时长（小时）';
comment on column public.attendance_records.late_minutes is '迟到分钟数';

-- ============================================
-- 6. 请假申请表 (leave_requests)
-- ============================================
create table if not exists public.leave_requests (
    id uuid primary key default uuid_generate_v4(),
    employee_id uuid not null references public.profiles(id) on delete cascade,
    leave_type leave_type not null,
    start_date date not null,
    end_date date not null,
    days numeric(4,1) not null,
    reason text not null,
    status request_status default 'pending',
    approver_id uuid references public.profiles(id),
    approved_at timestamptz,
    reject_reason text,
    attachment_url text,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    constraint check_end_after_start check (end_date >= start_date)
);

comment on table public.leave_requests is '请假申请表';
comment on column public.leave_requests.days is '请假天数（支持0.5天）';

-- ============================================
-- 7. 加班申请表 (overtime_requests)
-- ============================================
create table if not exists public.overtime_requests (
    id uuid primary key default uuid_generate_v4(),
    employee_id uuid not null references public.profiles(id) on delete cascade,
    overtime_date date not null,
    overtime_type overtime_type default 'weekday',
    start_time timestamptz not null,
    end_time timestamptz not null,
    hours numeric(4,2) not null,
    reason text not null,
    status request_status default 'pending',
    approver_id uuid references public.profiles(id),
    approved_at timestamptz,
    reject_reason text,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    constraint check_overtime_end_after_start check (end_time > start_time)
);

comment on table public.overtime_requests is '加班申请表';

-- ============================================
-- 8. 考勤补正申请表 (attendance_corrections)
-- ============================================
create table if not exists public.attendance_corrections (
    id uuid primary key default uuid_generate_v4(),
    employee_id uuid not null references public.profiles(id) on delete cascade,
    attendance_record_id uuid references public.attendance_records(id) on delete set null,
    correction_date date not null,
    original_check_in timestamptz,
    original_check_out timestamptz,
    corrected_check_in timestamptz,
    corrected_check_out timestamptz,
    reason text not null,
    status request_status default 'pending',
    approver_id uuid references public.profiles(id),
    approved_at timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

comment on table public.attendance_corrections is '考勤补正申请表';

-- ============================================
-- 9. 节假日配置表 (holidays)
-- ============================================
create table if not exists public.holidays (
    id uuid primary key default uuid_generate_v4(),
    name varchar(100) not null,
    holiday_date date not null,
    type varchar(20) default 'national', -- national, company, workday
    created_at timestamptz default now(),
    constraint unique_holiday_date unique (holiday_date)
);

comment on table public.holidays is '节假日配置表';

-- ============================================
-- 10. 系统配置表 (system_settings)
-- ============================================
create table if not exists public.system_settings (
    id uuid primary key default uuid_generate_v4(),
    config_key varchar(100) unique not null,
    config_value text,
    description text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

comment on table public.system_settings is '系统配置表';

-- ============================================
-- 11. 创建索引 (优化查询性能)
-- ============================================

-- profiles 索引
create index idx_profiles_role on public.profiles(role);
create index idx_profiles_department on public.profiles(department);
create index idx_profiles_employee_no on public.profiles(employee_no);

-- attendance_records 索引
create index idx_attendance_employee_id on public.attendance_records(employee_id);
create index idx_attendance_record_date on public.attendance_records(record_date);
create index idx_attendance_employee_date on public.attendance_records(employee_id, record_date);
create index idx_attendance_status on public.attendance_records(status);

-- leave_requests 索引
create index idx_leave_employee_id on public.leave_requests(employee_id);
create index idx_leave_status on public.leave_requests(status);
create index idx_leave_dates on public.leave_requests(start_date, end_date);

-- overtime_requests 索引
create index idx_overtime_employee_id on public.overtime_requests(employee_id);
create index idx_overtime_status on public.overtime_requests(status);
create index idx_overtime_date on public.overtime_requests(overtime_date);

-- attendance_corrections 索引
create index idx_correction_employee_id on public.attendance_corrections(employee_id);
create index idx_correction_status on public.attendance_corrections(status);

-- ============================================
-- 12. 自动更新 updated_at 触发器
-- ============================================
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
    before update on public.profiles
    for each row execute function public.update_updated_at_column();

create trigger update_shift_config_updated_at
    before update on public.shift_config
    for each row execute function public.update_updated_at_column();

create trigger update_attendance_records_updated_at
    before update on public.attendance_records
    for each row execute function public.update_updated_at_column();

create trigger update_leave_requests_updated_at
    before update on public.leave_requests
    for each row execute function public.update_updated_at_column();

create trigger update_overtime_requests_updated_at
    before update on public.overtime_requests
    for each row execute function public.update_updated_at_column();

create trigger update_attendance_corrections_updated_at
    before update on public.attendance_corrections
    for each row execute function public.update_updated_at_column();

create trigger update_system_settings_updated_at
    before update on public.system_settings
    for each row execute function public.update_updated_at_column();

-- ============================================
-- 13. 自动创建考勤记录触发器
-- ============================================
-- 当员工注册时，自动为当天创建考勤记录（可选）
create or replace function public.create_daily_attendance()
returns trigger as $$
begin
    insert into public.attendance_records (employee_id, record_date, status)
    values (new.id, current_date, 'normal')
    on conflict (employee_id, record_date) do nothing;
    return new;
end;
$$ language plpgsql;

-- ============================================
-- 14. RLS 行级安全策略 (Supabase核心)
-- ============================================

-- 14.1 profiles 表 RLS
alter table public.profiles enable row level security;

create policy "profiles_select_own"
    on public.profiles for select
    using (auth.uid() = id);

create policy "profiles_select_admin"
    on public.profiles for select
    using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role = 'admin'
        )
    );

create policy "profiles_update_own"
    on public.profiles for update
    using (auth.uid() = id)
    with check (auth.uid() = id);

create policy "profiles_update_admin"
    on public.profiles for update
    using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role = 'admin'
        )
    );

create policy "profiles_insert_admin"
    on public.profiles for insert
    with check (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role = 'admin'
        )
    );

-- 14.2 attendance_records 表 RLS
alter table public.attendance_records enable row level security;

create policy "attendance_select_own"
    on public.attendance_records for select
    using (employee_id = auth.uid());

create policy "attendance_select_manager"
    on public.attendance_records for select
    using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role in ('admin', 'manager')
        )
    );

create policy "attendance_insert_any"
    on public.attendance_records for insert
    with check (employee_id = auth.uid());

create policy "attendance_update_admin"
    on public.attendance_records for update
    using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role = 'admin'
        )
    );

-- 14.3 leave_requests 表 RLS
alter table public.leave_requests enable row level security;

create policy "leave_select_own"
    on public.leave_requests for select
    using (employee_id = auth.uid());

create policy "leave_select_approver"
    on public.leave_requests for select
    using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role in ('admin', 'manager')
        )
    );

create policy "leave_insert_own"
    on public.leave_requests for insert
    with check (employee_id = auth.uid());

create policy "leave_update_approver"
    on public.leave_requests for update
    using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role in ('admin', 'manager')
        )
    );

-- 14.4 overtime_requests 表 RLS
alter table public.overtime_requests enable row level security;

create policy "overtime_select_own"
    on public.overtime_requests for select
    using (employee_id = auth.uid());

create policy "overtime_select_approver"
    on public.overtime_requests for select
    using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role in ('admin', 'manager')
        )
    );

create policy "overtime_insert_own"
    on public.overtime_requests for insert
    with check (employee_id = auth.uid());

create policy "overtime_update_approver"
    on public.overtime_requests for update
    using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role in ('admin', 'manager')
        )
    );

-- 14.5 attendance_corrections 表 RLS
alter table public.attendance_corrections enable row level security;

create policy "correction_select_own"
    on public.attendance_corrections for select
    using (employee_id = auth.uid());

create policy "correction_select_approver"
    on public.attendance_corrections for select
    using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role in ('admin', 'manager')
        )
    );

create policy "correction_insert_own"
    on public.attendance_corrections for insert
    with check (employee_id = auth.uid());

create policy "correction_update_approver"
    on public.attendance_corrections for update
    using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role in ('admin', 'manager')
        )
    );

-- 14.6 shift_config 表 (全员可读，仅管理员可写)
alter table public.shift_config enable row level security;

create policy "shift_select_all"
    on public.shift_config for select
    to authenticated
    using (true);

create policy "shift_modify_admin"
    on public.shift_config for all
    using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role = 'admin'
        )
    );

-- 14.7 holidays 表 (全员可读，仅管理员可写)
alter table public.holidays enable row level security;

create policy "holiday_select_all"
    on public.holidays for select
    to authenticated
    using (true);

create policy "holiday_modify_admin"
    on public.holidays for all
    using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role = 'admin'
        )
    );

-- 14.8 system_settings 表 (仅管理员)
alter table public.system_settings enable row level security;

create policy "settings_select_all"
    on public.system_settings for select
    to authenticated
    using (true);

create policy "settings_modify_admin"
    on public.system_settings for all
    using (
        exists (
            select 1 from public.profiles
            where id = auth.uid() and role = 'admin'
        )
    );

-- ============================================
-- 15. 视图：考勤统计
-- ============================================
create or replace view public.attendance_monthly_summary as
select
    employee_id,
    date_trunc('month', record_date) as month,
    count(*) as total_days,
    count(*) filter (where status = 'normal') as normal_days,
    count(*) filter (where status = 'late') as late_days,
    count(*) filter (where status = 'early_leave') as early_leave_days,
    count(*) filter (where status = 'absent') as absent_days,
    count(*) filter (where status = 'on_leave') as leave_days,
    sum(work_hours) as total_work_hours,
    sum(overtime_hours) as total_overtime_hours,
    sum(late_minutes) as total_late_minutes
from public.attendance_records
group by employee_id, date_trunc('month', record_date);

-- ============================================
-- 16. 初始数据
-- ============================================

-- 默认班次配置
insert into public.shift_config (name, work_start_time, work_end_time, break_start_time, break_end_time, grace_minutes, is_default)
values 
    ('标准班次', '09:00:00', '18:00:00', '12:00:00', '13:00:00', 15, true),
    ('弹性班次', '08:00:00', '17:00:00', '12:00:00', '13:00:00', 15, false),
    ('晚班', '14:00:00', '22:00:00', '17:00:00', '18:00:00', 15, false)
on conflict do nothing;

-- 系统默认配置
insert into public.system_settings (config_key, config_value, description)
values
    ('company_name', 'XX科技有限公司', '公司名称'),
    ('work_week_days', '1,2,3,4,5', '工作日 (1=周一)'),
    ('max_late_times', '3', '每月最大迟到次数'),
    ('enable_gps_check', 'true', '是否启用GPS打卡校验')
on conflict (config_key) do nothing;

-- ============================================
-- 17. 存储过程：生成月度考勤记录
-- ============================================
create or replace function public.generate_monthly_attendance(
    p_year int,
    p_month int,
    p_employee_id uuid default null
)
returns int as $$
declare
    v_date date;
    v_end_date date;
    v_count int := 0;
    v_employee record;
begin
    v_date := make_date(p_year, p_month, 1);
    v_end_date := (v_date + interval '1 month' - interval '1 day')::date;
    
    for v_employee in 
        select id from public.profiles 
        where p_employee_id is null or id = p_employee_id
    loop
        while v_date <= v_end_date loop
            insert into public.attendance_records (employee_id, record_date, status)
            values (v_employee.id, v_date, 'normal')
            on conflict (employee_id, record_date) do nothing;
            
            v_date := v_date + 1;
            v_count := v_count + 1;
        end loop;
        v_date := make_date(p_year, p_month, 1);
    end loop;
    
    return v_count;
end;
$$ language plpgsql;

-- ============================================
-- 使用说明
-- ============================================
-- 1. 在 Supabase SQL Editor 中按顺序执行上述SQL
-- 2. 确保已开启 Email/Password 认证
-- 3. 注册用户后，需手动插入 profiles 表或在触发器中自动创建
-- 4. 管理员需手动设置 role = 'admin'
-- 5. 使用 generate_monthly_attendance(2024, 6) 生成某月空考勤记录
-- ============================================
