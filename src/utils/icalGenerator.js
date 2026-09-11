// RFC 5545 iCalendar (.ics) generator for UniWorkload AI

export function generateICS(events, calendarName = "UniWorkload AI - ปฏิทินภาระงาน") {
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
    const dtEnd = formatDateToICS(ev.eventDate, endTimeStr);
    const summary = `[${ev.orderNumber}] ${ev.title}`;
    const description = `ภาระงาน: ${ev.category}\\nสถานที่: ${ev.location}\\nเลขที่คำสั่ง: ${ev.orderNumber}\\nระบบ UniWorkload AI มรภ.นครสวรรค์`;

    icsContent.push(
      'BEGIN:VEVENT',
      `UID:uniworkload-${ev.id}-${Date.now()}@nsru.ac.th`,
      `DTSTAMP:${formatDateToICS(new Date().toISOString().split('T')[0], '00:00')}Z`,
      `DTSTART;TZID=Asia/Bangkok:${dtStart}`,
      `DTEND;TZID=Asia/Bangkok:${dtEnd}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${ev.location || 'มหาวิทยาลัยราชภัฏนครสวรรค์'}`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  });

  icsContent.push('END:VCALENDAR');
  return icsContent.join('\r\n');
}

export function downloadICSFile(events, filename = "uniworkload-schedule.ics") {
  const content = generateICS(events);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
