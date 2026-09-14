-- ==========================================
-- UniWorkload AI - Supabase PostgreSQL Schema (Clean & Reset)
-- ==========================================

-- 1. Enable UUID extension if needed
create extension if not exists "uuid-ossp";

-- 2. Drop existing tables if re-running (Clean slate)
drop table if exists public.order_evidences cascade;
drop table if exists public.orders cascade;
drop table if exists public.faculties cascade;

-- 3. Create faculties table (Matches supabaseClient.js)
create table public.faculties (
    id text primary key,
    name text not null,
    role text default 'อาจารย์ประจำสาขาวิชา',
    department text default 'สาขาวิชาสาธารณสุขศาสตร์',
    faculty text default 'คณะวิทยาศาสตร์และเทคโนโลยี',
    email text,
    avatar text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create orders table (Matches supabaseClient.js)
create table public.orders (
    id text primary key,
    faculty_id text references public.faculties(id) on delete set null,
    order_number text not null,
    title text not null,
    sign_date text,
    event_date text,
    event_time text,
    location text,
    category text default 'บริหาร/กรรมการ/ภารกิจมหาวิทยาลัย',
    status text default 'pending',
    role text default 'กรรมการ',
    workload_hours numeric(5,2) default 3,
    evidence_status text default 'none',
    doc_file_name text,
    raw_ocr_text text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create order_evidences table (Matches supabaseClient.js)
create table public.order_evidences (
    id text primary key,
    order_id text references public.orders(id) on delete cascade,
    faculty_id text references public.faculties(id) on delete set null,
    title text not null default 'ภาพถ่ายหลักฐานหน้างาน',
    image_url text not null,
    file_size text default '1.2 MB',
    description text,
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

drop policy if exists "Public Access Evidences" on storage.objects;
drop policy if exists "Public Upload Evidences" on storage.objects;
drop policy if exists "Public Delete Evidences" on storage.objects;

create policy "Public Access Evidences" on storage.objects for select using (bucket_id = 'evidences');
create policy "Public Upload Evidences" on storage.objects for insert with check (bucket_id = 'evidences');
create policy "Public Delete Evidences" on storage.objects for delete using (bucket_id = 'evidences');

-- 8. Seed Initial Data (ข้อมูลอาจารย์กลุ่มทดสอบ)
insert into public.faculties (id, name, role, department, faculty, email, avatar)
values
  ('fac-pimra', 'อ.พิมรา ทองแสง', 'อาจารย์ประจำสาขาวิชา', 'สาขาวิชาสาธารณสุขศาสตร์', 'คณะวิทยาศาสตร์และเทคโนโลยี', 'pimra.t@nsru.ac.th', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'),
  ('fac-kritsana', 'ผศ.ดร.กฤษณะ มีสุข', 'ผู้ช่วยศาสตราจารย์', 'สาขาวิชาวิทยาการคอมพิวเตอร์', 'คณะวิทยาศาสตร์และเทคโนโลยี', 'kritsana.m@nsru.ac.th', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
  ('fac-theerapat', 'อ.ธีรภัทร วัฒนศิลป์', 'อาจารย์ประจำสาขาวิชา', 'สาขาวิชานวัตกรรมดิจิทัล', 'คณะวิทยาศาสตร์และเทคโนโลยี', 'theerapat.w@nsru.ac.th', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80')
on conflict (id) do nothing;

-- 9. Seed Initial Orders (ภาระงานจริง อ.พิมรา จาก ป.5)
insert into public.orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status)
values
  ('ord-1', 'fac-pimra', 'คก. 1042/2569', 'กรรมการตัดสินการประกวดแข่งขันส้มตำลีลา งานเกษตรแฟร์ นครสวรรค์', '2569-08-15', '2569-08-20', '09:00 - 16:30 น.', 'ลานกิจกรรม มรภ.นครสวรรค์', 'บริการวิชาการแก่สังคม (กพอ.3)', 'completed', 'กรรมการตัดสิน', 1.00, 'ready'),
  ('ord-2', 'fac-pimra', 'มรภ.นว. 0895/2569', 'วิทยากรอบรมเชิงปฏิบัติการพัฒนาภาวะโภชนาการในเด็กปฐมวัย', '2569-08-28', '2569-09-02', '08:30 - 16:30 น.', 'ห้องประชุม รพ.สต.บางม่วง อ.เมือง', 'บริการวิชาการแก่สังคม (กพอ.3)', 'completed', 'วิทยากร', 1.00, 'ready'),
  ('ord-3', 'fac-pimra', 'คก. 1299/2569', 'คณะกรรมการตรวจรับและประเมินผลสัมฤทธิ์โครงการบริการวิชาการประจำปีงบประมาณ 2569', '2569-09-10', '2569-09-18', '09:00 - 12:00 น.', 'ห้องประชุม 14102 ชั้น 4', 'บริหาร/กรรมการ/ภารกิจมหาวิทยาลัย (กพอ.5)', 'pending', 'กรรมการตรวจรับ', 0.50, 'none'),
  ('ord-4', 'fac-pimra', 'มรภ.นว. 0152/2567', 'กรรมการผู้ทรงคุณวุฒิประเมินโครงการวิจัยในชั้นเรียน คณะวิทยาศาสตร์และเทคโนโลยี', '2567-02-10', '2567-02-15', '13:00 - 16:30 น.', 'ห้องประชุม 2201 ชั้น 2', 'งานวิจัยและงานสร้างสรรค์ (กพอ.2)', 'completed', 'กรรมการประเมิน', 1.00, 'ready'),
  ('ord-5', 'fac-pimra', 'มรภ.นว. 0341/2567', 'วิทยากรบรรยายสุขาภิบาลอาหารและสิ่งแวดล้อมแก่ผู้ประกอบการร้านค้าชุมชน', '2567-05-18', '2567-05-22', '09:00 - 15:00 น.', 'ศาลาประชาคม อ.พยุหะคีรี', 'บริการวิชาการแก่สังคม (กพอ.3)', 'completed', 'วิทยากร', 1.00, 'ready')
on conflict (id) do nothing;
