import { createClient } from '@supabase/supabase-js';
import { compressImageFile } from './imageUtils';

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

      const photos = (ord.order_evidences || []).map((ev) => {
        const isGDrive = ev.image_url && (ev.image_url.includes('drive.google.com') || ev.image_url.includes('docs.google.com'));
        const fileIdMatch = isGDrive ? ev.image_url.match(/[-\w]{25,}/) : null;
        const fileId = fileIdMatch ? fileIdMatch[0] : null;

        return {
          id: ev.id,
          name: ev.title || (isGDrive ? 'หลักฐาน Google Drive' : 'ภาพถ่ายหลักฐานหน้างาน.jpg'),
          title: ev.title || (isGDrive ? 'หลักฐาน Google Drive' : 'ภาพถ่ายหลักฐานหน้างาน.jpg'),
          url: ev.image_url,
          thumbnailUrl: isGDrive && fileId && !ev.image_url.includes('/folders/') 
            ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w800` 
            : ev.image_url,
          size: ev.file_size || (isGDrive ? 'Google Drive Cloud' : '1.2 MB'),
          uploadedAt: ev.uploaded_at ? ev.uploaded_at.split('T')[0] : (ord.event_date || new Date().toISOString().split('T')[0]),
          type: isGDrive ? 'gdrive' : 'photo',
          isGoogleDrive: isGDrive,
          note: ev.description || (isGDrive ? 'คลังหลักฐานบน Google Drive' : '')
        };
      });

      const docFile = ord.doc_file_name || `${ord.order_number ? ord.order_number.replace(/[^a-zA-Z0-9ก-๙]/g, '_') : 'order'}.pdf`;

      return {
        id: ord.id,
        facultyId: assignedFacId,
        orderNumber: ord.order_number || '',
        title: ord.title || '',
        signDate: ord.sign_date || '',
        eventDate: ord.event_date || '',
        eventDateDisplay: formatThaiDateDisplay(ord.event_date),
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
        fullDescription: ord.raw_ocr_text || ord.title || '',
        summary: ord.raw_ocr_text ? ord.raw_ocr_text.slice(0, 250) : ord.title,
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

// Known valid faculty IDs in Supabase database to prevent foreign key constraint violations (23503)
export const VALID_SUPABASE_FACULTY_IDS = new Set([
  'fac-pimra',
  'fac-1',
  'fac-2',
  'fac-3',
  'fac-kritsana',
  'fac-theerapat'
]);

export function getSafeFacultyId(id) {
  if (id && VALID_SUPABASE_FACULTY_IDS.has(id)) return id;
  return 'fac-pimra';
}

/**
 * Save single evidence photo to order_evidences table in Supabase
 */
export async function saveSingleEvidenceToSupabase(orderId, facultyId, evidence) {
  return saveMultipleEvidencesToSupabase(orderId, facultyId, [evidence]);
}

/**
 * Save multiple evidence photos to order_evidences table in Supabase
 */
export async function saveMultipleEvidencesToSupabase(orderId, facultyId, evidences) {
  try {
    if (!evidences || evidences.length === 0) return [];

    const safeFacId = getSafeFacultyId(facultyId);

    const rawRecords = evidences.map((ev, idx) => {
      const photoObj = typeof ev === 'string'
        ? { id: `ev-${orderId}-${idx}`, url: ev, name: `ภาพถ่าย_${idx + 1}.jpg` }
        : ev;

      const isGDrive = photoObj.isGoogleDrive || (photoObj.url && (photoObj.url.includes('drive.google.com') || photoObj.url.includes('docs.google.com')));

      return {
        id: photoObj.id || `ev-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
        order_id: orderId,
        faculty_id: safeFacId,
        title: photoObj.name || photoObj.title || (isGDrive ? 'หลักฐาน Google Drive' : `ภาพถ่ายหลักฐาน_${idx + 1}.jpg`),
        rawUrl: photoObj.url || photoObj.dataUrl || photoObj.thumbnailUrl || '',
        file_size: isGDrive ? 'Google Drive' : (photoObj.size || '1.2 MB'),
        description: photoObj.note || photoObj.description || (isGDrive ? 'คลังหลักฐานบน Google Drive คลาวด์' : 'หลักฐานบันทึกการปฏิบัติหน้าที่ตามคำสั่งราชการ'),
        isGDrive
      };
    }).filter(r => r.rawUrl && r.rawUrl.trim().length > 0);

    if (rawRecords.length === 0) return [];

    // Ensure every record has a persistent, lightweight Data URL, HTTP URL, or Google Drive URL
    const records = await Promise.all(rawRecords.map(async (r) => {
      let finalUrl = r.rawUrl;
      let finalSize = r.file_size;

      // Only compress if it's a giant raw base64 or temporary blob (skip Google Drive and external web URLs)
      if (!r.isGDrive && !finalUrl.startsWith('https://drive.google.com') && !finalUrl.startsWith('https://docs.google.com')) {
        if (finalUrl.startsWith('blob:') || (finalUrl.startsWith('data:image/') && finalUrl.length > 250000)) {
          try {
            const comp = await compressImageFile(finalUrl, 1200, 1200, 0.70);
            if (comp?.dataUrl) {
              finalUrl = comp.dataUrl;
              finalSize = comp.size;
            }
          } catch (e) {
            console.warn('[saveMultipleEvidencesToSupabase] Compression failed for record:', e);
          }
        }
      }

      return {
        id: r.id,
        order_id: r.order_id,
        faculty_id: r.faculty_id,
        title: r.title,
        image_url: finalUrl,
        file_size: finalSize,
        description: r.description
      };
    }));

    // Filter out any invalid blob URLs that couldn't be converted
    const safeRecords = records.filter(r => r.image_url && !r.image_url.startsWith('blob:'));
    if (safeRecords.length === 0) return [];

    const { data, error } = await supabase
      .from('order_evidences')
      .upsert(safeRecords, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('[Supabase DB] Error upserting order_evidences:', error);
      return [];
    }

    // Update order evidence status to ready
    await supabase
      .from('orders')
      .update({ evidence_status: 'ready' })
      .eq('id', orderId);

    return data;
  } catch (err) {
    console.error('[saveMultipleEvidencesToSupabase] Exception:', err);
    return [];
  }
}

