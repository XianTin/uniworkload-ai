DROP TABLE IF EXISTS order_evidences CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS faculties CASCADE;

-- ==========================================
-- UniWorkload AI - Supabase PostgreSQL Schema
-- ==========================================

-- 1. Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Faculties Table
CREATE TABLE IF NOT EXISTS faculties (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    department TEXT,
    faculty TEXT,
    email TEXT,
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    faculty_id TEXT REFERENCES faculties(id) ON DELETE SET NULL,
    order_number TEXT NOT NULL,
    title TEXT NOT NULL,
    sign_date TEXT,
    event_date TEXT,
    event_time TEXT,
    location TEXT,
    category TEXT,
    status TEXT DEFAULT 'pending',
    role TEXT,
    workload_hours NUMERIC DEFAULT 0,
    evidence_status TEXT DEFAULT 'none',
    doc_file_name TEXT,
    raw_ocr_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Order Evidences Table
CREATE TABLE IF NOT EXISTS order_evidences (
    id TEXT PRIMARY KEY,
    order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
    faculty_id TEXT REFERENCES faculties(id) ON DELETE SET NULL,
    title TEXT,
    image_url TEXT NOT NULL,
    file_size TEXT,
    description TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Storage Bucket for Evidences
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidences', 'evidences', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 6. Disable or configure RLS for public pilot access
ALTER TABLE faculties ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_evidences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access to faculties" ON faculties;
CREATE POLICY "Public access to faculties" ON faculties FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to orders" ON orders;
CREATE POLICY "Public access to orders" ON orders FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to order_evidences" ON order_evidences;
CREATE POLICY "Public access to order_evidences" ON order_evidences FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access to storage evidences" ON storage.objects;
CREATE POLICY "Public access to storage evidences" ON storage.objects FOR ALL USING (bucket_id = 'evidences') WITH CHECK (bucket_id = 'evidences');

-- ==========================================
-- SEED DATA: Faculties
-- ==========================================
INSERT INTO faculties (id, name, role, department, faculty, email, avatar)
VALUES ('fac-pimra', 'อ.พิมรา ทองแสง', 'อาจารย์ / รองผู้อำนวยการ', 'สาขาวิชาสาธารณสุขศาสตร์', 'คณะวิทยาศาสตร์และเทคโนโลยี', 'pimra.t@nsru.ac.th', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, department = EXCLUDED.department;
INSERT INTO faculties (id, name, role, department, faculty, email, avatar)
VALUES ('fac-1', 'อ.ธนภัทร สุขเกษม (tie)', 'อาจารย์ประจำหลักสูตรเทคโนโลยีสารสนเทศ', 'สาขาวิชาเทคโนโลยีสารสนเทศ', 'คณะวิทยาการจัดการ', 'thanaphat.s@nsru.ac.th', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, department = EXCLUDED.department;
INSERT INTO faculties (id, name, role, department, faculty, email, avatar)
VALUES ('fac-2', 'ผศ.ดร.สมชาย ใจดี', 'หัวหน้าสาขาวิชาเทคโนโลยีสารสนเทศ', 'สาขาวิชาเทคโนโลยีสารสนเทศ', 'คณะวิทยาการจัดการ', 'somchai.j@nsru.ac.th', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, department = EXCLUDED.department;

-- ==========================================
-- SEED DATA: Orders & Evidences
-- ==========================================
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-1042', 'fac-1', 'คก. 1042/2569', 'แต่งตั้งคณะกรรมการจัดโครงการสัมมนาเชิงปฏิบัติการ นวัตกรรม AI เพื่อธุรกิจดิจิทัล 2026', '2026-08-15', '2026-09-18', '08:30 - 16:30 น.', 'ห้องประชุม 14102 ชั้น 4 อาคารวิทยาการจัดการ มหาวิทยาลัยราชภัฏนครสวรรค์', 'บริการวิชาการแก่สังคม', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-0895', 'fac-1', 'มรภ.นว. 0895/2569', 'แต่งตั้งคณะกรรมการตรวจประเมินคุณภาพการศึกษาภายใน ประจำปีการศึกษา 2568', '2026-07-20', '2026-09-25', '09:00 - 16:30 น.', 'ห้องประชุมพระบาง อาคาร 14 ชั้น 2 มหาวิทยาลัยราชภัฏนครสวรรค์', 'ประกันคุณภาพการศึกษา', 'upcoming', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-001', 'fac-pimra', 'มรภ.นว. 1001/2569', 'เข้าร่วมพิธีมอบรางวัลผู้ชนะการประกวดตั้งโต๊ะรับเจ้า วันชิวสี่ ในงานประเพณีแห่เจ้าพ่อ-เจ้าแม่ปากน้ำโพ ประจำปี 2569 วัน...', '2026-08-06', '2026-08-06', '08:30 - 16:30 น.', 'ณีแห่เจ้าพ่อ-เจ้าแม่ปากน้ำโพ ประจำปี 2569 วันที่ 6 สิงหาคม 2569 ณ ภัตราคารเล่งหงษ์ อ', 'บริหาร/กรรมการ/ภารกิจมหาวิทยาลัย', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-002', 'fac-pimra', 'มรภ.นว. 1002/2569', 'ผู้รับผิดชอบโครการพัฒนาบัณฑิตให้มีสมรรถนะรองรับ การทํางานในอนาคต (ด้านวิทยาศาสตร์สุขภาพ) กิจกรรมอบรมเชิงปฏิบัติการจัด...', '2026-08-01', '2026-08-01', '08:30 - 16:30 น.', 'ณฑิตให้มีสมรรถนะรองรับ การทํางานในอนาคต (ด้านวิทยาศาสตร์สุขภาพ) กิจกรรมอบรมเชิงปฏิบัติการจัดทําโครงการเพื่อแก้ไขปัญหาสุขภาพในชุมชน เพื่อเป็นการสร้างความรู้ความเข้าใจในการวิเคราะห์ปัญหาสุขภาพโดยใช้ข้อมูลเชิงประจักษ์อย่าง เป็นระบบ และเป็นการสร้างทักษะการ วิเคราะห์ปัญหาสุขภาพโดยใช้ข้อมูลเชิงประจักษ์อย่างเป็นระบบ วันพุธ ที่ 5 สิงหาคม 2569 ณ ห้อง 14401 อาคาร 14 ชั้น 4 มหาวิทยาลัยราชภัฏนครสวรรค์', 'การจัดการเรียนการสอน', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-003', 'fac-pimra', 'มรภ.นว. 1003/2569', 'เข้าร่วมพิธีเปิดนิทรรศการแสดงผลงาน และพิธีมอบรางวัลโครงการดีเด่น ภายใต้โครงการพัฒนาศูนย์ยกระดับคุณภาพชุมชนและการศึกษา...', '2026-08-01', '2026-08-01', '08:30 - 16:30 น.', 'ณภาพชุมชนและการศึกษา ประจำปีงบประมาณ พ', 'บริหาร/กรรมการ/ภารกิจมหาวิทยาลัย', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-004', 'fac-pimra', 'มรภ.นว. 1004/2569', 'เข้าร่วมงาน "NSRU BCG Fair: ช้อปของดี ชมวิถีถิ่น เที่ยวฟินสองเมือง" การประกวดร้องเพลงไทยลูกทุ่ง มหาวิทยาลัยราชภัฏนครส...', '2026-08-04', '2026-08-04', '08:30 - 16:30 น.', 'ณ ลานกิจกรรม เซนทรัล จัดโดย คณะมนุษยศาสตร์และสังคมศาสตร์ มหาวิทยาลัยราชภัฏนครสวรรค์ 0', 'ทำนุบำรุงศิลปวัฒนธรรม', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-006', 'fac-pimra', 'มรภ.นว. 1006/2569', 'ผู้รับผิดชอบโครงการพัฒนาบัณฑิตให้มีสมรรถนะรองรับการทำงานในอนาคต (ด้านวิทยาศาสตร์สุขภาพ) กิจกรรมอบรมเชิงปฏิบัติการเสริ...', '2026-08-01', '2026-08-01', '08:30 - 16:30 น.', 'ณฑิตให้มีสมรรถนะรองรับการทำงานในอนาคต (ด้านวิทยาศาสตร์สุขภาพ) กิจกรรมอบรมเชิงปฏิบัติการเสริมสร้างทักษะการช่วยฟื้นคืนชีพขั้นต้นสำหรับนักศึกษาหลักสูตรสาธารณสุขศาสตรบัณฑิต', 'การจัดการเรียนการสอน', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-007', 'fac-pimra', 'มรภ.นว. 1007/2569', 'เข้าร่วมการอบรมเชิงปฏิบัติการทำเค้กชาไทยไข่ทองคำ จัดโดยสาขาวิชาคหกรรมศาสตร์ วันพุธที่ 8 กรกฎาคม 2569 ณ ห้อง 613 อาคาร...', '2026-08-01', '2026-08-01', '08:30 - 16:30 น.', 'ณ ห้อง 613 อาคาร 6 มหาวิทยาลัยราชภัฏนครสวรรค์', 'ทำนุบำรุงศิลปวัฒนธรรม', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-008', 'fac-pimra', 'มรภ.นว. 1008/2569', 'ผู้รับผิดชอบโครงการเตรียมความพร้อม และพัฒนาคุณธรรมจริยธรรม ตามจรรยาบรรณและมาตรฐานวิชาชีพการสาธารณสุขชุมชน (ในรูปแบบออ...', '2026-08-01', '2026-08-01', '08:30 - 16:30 น.', 'ณธรรมจริยธรรม ตามจรรยาบรรณและมาตรฐานวิชาชีพการสาธารณสุขชุมชน (ในรูปแบบออนไลน์) สำหรับนักศึกษาหลักสูตรสาธารณสุขศาสตรบัณฑิต ชั้นปีที่ 1 ปีการศึกษา 2569', 'การจัดการเรียนการสอน', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-009', 'fac-pimra', 'มรภ.นว. 1009/2569', 'ผู้รับผิดชอบโครงการพัฒนาบัณฑิตให้มีสมรรถนะรองรับการทำงานในอนาคต (ด้านวิทยาศาสตร์สุขภาพ) กิจกรรมอบรมเชิงปฏิบัติการ “เส...', '2026-07-04', '2026-07-04', '08:30 - 16:30 น.', 'ณฑิตให้มีสมรรถนะรองรับการทำงานในอนาคต (ด้านวิทยาศาสตร์สุขภาพ) กิจกรรมอบรมเชิงปฏิบัติการ “เสริมสร้างการทำงานเป็นทีมของนักสาธารณสุข” เพื่อพัฒนาทักษะการทำงานร่วมกัน การสื่อสาร การแก้ไขปัญหา จิตอาสา ภาวะผู้นำผู้ตาม และการเป็นนักสาธารณสุขที่ดี ซึ่งเป็นทักษะสำคัญสำหรับการปฏิบัติงานด้านสาธารณสุข วันที่ 4 กรกฎาคม พ', 'การจัดการเรียนการสอน', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-010', 'fac-pimra', 'มรภ.นว. 1010/2569', 'เข้าร่วมพิธีประมูลวัตถุมงคลเบื้องหน้าเจ้า “เปียสิ่งโจ๊ย” เนื่องในโอกาสงานฉลองวันคล้ายวันเกิดเจ้าพ่อกวนอู ณ ศาลเจ้าชั่...', '2026-08-01', '2026-08-01', '08:30 - 16:30 น.', 'ณ ศาลเจ้าชั่วคราวสี่แยกธนาคารกรุงไทยสาขานครสวรรค์', 'ทำนุบำรุงศิลปวัฒนธรรม', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-011', 'fac-pimra', 'มรภ.นว. 1011/2569', 'เข้าร่วมการอบรมเชิงปฏิบัติการทบทวนแผนและจัดทำยุทธศาสตร์ด้านศิลปะและวัฒนธรรม วันที่ ๗-๙ พ.ค. ๖๙ ณ โรงแรมริเวอร์แคววิลเ...', '2026-08-01', '2026-08-01', '08:30 - 16:30 น.', 'ณ โรงแรมริเวอร์แคววิลเลจ จ', 'ทำนุบำรุงศิลปวัฒนธรรม', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-012', 'fac-pimra', 'มรภ.นว. 1012/2569', 'เข้าร่วมพิธีเปิดการแสดงลิเกในสวน และคอนเสิร์ตการกุศล รวมน้ำใจเพื่อผู้ประสพอัคคีภัยตรอกลิเก ณ ลานดนตรี (ใกล้ทางเข้าเกา...', '2026-08-01', '2026-08-01', '08:30 - 16:30 น.', 'ณ ลานดนตรี (ใกล้ทางเข้าเกาะกลาง) อุทยานสวรรค์', 'บริการวิชาการแก่สังคม', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-013', 'fac-pimra', 'มรภ.นว. 1013/2569', 'เข้าร่วมการอบรมเชิงปฏิบัติการ เรื่อง “การประยุกต์ใช้เทคโนโลยีระบบ AI เพื่อเพิ่มประสิทธิภาพ ในการพัฒนาระบบการทำงาน” ณ ...', '2026-08-01', '2026-08-01', '08:30 - 16:30 น.', 'ณ ห้องประชุมบุญชู โรจนเสถียร หอวัฒนธรรมจังหวัดนครสวรรค์ มหาวิทยาลัยราชภัฏนครสวรรค์', 'ทำนุบำรุงศิลปวัฒนธรรม', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-014', 'fac-pimra', 'มรภ.นว. 1014/2569', 'เข้าร่วมพิธีเปิดและส่งมอบแหล่งเรียนรู้ทางประวัติศาสตร์และศิลปวัฒนธรรมท้องถิ่น “สานศิลป์ถิ่นไทดำบ้านวังหยวก” ณ ศูนย์วั...', '2026-08-01', '2026-08-01', '08:30 - 16:30 น.', 'ณ ศูนย์วัฒนธรรมไทดำบ้านวังหยวก ตำบลบ้านแก่ง อำเภอเมืองนครสวรรค์ จังหวัดนครสวรรค์', 'ทำนุบำรุงศิลปวัฒนธรรม', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-015', 'fac-pimra', 'มรภ.นว. 1015/2569', 'ผู้รับผิดชอบโครงการขับเคลื่อน Sofe Power เชิงสร้างสรรค์ บนฐานอัตลักษณ์ศิลปะและวัฒนธรรมท้องถิ่นอย่างยั่งยืน กิจกรรมอนุ...', '2026-08-01', '2026-08-01', '08:30 - 16:30 น.', 'ณ์ศิลปะและวัฒนธรรมท้องถิ่นอย่างยั่งยืน กิจกรรมอนุรักษ์ ส่งเสริมประเพณี วัฒนธรรม และอนุรักษ์ความเป็นไทย กิจกรรมวันสงกรานต์: ราชภัฏนครสวรรค์สุขใจ สงกรานต์วิถีไทย หัวใจชื่นบาน ณ คิดเป็นภาระงาน ลานหน้าซุ้มปรางค์องค์พระพุทธสัพพัญญู 1', 'ทำนุบำรุงศิลปวัฒนธรรม', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-018', 'fac-pimra', 'มรภ.นว. 1018/2569', 'เข้าร่วมงานสมโภชศาลหลักเมืองจังหวัดนครสวรรค์ และงานสรงน้ำเจ้าพ่อ-เจ้าแม่ปากน้ำโพ ประจำปี 2569 จัดโดยคณะกรรมการจัดงานป...', '2026-08-01', '2026-08-01', '08:30 - 16:30 น.', 'ณะกรรมการจัดงานประเพณีแห่เจ้าพ่อเจ้าแม่ปากน้ำโพ (เถ่านั้ง ปีที่ 111)', 'บริหาร/กรรมการ/ภารกิจมหาวิทยาลัย', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-019', 'fac-pimra', 'มรภ.นว. 1019/2569', 'เข้าร่วมโครงการขับเคลื่อน Soft Power เชิงสร้างสรรค์บนฐานอัตลักษณ์ศิลปวัฒนธรรมของท้องถิ่นอย่างยั่งยืน การอบรมเชิงปฏิบั...', '2026-08-01', '2026-08-01', '08:30 - 16:30 น.', 'ณ์ศิลปวัฒนธรรมของท้องถิ่นอย่างยั่งยืน การอบรมเชิงปฏิบัติการ การถ่ายทอดและสืบสานองค์ความรู้ด้านศิลปวัฒนธรรม เรื่อง “กลวิธีการบรรเลงดนตรีไทย” วันที่ 31 มีนาคม - 1 เมษายน พ', 'ทำนุบำรุงศิลปวัฒนธรรม', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-020', 'fac-pimra', 'มรภ.นว. 1020/2569', 'ผู้รับผิดชอบการดำเนินกิจกรรม การอนุรักษ์ และและสืบสานเอกลักษณ์ความเป็นชาติไทย: พิธีถวายชัยมงคล ในโอกาสพระราชพิธีมหามง...', '2026-08-01', '2026-08-01', '08:30 - 16:30 น.', 'ณ์ความเป็นชาติไทย: พิธีถวายชัยมงคล ในโอกาสพระราชพิธีมหามงคลเฉลิมพระชนมพรรษา ๔ รอบ (๓ มิถุนายน ๒๕๖๙) สมเด็จพระนางเจ้าสุทิดา พัชรสุธาพิมลลักษณ พระบรมราชินี คิดเป็นภาระงาน ณ ห้องประชุมพระบาง อาคาร ๑๕ ชั้น ๔ มหาวิทยาลัยราชภัฏนครสวรรค์ 1', 'ทำนุบำรุงศิลปวัฒนธรรม', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-022', 'fac-pimra', 'มรภ.นว. 1022/2569', 'เข้าร่วมงานสืบสานประเพณีมหาสงกรานต์เมืองพระบาง ประจำปี พ.ศ. 2569 ณ วัดวรนาถบรรพต พระอารามหลวง', '2026-08-01', '2026-08-01', '08:30 - 16:30 น.', 'ณีมหาสงกรานต์เมืองพระบาง ประจำปี พ', 'ทำนุบำรุงศิลปวัฒนธรรม', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-023', 'fac-pimra', 'มรภ.นว. 1023/2569', 'ผู้รับผิดชอบดำเนินการ กิจกรรมอนุรักษ์ และสืบสานเอกลักษณ์ความเป็นชาติไทย: พิธีถวายชัยมงคล สมเด็จพระกนิษฐาธิราชเจ้า กรม...', '2026-08-01', '2026-08-01', '08:30 - 16:30 น.', 'ณ์ความเป็นชาติไทย: พิธีถวายชัยมงคล สมเด็จพระกนิษฐาธิราชเจ้า กรมสมเด็จพระเทพรัตนราชสุดาฯ สยามบรมราชกุมารี เนื่องในวันคล้ายวันพระราชสมภพ และวันอนุรักษ์มรดกไทย ประจำปี 2569 วันพฤหัสบดีที่ 2 เมษายน พ', 'บริการวิชาการแก่สังคม', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-024', 'fac-pimra', 'มรภ.นว. 1024/2569', 'เข้าร่วมพิธีแจกทานข้าวสาร อาหารแห้ง ให้แก่ผู้มีรายได้น้อย เนื่องใน “เทศกาลสารทจีน (ประเพณีทิ้งกระจาด)” จัดโดยคณะกรรมก...', '2026-08-01', '2026-08-01', '08:30 - 16:30 น.', 'ณีทิ้งกระจาด)” จัดโดยคณะกรรมการจัดงานประเพณีแห่เจ้าพ่อ-เจ้าแม่ปากน้ำโพ ประจำปี 2569-2570', 'บริหาร/กรรมการ/ภารกิจมหาวิทยาลัย', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-025', 'fac-pimra', 'มรภ.นว. 1025/2569', 'เข้าร่วมพิธีไหว้ครู “กตัญญุตา กตเวทิตา น้อมจิตวันทา บูรพาจารย์” ประจำปีการศึกษา 2569', '2026-08-01', '2026-08-01', '08:30 - 16:30 น.', 'มหาวิทยาลัยราชภัฏนครสวรรค์', 'บริการวิชาการแก่สังคม', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-026', 'fac-pimra', 'มรภ.นว. 1026/2569', 'คณะกรรมการดำเนินงานสาขาวิชาวิทยาศาสตร์สุขภาพ', '2026-08-01', '2026-08-01', '08:30 - 16:30 น.', 'ณะกรรมการดำเนินงานสาขาวิชาวิทยาศาสตร์สุขภาพ', 'บริหาร/กรรมการ/ภารกิจมหาวิทยาลัย', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-027', 'fac-pimra', 'มรภ.นว. 1027/2569', 'รักษาการณ์ตำแหน่งประธาน คณะกรรมการจริยธรรมการวิจัยในมนุษย์ มหาวิทยาลัยราชภัฏนครสวรรค', '2026-08-01', '2026-08-01', '08:30 - 16:30 น.', 'ณ์ตำแหน่งประธาน คณะกรรมการจริยธรรมการวิจัยในมนุษย์ มหาวิทยาลัยราชภัฏนครสวรรค', 'บริหาร/กรรมการ/ภารกิจมหาวิทยาลัย', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-028', 'fac-pimra', 'มรภ.นว. 1028/2569', 'กรรมการบริหารประจำสำนักศิลปะและวัฒนธรรม', '2026-08-01', '2026-08-01', '08:30 - 16:30 น.', 'มหาวิทยาลัยราชภัฏนครสวรรค์', 'บริหาร/กรรมการ/ภารกิจมหาวิทยาลัย', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-029', 'fac-pimra', 'มรภ.นว. 1029/2569', 'กรรมการประเมินคุณภาพการศึกษาภายใน ของสำนักศิลปะและวัฒนธรรม', '2026-08-01', '2026-08-01', '08:30 - 16:30 น.', 'ณภาพการศึกษาภายใน ของสำนักศิลปะและวัฒนธรรม', 'บริหาร/กรรมการ/ภารกิจมหาวิทยาลัย', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-030', 'fac-pimra', 'มรภ.นว. 1030/2569', 'การประกวดนักศึกษาต้นแบบ “AIT AMBASSADOR 2026” คณะเทคโนโลยีการเกษตรและเทคโนโลยีอุตสาหกรรม วันที่ 21 สิงหาคม คิดเป็นภาร...', '2026-08-01', '2026-08-01', '08:30 - 16:30 น.', 'ณะเทคโนโลยีการเกษตรและเทคโนโลยีอุตสาหกรรม วันที่ 21 สิงหาคม คิดเป็นภาระงาน 2569 ณ ห้องพระบาง ชั้น 4 อาคาร 15 มหาวิทยาลัยราชภัฏนครสวรรค์ 0', 'บริหาร/กรรมการ/ภารกิจมหาวิทยาลัย', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-033', 'fac-pimra', 'มรภ.นว. 1033/2569', 'ผู้รับผิดชอบดำเนินกิจกรรม การอนุรักษ์ และและสืบสานเอกลักษณ์ความเป็นชาติไทย: พิธีถวายชัยมงคล สมเด็จพระนางเจ้าสิริกิติ์...', '2026-08-01', '2026-08-01', '08:30 - 16:30 น.', 'ณ์ความเป็นชาติไทย: พิธีถวายชัยมงคล สมเด็จพระนางเจ้าสิริกิติ์ พระบรมราชินีนาถ พระบรมราชชนนีพันปีหลวง เนื่องในโอกาสวันเฉลิมพระชนมพรรษา 12 สิงหาคม 2569 และพิธีสดุดีพระคุณแม ณ ห้องประชุมพระบาง อาคาร 15 ชั้น 4 มหาวิทยาลัยราชภัฏนครสวรรค์ (ในเมือง)', 'บริการวิชาการแก่สังคม', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-034', 'fac-pimra', 'มรภ.นว. 1034/2569', 'ผู้รับผิดชอบดำเนินโครงการกิจกรรม “Training of The Trainers” ณ ห้องประชุม RDI MEETING ROOM ชั้น 2 สำนักงานสถาบันวิจัยแ...', '2026-08-01', '2026-08-01', '08:30 - 16:30 น.', 'ณ ห้องประชุม RDI MEETING ROOM ชั้น 2 สำนักงานสถาบันวิจัยและพัฒนา มหาวิทยาลัยราชภัฏนครสวรรค์ (ย่านมัทรี)', 'งานวิจัยและงานสร้างสรรค์', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-035', 'fac-pimra', 'มรภ.นว. 1035/2569', 'ผู้รับผิดชอบการดำเนินกิจกรรม การอนุรักษ์ และและสืบสานเอกลักษณ์ความเป็นชาติไทย: พิธีถวายชัยมงคล และถวายสัตย์ปฏิญาณ เพื...', '2026-08-01', '2026-08-01', '08:30 - 16:30 น.', 'ณ์ความเป็นชาติไทย: พิธีถวายชัยมงคล และถวายสัตย์ปฏิญาณ เพื่อเป็นข้าราชการที่ดีและพลังของแผ่นดิน "เนื่องในโอกาสวันเฉลิมพระชนมพรรษา พระบาทสมเด็จพระเจ้าอยู่หัว" ๒๘ กรกฎาคม ๒๕๖๙ ณ คิดเป็นภาระงาน ศูนย์ประชุมและนิทรรศการนานาชาติมหาวิทยาลัยราชภัฏนครสวรรค์ ศูนย์การศึกษาย่านมัท 1', 'งานวิจัยและงานสร้างสรรค์', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-037', 'fac-pimra', 'มรภ.นว. 1037/2569', 'คณะกรรมการดำเนินการจัดการในงานสัปดาห์วิทยาศาสตร์แห่งชาติ ประจำปี 2569', '2026-08-01', '2026-08-01', '08:30 - 16:30 น.', 'ณะกรรมการดำเนินการจัดการในงานสัปดาห์วิทยาศาสตร์แห่งชาติ ประจำปี 2569', 'บริหาร/กรรมการ/ภารกิจมหาวิทยาลัย', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-038', 'fac-pimra', 'มรภ.นว. 1038/2569', 'กรรมการประจำหลักสูตรสาธารณสุขศาสตรบัณฑิต สาขาวิชาวิทยาศาสตร์สุขภาพ', '2026-08-01', '2026-08-01', '08:30 - 16:30 น.', 'ณสุขศาสตรบัณฑิต สาขาวิชาวิทยาศาสตร์สุขภาพ', 'บริหาร/กรรมการ/ภารกิจมหาวิทยาลัย', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-039', 'fac-pimra', 'มรภ.นว. 1039/2569', 'ผู้รับผิดชอบการดำเนินกิจกรรม การอนุรักษ์ และและสืบสานเอกลักษณ์ความเป็นชาติไทย: พิธีถวายเทียนพรรษา เนื่องในโอกาส “วันเ...', '2026-08-01', '2026-08-01', '08:30 - 16:30 น.', 'ณ์ความเป็นชาติไทย: พิธีถวายเทียนพรรษา เนื่องในโอกาส “วันเข้าพรรษา” ประจำปีพุทธศักราช 2569 ณ วัดวรนาถบรรพต พระอารามหลวง', 'บริการวิชาการแก่สังคม', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-040', 'fac-pimra', 'มรภ.นว. 1040/2569', 'ผู้รับผิดชอบดำเนินงาน สำนักศิลปะและวัฒนธรรมสัญจร ประจำปี พ.ศ. 2569 ครั้งที่ 5/2569 คณะมนุษยศาสตร์และสังคมศาสตร์ วันที...', '2026-06-17', '2026-06-17', '08:30 - 16:30 น.', 'ณะมนุษยศาสตร์และสังคมศาสตร์ วันที่ 17 มิถุนายน พ', 'ทำนุบำรุงศิลปวัฒนธรรม', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-041', 'fac-pimra', 'มรภ.นว. 1041/2569', 'ผู้รับผิดชอบดำเนินงาน สำนักศิลปะและวัฒนธรรมสัญจร ประจำปี พ.ศ. 2569 พบปะพูดคุย แนะนำหน่วยงาน บุคลากร กิจกรรม ให้น้องให...', '2026-06-09', '2026-06-09', '08:30 - 16:30 น.', 'ณะ ได้รู้จัก ครั้งที่ 1/2569 คณะวิทยาศาสตร์และเทคโนโลยี วันที่ 9 มิถุนายน พ', 'ทำนุบำรุงศิลปวัฒนธรรม', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-042', 'fac-pimra', 'มรภ.นว. 1042/2569', 'ผู้เข้าร่วมการประชุมก่อนเปิดภาคเรียน และเตรียมความพร้อม การประกันคุณภาพการศึกษา ครั้งที่ 1/2569 ณ ห้องประชุมนนทรี อาค...', '2026-08-01', '2026-08-01', '08:30 - 16:30 น.', 'ณภาพการศึกษา ครั้งที่ 1/2569 ณ ห้องประชุมนนทรี อาคารศูนย์วิทยาศาสตร์', 'ประกันคุณภาพการศึกษา', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-043', 'fac-pimra', 'มรภ.นว. 1043/2569', 'ผู้รับผิดชอบดำเนินงาน สำนักศิลปะและวัฒนธรรมสัญจร ประจำปี พ.ศ. 2569 ครั้งที่ 2/2569 คณะวิทยาการจัดการ วันที่ 10 มิถุนา...', '2026-06-10', '2026-06-10', '08:30 - 16:30 น.', 'ณะวิทยาการจัดการ วันที่ 10 มิถุนายน พ', 'ทำนุบำรุงศิลปวัฒนธรรม', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-044', 'fac-pimra', 'มรภ.นว. 1044/2569', 'ผู้รับผิดชอบดำเนินงาน สำนักศิลปะและวัฒนธรรมสัญจร ประจำปี พ.ศ. 2569 ครั้งที่ 4/2569 คณะเทคโนโลยีการเกษตรและเทคโนโลยีอุ...', '2026-06-14', '2026-06-14', '08:30 - 16:30 น.', 'ณะเทคโนโลยีการเกษตรและเทคโนโลยีอุตสาหกรรม วันที่ 14 มิถุนายน พ', 'ทำนุบำรุงศิลปวัฒนธรรม', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-045', 'fac-pimra', 'มรภ.นว. 1045/2569', 'ผู้รับผิดชอบดำเนินงาน สำนักศิลปะและวัฒนธรรมสัญจร ประจำปี พ.ศ. 2569 ครั้งที่ 3/2569 คณะครุศาสตร์ วันที่ 13 มิถุนายน พ....', '2026-08-01', '2026-08-01', '08:30 - 16:30 น.', 'ณะครุศาสตร์ วันที่ 13 มิถุนายน พ', 'ทำนุบำรุงศิลปวัฒนธรรม', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-048', 'fac-pimra', 'มรภ.นว. 1048/2569', 'เข้าร่วมการประชุมปรึกษาหารือร่วมกับคณะกรรมการจัดงานประเพณีแห่เจ้าพ่อ-เจ้าแม่ปากน้ำโพ ประจำปี 2569-2570 (เถ่านั้ง 111)...', '2026-08-01', '2026-08-01', '08:30 - 16:30 น.', 'ณะกรรมการจัดงานประเพณีแห่เจ้าพ่อ-เจ้าแม่ปากน้ำโพ ประจำปี 2569-2570 (เถ่านั้ง 111) เพื่อหารือแนวทางและวางแผนส่งนักเรียน-นักศึกษา เข้าร่วมการคัดเลือกองค์สมมติพระโพธิสัตว์กวนอิม', 'ประกันคุณภาพการศึกษา', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-051', 'fac-pimra', 'มรภ.นว. 1051/2569', 'เข้าร่วมพิธีแจกทาน ข้าวสาร อาหารแห้ง ให้แก่ผู้มีรายได้น้อย เนื่องในเทศกาลสารทจีน (ประเพณีทิ้งกระจาด) วันที่ 24 สิงหาค...', '2026-08-24', '2026-08-24', '08:30 - 16:30 น.', 'ณีทิ้งกระจาด) วันที่ 24 สิงหาคม พ', 'ทำนุบำรุงศิลปวัฒนธรรม', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-052', 'fac-pimra', 'มรภ.นว. 1052/2569', 'เข้าร่วมการประชุมคณะกรรมการประจำสำนักศิลปะและวัฒนธรรม ครั้งที่ 3/2569 ณ ห้องประบุญชู โรจนเสถียร หอวัฒนธรรมจังหวัดนครส...', '2026-08-01', '2026-08-01', '08:30 - 16:30 น.', 'ณะกรรมการประจำสำนักศิลปะและวัฒนธรรม ครั้งที่ 3/2569 ณ ห้องประบุญชู โรจนเสถียร หอวัฒนธรรมจังหวัดนครสวรรค์ มหาวิทยาลัยราชภัฏนครสวรรค์', 'บริหาร/กรรมการ/ภารกิจมหาวิทยาลัย', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO orders (id, faculty_id, order_number, title, sign_date, event_date, event_time, location, category, status, role, workload_hours, evidence_status, doc_file_name, raw_ocr_text)
VALUES ('ord-pimra-053', 'fac-pimra', 'มรภ.นว. 1053/2569', 'วิทยากรการพัฒนาบุคลิกภาพนักศึกษาต้นแบบ SCI&TECH AMBASSADOR 2026 คณะวิทยาศาสตร์และเทคโนโลยี วันอาทิตย์ ที่ 23 คิดเป็นภ...', '2026-08-09', '2026-08-09', '08:30 - 16:30 น.', 'ณะวิทยาศาสตร์และเทคโนโลยี วันอาทิตย์ ที่ 23 คิดเป็นภาระงาน สิงหาคม 2569 ณ ห้องปฏิบัติการประดิษฐ์ อาคาร 6 ชั้น 1 มหาวิทยาลัยราชภัฏนครสวรรค์ 1', 'บริหาร/กรรมการ/ภารกิจมหาวิทยาลัย', 'done', 'กรรมการ', 0, 'none', NULL, NULL)
ON CONFLICT (id) DO NOTHING;
