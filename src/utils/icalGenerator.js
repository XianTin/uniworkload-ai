// RFC 5545 iCalendar (.ics) generator for UniWorkload AI

export function getDirectDrawerUrl(orderId, facultyId = '', baseUrl = '') {
  const origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://uniworkload-ai.vercel.app');
  return `${origin}/?tab=drawer&orderId=${orderId}${facultyId ? `&faculty=${facultyId}` : ''}`;
}

export function createGoogleCalendarUrl(ev, facultyId = '', baseUrl = '') {
  const directUrl = getDirectDrawerUrl(ev.id, facultyId, baseUrl);
  const startTimeStr = ev.eventTime ? ev.eventTime.split('-')[0].replace('น.', '').trim() : '09:00';
  const endTimeStr = ev.eventTime && ev.eventTime.includes('-') ? ev.eventTime.split('-')[1].replace('น.', '').trim() : '16:30';
  
  const formatDateToGCal = (dateStr, timeStr = "09:00") => {
    const [year, month, day] = (dateStr || '2026-09-11').split('-');
    const [hours, minutes] = (timeStr || '09:00').split(':');
    return `${year}${month}${day}T${(hours || '09').padStart(2, '0')}${(minutes || '00').padStart(2, '0')}00`;
  };

  const dtStart = formatDateToGCal(ev.eventDate, startTimeStr);
  const dtEnd = formatDateToGCal(ev.eventEndDate || ev.eventDate, endTimeStr);
  const title = `[${ev.orderNumber || 'คำสั่ง'}] ${ev.title}`;
  const details = `ภาระงาน: ${ev.category || 'ภาระงานวิชาการ/บริหาร'}\nสถานที่: ${ev.location || 'มหาวิทยาลัยราชภัฏนครสวรรค์'}\nเลขที่คำสั่ง: ${ev.orderNumber || '-'}\n\n📂 คลิกเปิดลิ้นชักงานและแนบหลักฐาน (UniWorkload AI):\n${directUrl}\n\nระบบ UniWorkload AI มรภ.นครสวรรค์`;
  const location = ev.location || 'มหาวิทยาลัยราชภัฏนครสวรรค์';

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dtStart}/${dtEnd}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
}

export function generateICS(events, calendarName = "UniWorkload AI - ปฏิทินภาระงาน", facultyId = '', baseUrl = '') {
  const pad = (n) => (n < 10 ? '0' + n : '' + n);
  
  const formatDateToICS = (dateStr, timeStr = "09:00") => {
    const [year, month, day] = dateStr.split('-');
    const [hours, minutes] = timeStr.split(':');
    return `${year}${month}${day}T${hours || '09'}${minutes || '00'}00`;
  };

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UniWorkload AI//NSRU Academic Calendar//TH',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calendarName}`,
    'X-WR-TIMEZONE:Asia/Bangkok',
    'BEGIN:VTIMEZONE',
    'TZID:Asia/Bangkok',
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:+0700',
    'TZOFFSETTO:+0700',
    'TZNAME:ICT',
    'END:STANDARD',
    'END:VTIMEZONE'
  ];

  events.forEach((ev) => {
    const startTimeStr = ev.eventTime ? ev.eventTime.split('-')[0].replace('น.', '').trim() : '09:00';
    const endTimeStr = ev.eventTime && ev.eventTime.includes('-') ? ev.eventTime.split('-')[1].replace('น.', '').trim() : '16:30';
    
    const dtStart = formatDateToICS(ev.eventDate, startTimeStr);
    const dtEnd = formatDateToICS(ev.eventEndDate || ev.eventDate, endTimeStr);
    const directUrl = getDirectDrawerUrl(ev.id, facultyId, baseUrl);
    const summary = `[${ev.orderNumber}] ${ev.title}`;
    const description = `ภาระงาน: ${ev.category}\\nสถานที่: ${ev.location}\\nเลขที่คำสั่ง: ${ev.orderNumber}\\n\\n🔗 เปิดดูคำสั่งและแนบหลักฐานในลิ้นชักงาน:\\n${directUrl}\\n\\nระบบ UniWorkload AI มรภ.นครสวรรค์`;

    icsContent.push(
      'BEGIN:VEVENT',
      `UID:uniworkload-${ev.id}-${Date.now()}@nsru.ac.th`,
      `DTSTAMP:${formatDateToICS(new Date().toISOString().split('T')[0], '00:00')}Z`,
      `DTSTART;TZID=Asia/Bangkok:${dtStart}`,
      `DTEND;TZID=Asia/Bangkok:${dtEnd}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `URL:${directUrl}`,
      `LOCATION:${ev.location || 'มหาวิทยาลัยราชภัฏนครสวรรค์'}`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  });

  icsContent.push('END:VCALENDAR');
  return icsContent.join('\r\n');
}

export function downloadICSFile(events, filename = "uniworkload-schedule.ics", facultyId = '', baseUrl = '') {
  const content = generateICS(events, "UniWorkload AI - ปฏิทินภาระงาน", facultyId, baseUrl);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