/**
 * Delete evidence photo from Supabase
 */
export async function deleteEvidenceFromSupabase(orderId, evidenceId) {
  try {
    const { error } = await supabase
      .from('order_evidences')
      .delete()
      .eq('id', evidenceId);

    if (error) {
      console.error('[Supabase DB] Error deleting evidence:', error);
    }

    // Check if there are remaining evidences for this order
    const { count } = await supabase
      .from('order_evidences')
      .select('*', { count: 'exact', head: true })
      .eq('order_id', orderId);

    if (count === 0) {
      await supabase
        .from('orders')
        .update({ evidence_status: 'none' })
        .eq('id', orderId);
    }
  } catch (err) {
    console.error('[deleteEvidenceFromSupabase] Exception:', err);
  }
}

/**
 * Upload an evidence photo to Supabase (direct dataUrl fallback)
 */
export async function uploadEvidenceToSupabase(orderId, facultyId, file, title = 'ภาพถ่ายหลักฐานหน้างาน', description = '') {
  return saveSingleEvidenceToSupabase(orderId, facultyId, {
    title,
    description,
    url: typeof file === 'string' ? file : URL.createObjectURL(file),
    size: (file.size / (1024 * 1024)).toFixed(1) + ' MB'
  });
}

/**
 * Save new order to Supabase with Foreign Key validation & auto-retry
 */
export async function saveOrderToSupabase(order, facultyId = 'fac-pimra') {
  try {
    const hasPhotos = Boolean(order.actualPhotos && order.actualPhotos.length > 0);
    const safeFacId = getSafeFacultyId(facultyId || order.facultyId);

    const record = {
      id: order.id,
      faculty_id: safeFacId,
      order_number: order.orderNumber || 'รอระบุเลขที่คำสั่ง',
      title: order.title,
      sign_date: order.signDate || null,
      event_date: order.eventDate || null,
      event_time: order.eventTime || null,
      location: order.location || null,
      category: order.category || 'บริหาร/กรรมการ/ภารกิจมหาวิทยาลัย',
      status: order.status || 'pending',
      role: order.role || (order.facultyAssigned?.[0]?.roleInOrder) || 'กรรมการ',
      workload_hours: order.workloadHours || order.ePortfolio?.hours || 3,
      evidence_status: hasPhotos ? 'ready' : (order.evidenceStatus || 'none'),
      doc_file_name: order.documentFileName || null,
      raw_ocr_text: order.rawOcrText || null
    };

    let { data, error } = await supabase
      .from('orders')
      .upsert(record, { onConflict: 'id' });

    // Auto-fallback retry if foreign key violation occurs
    if (error && (error.code === '23503' || error.message?.includes('foreign key constraint'))) {
      console.warn('[Supabase] Foreign key error for faculty_id:', safeFacId, 'Retrying with fac-pimra fallback...');
      record.faculty_id = 'fac-pimra';
      const retryResult = await supabase
        .from('orders')
        .upsert(record, { onConflict: 'id' });
      data = retryResult.data;
      error = retryResult.error;
    }

    if (error) {
      console.error('[Supabase] Error upserting order:', error);
    }

    // Persist any attached photos to order_evidences table in Supabase
    if (hasPhotos) {
      await saveMultipleEvidencesToSupabase(order.id, record.faculty_id, order.actualPhotos);
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
 * Delete order from Supabase
 */
export async function deleteOrderFromSupabase(orderId) {
  try {
    await supabase.from('order_evidences').delete().eq('order_id', orderId);
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) {
      console.error('[Supabase] Error deleting order:', error);
    }
  } catch (err) {
    console.error('[deleteOrderFromSupabase] Exception:', err);
  }
}

/**
 * Clear all orders from Supabase (by faculty_id or all)
 */
export async function clearAllOrdersFromSupabase(facultyId = null) {
  try {
    if (facultyId) {
      const { data: orderList } = await supabase.from('orders').select('id').eq('faculty_id', facultyId);
      if (orderList && orderList.length > 0) {
        const ids = orderList.map(o => o.id);
        await supabase.from('order_evidences').delete().in('order_id', ids);
        await supabase.from('orders').delete().eq('faculty_id', facultyId);
      }
    } else {
      await supabase.from('order_evidences').delete().neq('id', 'none');
      await supabase.from('orders').delete().neq('id', 'none');
    }
  } catch (err) {
    console.error('[clearAllOrdersFromSupabase] Exception:', err);
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

const THAI_MONTH_NAMES_LIST = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

function formatThaiDateDisplay(dateStr) {
  if (!dateStr) return '';
  try {
    const cleanDate = String(dateStr).split('T')[0];
    const parts = cleanDate.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10) + 543;
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (monthIdx >= 0 && monthIdx < 12) {
        return `${day} ${THAI_MONTH_NAMES_LIST[monthIdx]} ${year}`;
      }
    }
  } catch (e) {}
  return dateStr;
}

