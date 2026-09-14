-- ==========================================
-- UniWorkload AI - Supabase PostgreSQL Schema (Clean & Reset)
-- ==========================================

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Drop existing tables if re-running (Clean slate)
drop table if exists public.order_evidences cascade;
drop table if exists public.orders cascade;
drop table if exists public.faculties cascade;

-- 3. Create faculties table
create table public.faculties (
    id text primary key,
    name text not null,
    title text,
    department text,
    email text,
    avatar text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create orders table
create table public.orders (
    id text primary key,
    order_number text not null,
    title text not null,
    issue_date text,
    event_date text,
    event_time text,
    location text,
    category_id text,
    status text default 'pending',
    assigned_to text references public.faculties(id) on delete set null,
    workload_points numeric(5,2) default 0,
    academic_year text default '2569',
    term text default '2',
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create order_evidences table (photos & documents)
create table public.order_evidences (
    id text primary key,
    order_id text references public.orders(id) on delete cascade,
    file_name text not null,
    file_url text not null,
    file_type text,
    file_size integer,
    caption text,
    uploaded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Enable Row Level Security (RLS) & Allow public read/write for pilot phase
alter table public.faculties enable row level security;
alter table public.orders enable row level security;
alter table public.order_evidences enable row level security;

create policy "Allow public read faculties" on public.faculties for select using (true);
create policy "Allow public insert faculties" on public.faculties for insert with check (true);
create policy "Allow public update faculties" on public.faculties for update using (true);

create policy "Allow public read orders" on public.orders for select using (true);
create policy "Allow public insert orders" on public.orders for insert with check (true);
create policy "Allow public update orders" on public.orders for update using (true);
create policy "Allow public delete orders" on public.orders for delete using (true);

create policy "Allow public read evidences" on public.order_evidences for select using (true);
create policy "Allow public insert evidences" on public.order_evidences for insert with check (true);
create policy "Allow public delete evidences" on public.order_evidences for delete using (true);

-- 7. Setup Cloud Storage Bucket for Evidences
insert into storage.buckets (id, name, public)
values ('evidences', 'evidences', true)
on conflict (id) do nothing;

create policy "Public Access Evidences" on storage.objects for select using (bucket_id = 'evidences');
create policy "Public Upload Evidences" on storage.objects for insert with check (bucket_id = 'evidences');
create policy "Public Delete Evidences" on storage.objects for delete using (bucket_id = 'evidences');

-- 8. Seed Initial Data (ข้อมูลอาจารย์กลุ่มทดสอบ)
insert into public.faculties (id, name, title, department, email, avatar)
values
  ('fac-pimra', 'อ.พิมรา ทองแสง', 'อาจารย์ประจำสาขาวิชา', 'สาขาวิชาสาธารณสุขศาสตร์', 'pimra.t@nsru.ac.th', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'),
  ('fac-kritsana', 'ผศ.ดร.กฤษณะ มีสุข', 'ผู้ช่วยศาสตราจารย์', 'สาขาวิชาวิทยาการคอมพิวเตอร์', 'kritsana.m@nsru.ac.th', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
  ('fac-theerapat', 'อ.ธีรภัทร วัฒนศิลป์', 'อาจารย์ประจำสาขาวิชา', 'สาขาวิชานวัตกรรมดิจิทัล', 'theerapat.w@nsru.ac.th', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80');

-- 9. Seed Initial Orders (ภาระงานจริง อ.พิมรา จาก ป.5)
insert into public.orders (id, order_number, title, issue_date, event_date, event_time, location, category_id, status, assigned_to, workload_points, academic_year, term, notes)
values
  ('ord-1', 'คก. 1042/2569', 'กรรมการตัดสินการประกวดแข่งขันส้มตำลีลา งานเกษตรแฟร์ นครสวรรค์', '2569-08-15', '2569-08-20', '09:00 - 16:30 น.', 'ลานกิจกรรม มรภ.นครสวรรค์', 'cat-academic-service', 'completed', 'fac-pimra', 1.00, '2569', '2', 'บริการวิชาการ กิจกรรมระดับจังหวัด'),
  ('ord-2', 'มรภ.นว. 0895/2569', 'วิทยากรอบรมเชิงปฏิบัติการพัฒนาภาวะโภชนาการในเด็กปฐมวัย', '2569-08-28', '2569-09-02', '08:30 - 16:30 น.', 'ห้องประชุม รพ.สต.บางม่วง อ.เมือง', 'cat-academic-service', 'completed', 'fac-pimra', 1.00, '2569', '2', 'วิทยากรภายนอกสถาบัน'),
  ('ord-3', 'คก. 1299/2569', 'คณะกรรมการตรวจรับและประเมินผลสัมฤทธิ์โครงการบริการวิชาการประจำปีงบประมาณ 2569', '2569-09-10', '2569-09-18', '09:00 - 12:00 น.', 'ห้องประชุม 14102 ชั้น 4', 'cat-admin-task', 'pending', 'fac-pimra', 0.50, '2569', '2', 'ภารกิจบริหารมหาวิทยาลัย'),
  ('ord-4', 'มรภ.นว. 0152/2567', 'กรรมการผู้ทรงคุณวุฒิประเมินโครงการวิจัยในชั้นเรียน คณะวิทยาศาสตร์และเทคโนโลยี', '2567-02-10', '2567-02-15', '13:00 - 16:30 น.', 'ห้องประชุม 2201 ชั้น 2', 'cat-research', 'completed', 'fac-pimra', 1.00, '2567', '2', 'งานวิจัยและนวัตกรรม'),
  ('ord-5', 'มรภ.นว. 0341/2567', 'วิทยากรบรรยายสุขาภิบาลอาหารและสิ่งแวดล้อมแก่ผู้ประกอบการร้านค้าชุมชน', '2567-05-18', '2567-05-22', '09:00 - 15:00 น.', 'ศาลาประชาคม อ.พยุหะคีรี', 'cat-academic-service', 'completed', 'fac-pimra', 1.00, '2567', '2', 'บริการวิชาการระดับอำเภอ');
