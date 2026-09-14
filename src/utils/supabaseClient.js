import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ufkenphuidmujarfpeoz.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVma2VucGh1aWRtdWphcmZwZW96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzMDU3MjgsImV4cCI6MjEwNDg4MTcyOH0.TO-SzgBcRabRjdO4dbzpahdVdpj56rFnfYmz39UJuWU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Fetch all faculties with fallback to mock data
 */
export async function fetchFacultiesFromSupabase(fallback = []) {
  try {
    const { data, error } = await supabase
      .from('faculties')
      .select('*')
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn('[Supabase] Could not load faculties or table empty, using fallback:', error);
      return fallback;
    }

    return data.map((f) => ({
      id: f.id,
      name: f.name,
      role: f.role || '',
      department: f.department || '',
      faculty: f.faculty || '',
      email: f.email || '',
      avatar: f.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(f.name)}&background=0D8ABC&color=fff`
    }));
  } catch (err) {
    console.warn('[Supabase] Exception fetching faculties:', err);
    return fallback;
  }
}

/**
 * Fetch all orders including evidences
 */
export async function fetchOrdersFromSupabase(fallback = []) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_evidences (*)
      `)
      .order('event_date', { ascending: false });

    if (error || !data || data.length === 0) {
      console.warn('[Supabase] Could not load orders or table empty, using fallback:', error);
      return fallback;
    }

    const facultyMap = {
      'fac-pimra': { name: 'อ.พิมรา ทองแสง', role: 'รองผู้อำนวยการ' },
      'fac-kritsana': { name: 'ผศ.ดร.กฤษณะ มีสุข', role: 'ผู้ช่วยศาสตราจารย์' },
      'fac-theerapat': { name: 'อ.ธีรภัทร วัฒนศิลป์', role: 'อาจารย์ประจำสาขาวิชา' },
      'fac-1': { name: 'อ.ธนภัทร สุขเกษม', role: 'อาจารย์ผู้รับผิดชอบ' },
      'fac-2': { name: 'ผศ.ดร.สมชาย ใจดี', role: 'ผู้ช่วยศาสตราจารย์' },
      'fac-3': { name: 'อ.วรัญญา ประเสริฐสุข', role: 'อาจารย์ประจำสาขา' }
    };

    const parsedDbOrders = data.map((ord) => {
      const assignedFacId = ord.faculty_id || 'fac-pimra';
      const facInfo = facultyMap[assignedFacId] || { name: 'อาจารย์ผู้รับผิดชอบ', role: ord.role || 'กรรมการ' };

      const photos = (ord.order_evidences || []).map((ev) => ({
        id: ev.id,
        name: ev.title || 'ภาพถ่ายหลักฐานหน้างาน.jpg',
        url: ev.image_url,
        size: ev.file_size || '1.2 MB',
        uploadedAt: ev.uploaded_at ? ev.uploaded_at.split('T')[0] : (ord.event_date || new Date().toISOString().split('T')[0]),
        type: 'photo'
      }));

      const docFile = ord.doc_file_name || `${ord.order_number ? ord.order_number.replace(/[^a-zA-Z0-9ก-๙]/g, '_') : 'order'}.pdf`;

      return {
        id: ord.id,
        facultyId: assignedFacId,
        orderNumber: ord.order_number || '',
        title: ord.title || '',
        signDate: ord.sign_date || '',
        eventDate: ord.event_date || '',
        eventTime: ord.event_time || '08:30 - 16:30 น.',
        location: ord.location || 'มหาวิทยาลัยราชภัฏนครสวรรค์',
        category: ord.category || 'บริหาร/กรรมการ/ภารกิจมหาวิทยาลัย',
        categoryCode: getCategoryCode(ord.category),
        categoryColor: getCategoryColor(ord.category),
        status: ord.status || 'upcoming',
        role: ord.role || 'กรรมการดำเนินงาน',
        workloadHours: Number(ord.workload_hours) || 3,
        evidenceStatus: photos.length > 0 ? 'ready' : (ord.evidence_status || 'none'),
        documentFileName: docFile,
        rawOcrText: ord.raw_ocr_text || null,
        facultyAssigned: [
          {
            id: assignedFacId,
            name: facInfo.name,
            roleInOrder: ord.role || 'กรรมการดำเนินงาน'
          }
        ],
        evidenceFiles: [
          {
            id: `ev-doc-${ord.id}`,
            name: docFile,
            size: '1.8 MB',
            type: docFile.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image',
            uploadedAt: ord.sign_date || new Date().toISOString().split('T')[0]
          }
        ],
        actualPhotos: photos,
        ePortfolio: {
          year: ord.sign_date ? String(new Date(ord.sign_date).getFullYear() + 543) : '2569',
          round: 'รอบ 2 (1 เม.ย. - 30 ก.ย. 2569)',
          topic: ord.title || '',
          role: ord.role || 'กรรมการดำเนินงาน',
          hours: Number(ord.workload_hours) || 3,
          workloadRef: `ภาระงานด้าน${ord.category || 'มหาวิทยาลัย'} มหาวิทยาลัยราชภัฏนครสวรรค์`,
          resultSummary: ord.status === 'done' 
            ? `ปฏิบัติหน้าที่ตามคำสั่ง ${ord.order_number} เรียบร้อยแล้ว`
            : `อยู่ระหว่างรอดำเนินการตามกำหนดการคำสั่งราชการ`,
          status: ord.status === 'done' ? 'completed' : 'pending_task'
        }
      };
    });

    // Merge DB orders with fallback orders to ensure all faculties have demo data
    const dbOrderIds = new Set(parsedDbOrders.map(o => o.id));
    const mergedOrders = [...parsedDbOrders];
    for (const fb of fallback) {
      if (!dbOrderIds.has(fb.id)) {
        mergedOrders.push(fb);
      }
    }

    return mergedOrders;
  } catch (err) {
    console.warn('[Supabase] Exception fetching orders:', err);
    return fallback;
  }
}

