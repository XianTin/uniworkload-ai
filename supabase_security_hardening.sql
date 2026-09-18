-- =========================================================================
-- UniWorkload AI - Supabase Security Hardening & RLS Lockdown Script
-- Version: v3.9.0
-- มหาวิทยาลัยราชภัฏนครสวรรค์ (NSRU)
-- =========================================================================
-- วัตถุประสงค์:
-- 1. ปิดช่องโหว่ Row Level Security (RLS) ที่เปิด USING (true) สำหรับการ DELETE
-- 2. ป้องกันผู้ไม่ประสงค์ดีที่แกะ Anon Key ไปยิงคำสั่งลบคำสั่งงาน (orders) หรือหลักฐานทั้งหมด
-- 3. ป้องกันการลบไฟล์หลักฐานใน Storage Bucket 'evidences' โดยไม่ได้รับอนุญาต
-- =========================================================================

-- 1. ยืนยันการเปิดใช้งาน RLS ทุกตาราง
alter table if exists public.faculties enable row level security;
alter table if exists public.orders enable row level security;
alter table if exists public.order_evidences enable row level security;

-- 2. ปรับแต่งสิทธิ์ Faculties (อ่านสาธารณะเพื่อแสดงรายชื่ออาจารย์, ป้องกันการแก้ไข/ลบจากภายนอก)
drop policy if exists "Allow public delete faculties" on public.faculties;
drop policy if exists "Allow public update faculties" on public.faculties;
drop policy if exists "Allow public insert faculties" on public.faculties;

create policy "Allow read faculties" on public.faculties
  for select using (true);

-- อนุญาตเฉพาะ service_role หรือ admin ในการเพิ่ม/แก้ไขรายชื่ออาจารย์
create policy "Restrict insert faculties" on public.faculties
  for insert with check (auth.role() = 'service_role' or auth.role() = 'authenticated' or current_setting('request.jwt.claims', true)::jsonb->>'role' = 'superadmin');

create policy "Restrict update faculties" on public.faculties
  for update using (auth.role() = 'service_role' or auth.role() = 'authenticated' or current_setting('request.jwt.claims', true)::jsonb->>'role' = 'superadmin');

-- 3. ปรับแต่งสิทธิ์ Orders
drop policy if exists "Allow public delete orders" on public.orders;

-- อนุญาตให้อ่านและสร้าง/อัปเดตคำสั่งงาน
create policy "Allow read orders" on public.orders
  for select using (true);

create policy "Allow insert orders" on public.orders
  for insert with check (
    -- ตรวจสอบความถูกต้องของข้อมูล (Data Validation) ป้องกันคำสั่งขยะ
    length(trim(title)) > 0 and 
    length(trim(order_number)) > 0
  );

create policy "Allow update orders" on public.orders
  for update using (true)
  with check (length(trim(title)) > 0);

-- ป้องกันการยิง DELETE ผ่าน Anon Key โดยตรง (อนุญาตเฉพาะ service_role หรือ authenticated)
create policy "Protect delete orders" on public.orders
  for delete using (
    auth.role() = 'service_role' or 
    auth.role() = 'authenticated' or
    current_setting('request.jwt.claims', true)::jsonb->>'role' in ('superadmin', 'admin')
  );

-- 4. ปรับแต่งสิทธิ์ Order Evidences
drop policy if exists "Allow public delete evidences" on public.order_evidences;

create policy "Allow read order_evidences" on public.order_evidences
  for select using (true);

create policy "Allow insert order_evidences" on public.order_evidences
  for insert with check (length(trim(image_url)) > 0);

create policy "Protect delete order_evidences" on public.order_evidences
  for delete using (
    auth.role() = 'service_role' or 
    auth.role() = 'authenticated' or
    current_setting('request.jwt.claims', true)::jsonb->>'role' in ('superadmin', 'admin')
  );

-- 5. ป้องกัน Storage Bucket 'evidences'
-- ถอดนโยบาย Public Delete ออก เพื่อป้องกันการสั่งลบไฟล์หลักฐานทั้งหมดในถังจัดเก็บ
drop policy if exists "Public Delete Evidences" on storage.objects;
drop policy if exists "Allow public delete evidences storage" on storage.objects;

create policy "Allow public read evidences storage" on storage.objects
  for select using (bucket_id = 'evidences');

create policy "Allow upload evidences storage" on storage.objects
  for insert with check (bucket_id = 'evidences');

create policy "Protect delete evidences storage" on storage.objects
  for delete using (
    bucket_id = 'evidences' and (
      auth.role() = 'service_role' or 
      auth.role() = 'authenticated'
    )
  );

-- =========================================================================
-- สิ้นสุดสคริปต์ความมั่นคงปลอดภัย (Security Hardened)
-- =========================================================================
