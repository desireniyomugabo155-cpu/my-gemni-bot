import { GoogleCalendarEvent, ConflictCheckResult } from '../types';

/**
 * Google Calendar REST API Integration (Client-Side)
 * Endpoint: https://www.googleapis.com/calendar/v3/calendars/primary/events
 */

export async function fetchCalendarEvents(
  accessToken: string,
  timeMin?: string,
  timeMax?: string
): Promise<GoogleCalendarEvent[]> {
  const url = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
  url.searchParams.set('singleEvents', 'true');
  url.searchParams.set('orderBy', 'startTime');
  url.searchParams.set('maxResults', '50');

  const now = new Date();
  const defaultMin = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toISOString();
  const defaultMax = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30).toISOString();

  url.searchParams.set('timeMin', timeMin || defaultMin);
  url.searchParams.set('timeMax', timeMax || defaultMax);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Calendar API error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return (data.items || []).filter((item: GoogleCalendarEvent) => item.status !== 'cancelled');
}

export async function createCalendarEvent(
  accessToken: string,
  params: {
    summary: string;
    description: string;
    startDateTime: string; // ISO string e.g. 2026-11-05T10:00:00Z
    endDateTime: string;   // ISO string e.g. 2026-11-05T10:45:00Z
    timeZone?: string;
  }
): Promise<GoogleCalendarEvent> {
  const payload = {
    summary: params.summary,
    description: params.description,
    start: {
      dateTime: params.startDateTime,
      timeZone: params.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: params.endDateTime,
      timeZone: params.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    reminders: {
      useDefault: true,
    },
  };

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to create calendar event (${res.status}): ${errorText}`);
  }

  return await res.json();
}

export async function deleteCalendarEvent(
  accessToken: string,
  eventId: string
): Promise<void> {
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok && res.status !== 404 && res.status !== 410) {
    const err = await res.text();
    throw new Error(`Failed to delete calendar event (${res.status}): ${err}`);
  }
}

/**
 * Checks if a requested slot (dateStr: YYYY-MM-DD, timeStr: HH:mm) overlaps with
 * any existing Google Calendar events.
 */
export function checkEventConflict(
  events: GoogleCalendarEvent[],
  dateStr: string,
  timeStr: string,
  durationMinutes: number
): ConflictCheckResult {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);

  const slotStart = new Date(year, month - 1, day, hours, minutes, 0, 0);
  const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);

  const conflicts: GoogleCalendarEvent[] = [];

  for (const event of events) {
    let eventStart: Date | null = null;
    let eventEnd: Date | null = null;

    if (event.start?.dateTime) {
      eventStart = new Date(event.start.dateTime);
    } else if (event.start?.date) {
      // All-day event
      const [ey, em, ed] = event.start.date.split('-').map(Number);
      eventStart = new Date(ey, em - 1, ed, 0, 0, 0);
    }

    if (event.end?.dateTime) {
      eventEnd = new Date(event.end.dateTime);
    } else if (event.end?.date) {
      const [ey, em, ed] = event.end.date.split('-').map(Number);
      eventEnd = new Date(ey, em - 1, ed, 23, 59, 59);
    }

    if (eventStart && eventEnd) {
      // Check interval overlap: (StartA < EndB) and (EndA > StartB)
      const overlaps = slotStart < eventEnd && slotEnd > eventStart;
      if (overlaps) {
        conflicts.push(event);
      }
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    conflictingEvents: conflicts,
    reason:
      conflicts.length > 0
        ? `Overlaps with "${conflicts[0].summary || 'Busy'}" on Google Calendar (${new Date(
            conflicts[0].start.dateTime || conflicts[0].start.date || ''
          ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
        : undefined,
  };
}

/**
 * Sample realistic calendar events for when user has not yet signed in with Google
 * so conflict checking and appointment scheduling can be demonstrated immediately!
 */
export function getMockInitialCalendarEvents(): GoogleCalendarEvent[] {
  const today = new Date();
  const formatIso = (d: Date) => d.toISOString();

  // Create events for today and tomorrow
  const makeEvent = (
    id: string,
    summary: string,
    dayOffset: number,
    startHour: number,
    durationHours: number
  ): GoogleCalendarEvent => {
    const s = new Date(today);
    s.setDate(s.getDate() + dayOffset);
    s.setHours(startHour, 0, 0, 0);

    const e = new Date(s);
    e.setHours(startHour + durationHours, 0, 0, 0);

    return {
      id,
      summary,
      start: { dateTime: formatIso(s) },
      end: { dateTime: formatIso(e) },
      status: 'confirmed',
    };
  };

  return [
    makeEvent('mock-1', 'Product Strategy Review', 0, 10, 1),
    makeEvent('mock-2', 'Lunch & Weekly Sync', 0, 12, 1),
    makeEvent('mock-3', 'Client Onboarding Call', 0, 14, 1),
    makeEvent('mock-4', 'Sprint Planning', 1, 11, 2),
    makeEvent('mock-5', 'Investor Update Meeting', 1, 15, 1),
    makeEvent('mock-6', 'Design System Architecture', 2, 9, 2),
    makeEvent('mock-7', 'Doctor Appointment', 2, 14, 1),
  ];
}