/**
 * Upload an evidence photo to Supabase Storage & insert record in order_evidences
 */
export async function uploadEvidenceToSupabase(orderId, facultyId, file, title = 'ภาพถ่ายหลักฐานหน้างาน', description = '') {
  try {
    const ext = file.name.split('.').pop() || 'jpg';
    const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '_');
    const path = `${facultyId}/${orderId}/${Date.now()}_${cleanName}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('evidences')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('[Supabase Storage] Upload error:', uploadError);
      throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
      .from('evidences')
      .getPublicUrl(path);

    const publicUrl = publicUrlData.publicUrl;
    const evidenceId = 'ev-' + Date.now();
    const fileSizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

    const { data: evRecord, error: insertError } = await supabase
      .from('order_evidences')
      .insert({
        id: evidenceId,
        order_id: orderId,
        faculty_id: facultyId,
        title: title,
        image_url: publicUrl,
        file_size: fileSizeStr,
        description: description
      })
      .select()
      .single();

    if (insertError) {
      console.error('[Supabase DB] Error inserting order_evidences:', insertError);
    }

    // Update order evidence status to ready
    await supabase
      .from('orders')
      .update({ evidence_status: 'ready' })
      .eq('id', orderId);

    return {
      id: evidenceId,
      title,
      url: publicUrl,
      fileSize: fileSizeStr,
      uploadedAt: new Date().toISOString(),
      description
    };
  } catch (err) {
    console.error('[uploadEvidenceToSupabase] Failed:', err);
    throw err;
  }
}

/**
 * Save new order to Supabase
 */
export async function saveOrderToSupabase(order, facultyId = 'fac-1') {
  try {
    const record = {
      id: order.id,
      faculty_id: facultyId,
      order_number: order.orderNumber,
      title: order.title,
      sign_date: order.signDate || null,
      event_date: order.eventDate || null,
      event_time: order.eventTime || null,
      location: order.location || null,
      category: order.category || 'บริหาร/กรรมการ/ภารกิจมหาวิทยาลัย',
      status: order.status || 'pending',
      role: order.role || (order.facultyAssigned?.[0]?.roleInOrder) || 'กรรมการ',
      workload_hours: order.workloadHours || order.ePortfolio?.hours || 3,
      evidence_status: order.evidenceStatus || 'none',
      doc_file_name: order.documentFileName || null,
      raw_ocr_text: order.rawOcrText || null
    };

    const { data, error } = await supabase
      .from('orders')
      .upsert(record, { onConflict: 'id' });

    if (error) {
      console.error('[Supabase] Error upserting order:', error);
    }
    return data;
  } catch (err) {
    console.error('[saveOrderToSupabase] Exception:', err);
  }
}

/**
 * Update order status
 */
export async function updateOrderStatusInSupabase(orderId, status) {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      console.error('[Supabase] Error updating status:', error);
    }
  } catch (err) {
    console.error('[updateOrderStatusInSupabase] Exception:', err);
  }
}

/**
 * Insert new faculty to Supabase
 */
export async function saveFacultyToSupabase(faculty) {
  try {
    const { data, error } = await supabase
      .from('faculties')
      .upsert({
        id: faculty.id,
        name: faculty.name,
        role: faculty.role,
        department: faculty.department,
        faculty: faculty.faculty,
        email: faculty.email,
        avatar: faculty.avatar
      }, { onConflict: 'id' });

    if (error) {
      console.error('[Supabase] Error saving faculty:', error);
    }
    return data;
  } catch (err) {
    console.error('[saveFacultyToSupabase] Exception:', err);
  }
}

function getCategoryCode(category) {
  if (!category) return 'admin';
  if (category.includes('สอน')) return 'teaching';
  if (category.includes('วิจัย')) return 'research';
  if (category.includes('บริการ')) return 'academic';
  if (category.includes('ศิลป')) return 'culture';
  if (category.includes('ประกัน')) return 'qa';
  return 'admin';
}

function getCategoryColor(category) {
  if (!category) return 'purple';
  if (category.includes('สอน')) return 'blue';
  if (category.includes('วิจัย')) return 'emerald';
  if (category.includes('บริการ')) return 'amber';
  if (category.includes('ศิลป')) return 'rose';
  if (category.includes('ประกัน')) return 'teal';
  return 'purple';
}
