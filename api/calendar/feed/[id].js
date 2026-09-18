import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ufkenphuidmujarfpeoz.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVma2VucGh1aWRtdWphcmZwZW96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzMDU3MjgsImV4cCI6MjEwNDg4MTcyOH0.TO-SzgBcRabRjdO4dbzpahdVdpj56rFnfYmz39UJuWU';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * RFC 5545 Text Value Escaping
 * Escapes backslashes, semicolons, commas, and newlines
 */
function escapeICalText(str) {
  if (!str) return '';
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

export default async function handler(req, res) {
  const { id } = req.query;

  // Sanitize input: allow only alphanumeric characters, underscores, and dashes
  const rawId = (id || 'fac-1').replace(/\.ics$/i, '');
  const facultyId = rawId.replace(/[^a-zA-Z0-9_-]/g, '');

  if (!facultyId) {
    return res.status(400).send('Invalid faculty ID');
  }

  try {
    // 1. Fetch faculty info
    const { data: faculty } = await supabase
      .from('faculties')
      .select('*')
      .eq('id', facultyId)
      .single();

    const facultyName = faculty ? faculty.name : 'คณาจารย์ มรภ.นครสวรรค์';

    // 2. Fetch all orders strictly for this faculty (preventing cross-faculty data leak)
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('faculty_id', facultyId)
      .order('event_date', { ascending: false });

    if (error) {
      console.error('[iCal API] Supabase error:', error);
    }

    const calendarName = escapeICalText(`ภาระงาน: ${facultyName} (UniWorkload AI)`);
    const nowStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const eventsIcal = (orders || []).map((ord) => {
      let dtStartStr = '';
      let dtEndStr = '';
      const dateOnly = (ord.event_date || new Date().toISOString().split('T')[0]).replace(/[^0-9]/g, '');

      if (ord.event_time && ord.event_time.includes('-')) {
        const parts = ord.event_time.replace(/น\./g, '').trim().split('-');
        const startH = (parts[0] || '08:30').trim().replace(/[^0-9]/g, '');
        const endH = (parts[1] || '16:30').trim().replace(/[^0-9]/g, '');
        dtStartStr = `DTSTART;TZID=Asia/Bangkok:${dateOnly}T${startH.padEnd(4, '0')}00`;
        dtEndStr = `DTEND;TZID=Asia/Bangkok:${dateOnly}T${endH.padEnd(4, '0')}00`;
      } else {
        dtStartStr = `DTSTART;VALUE=DATE:${dateOnly}`;
        dtEndStr = `DTEND;VALUE=DATE:${dateOnly}`;
      }

      const summary = escapeICalText(`[${ord.category || 'ภาระงาน'}] ${ord.title || ord.order_number || 'คำสั่งราชการ'}`);
      const directDrawerUrl = `https://uniworkload-ai.vercel.app/?tab=drawer&orderId=${encodeURIComponent(ord.id)}&faculty=${encodeURIComponent(facultyId)}`;
      
      const descLines = [
        `เลขที่คำสั่ง: ${ord.order_number || 'ไม่ระบุ'}`,
        `บทบาท: ${ord.role || 'กรรมการ'}`,
        `ภาระงานสะสม: ${ord.workload_hours || 0} ชั่วโมง`,
        `สถานะ: ${ord.status === 'done' ? 'เสร็จสิ้นแล้ว' : 'รอดำเนินการ'}`,
        '',
        '🔗 เปิดดูคำสั่งและแนบหลักฐานในลิ้นชักงาน:',
        directDrawerUrl,
        '',
        'มหาวิทยาลัยราชภัฏนครสวรรค์'
      ].join('\n');
      const description = escapeICalText(descLines);
      const location = escapeICalText(ord.location || 'มหาวิทยาลัยราชภัฏนครสวรรค์');

      return [
        'BEGIN:VEVENT',
        `UID:${encodeURIComponent(ord.id)}@uniworkload.nsru.ac.th`,
        `DTSTAMP:${nowStamp}`,
        dtStartStr,
        dtEndStr,
        `SUMMARY:${summary}`,
        `LOCATION:${location}`,
        `DESCRIPTION:${description}`,
        `URL:${directDrawerUrl}`,
        'STATUS:CONFIRMED',
        'END:VEVENT'
      ].join('\r\n');
    }).join('\r\n');

    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//NSRU//UniWorkload AI RFC 5545 Live Feed//TH',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${calendarName}`,
      'X-WR-TIMEZONE:Asia/Bangkok',
      eventsIcal,
      'END:VCALENDAR'
    ].filter(Boolean).join('\r\n');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename="calendar-${facultyId}.ics"`);
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300'); // Cache for 5 mins
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.status(200).send(icalContent);
  } catch (err) {
    console.error('[iCal API] Error generating ical:', err);
    return res.status(500).send('Error generating calendar feed');
  }
}
