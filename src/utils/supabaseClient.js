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

    return data.map((ord) => ({
      id: ord.id,
      facultyId: ord.faculty_id || 'fac-1',
      orderNumber: ord.order_number || '',
      title: ord.title || '',
      signDate: ord.sign_date || '',
      eventDate: ord.event_date || '',
      eventTime: ord.event_time || '',
      location: ord.location || '',
      category: ord.category || 'บริหาร/กรรมการ/ภารกิจมหาวิทยาลัย',
      categoryCode: getCategoryCode(ord.category),
      categoryColor: getCategoryColor(ord.category),
      status: ord.status || 'pending',
      role: ord.role || '',
      workloadHours: Number(ord.workload_hours) || 0,
      evidenceStatus: (ord.order_evidences && ord.order_evidences.length > 0) ? 'ready' : (ord.evidence_status || 'none'),
      documentFileName: ord.doc_file_name || null,
      rawOcrText: ord.raw_ocr_text || null,
      evidences: (ord.order_evidences || []).map((ev) => ({
        id: ev.id,
        title: ev.title || 'ภาพถ่ายหลักฐานหน้างาน',
        url: ev.image_url,
        fileSize: ev.file_size || '1.2 MB',
        uploadedAt: ev.uploaded_at || new Date().toISOString(),
        description: ev.description || ''
      })),
      actualPhotos: (ord.order_evidences || []).map((ev) => ev.image_url),
      ePortfolio: {
        topic: ord.title || '',
        role: ord.role || 'กรรมการ',
        hours: Number(ord.workload_hours) || 3,
        resultSummary: `ดำเนินงานตามคำสั่ง ${ord.order_number} เรียบร้อยสมบูรณ์`,
        status: 'ready_to_export'
      }
    }));
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
