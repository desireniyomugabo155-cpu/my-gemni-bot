import {
  Contact,
  KeywordRule,
  AvailabilityConfig,
  GoogleCalendarEvent,
  Appointment,
} from '../types';
import { checkEventConflict } from './googleCalendar';

export interface AutoResponseResult {
  shouldReply: boolean;
  replyText: string;
  matchedRule?: KeywordRule;
  reason: 'keyword_match' | 'after_hours' | 'booking_requested';
  suggestedAppointment?: {
    date: string;
    time: string;
    title: string;
    durationMinutes: number;
  };
  availableSlots?: Array<{
    date: string;
    displayDate: string;
    time: string;
    displayTime: string;
  }>;
}

/**
 * Checks if current time is within user's configured working hours
 */
export function isWithinWorkingHours(config: AvailabilityConfig, date = new Date()): boolean {
  const day = date.getDay();
  if (!config.workingDays.includes(day)) {
    return false;
  }

  const [startHour, startMin] = config.workStartTime.split(':').map(Number);
  const [endHour, endMin] = config.workEndTime.split(':').map(Number);

  const currentMinutes = date.getHours() * 60 + date.getMinutes();
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

/**
 * Generates available conflict-free slots over next few business days
 */
export function generateConflictFreeSlots(
  config: AvailabilityConfig,
  calendarEvents: GoogleCalendarEvent[],
  existingAppointments: Appointment[],
  daysToLookAhead = 3
): Array<{ date: string; displayDate: string; time: string; displayTime: string }> {
  const slots: Array<{ date: string; displayDate: string; time: string; displayTime: string }> = [];
  const now = new Date();

  // Convert existing appointments to GoogleCalendarEvent-like objects for conflict check
  const appointmentEvents: GoogleCalendarEvent[] = existingAppointments
    .filter((a) => a.status === 'confirmed')
    .map((a) => {
      const [year, month, day] = a.date.split('-').map(Number);
      const [hours, minutes] = a.time.split(':').map(Number);
      const start = new Date(year, month - 1, day, hours, minutes);
      const end = new Date(start.getTime() + a.durationMinutes * 60 * 1000);
      return {
        id: a.id,
        summary: `Appointment with ${a.contactName}`,
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
      };
    });

  const allEventsToCheck = [...calendarEvents, ...appointmentEvents];

  for (let offset = 0; offset <= daysToLookAhead + 2; offset++) {
    if (slots.length >= 4) break;

    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + offset);

    // Skip if not a working day
    if (!config.workingDays.includes(targetDate.getDay())) continue;

    const [startH, startM] = config.workStartTime.split(':').map(Number);
    const [endH, endM] = config.workEndTime.split(':').map(Number);
    const [lunchStartH] = config.lunchBreakStart.split(':').map(Number);
    const [lunchEndH] = config.lunchBreakEnd.split(':').map(Number);

    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // Loop through intervals
    let currentMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    while (currentMinutes + config.slotDurationMinutes <= endMinutes) {
      if (slots.length >= 4) break;

      const hour = Math.floor(currentMinutes / 60);
      const minute = currentMinutes % 60;
      const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

      // Skip past hours if today
      if (offset === 0) {
        const slotDateTime = new Date(year, targetDate.getMonth(), targetDate.getDate(), hour, minute);
        if (slotDateTime.getTime() <= now.getTime() + 30 * 60 * 1000) {
          currentMinutes += config.slotDurationMinutes + config.bufferMinutes;
          continue;
        }
      }

      // Skip lunch break
      if (hour >= lunchStartH && hour < lunchEndH) {
        currentMinutes += config.slotDurationMinutes;
        continue;
      }

      // Check Google Calendar conflict
      const conflict = checkEventConflict(allEventsToCheck, dateStr, timeStr, config.slotDurationMinutes);

      if (!conflict.hasConflict) {
        const displayDate = targetDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
        const displayTime = new Date(
          year,
          targetDate.getMonth(),
          targetDate.getDate(),
          hour,
          minute
        ).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });

        slots.push({
          date: dateStr,
          displayDate,
          time: timeStr,
          displayTime,
        });
      }

      currentMinutes += config.slotDurationMinutes + config.bufferMinutes;
    }
  }

  return slots;
}

/**
 * Process an incoming WhatsApp message through the Auto-Responder engine
 */
export function evaluateAutoResponse(params: {
  incomingText: string;
  contact: Contact;
  rules: KeywordRule[];
  availability: AvailabilityConfig;
  calendarEvents: GoogleCalendarEvent[];
  appointments: Appointment[];
  userName?: string;
}): AutoResponseResult {
  const { incomingText, contact, rules, availability, calendarEvents, appointments, userName = 'You' } = params;

  if (availability.botMode === 'off') {
    return { shouldReply: false, replyText: '', reason: 'keyword_match' };
  }

  const cleanText = incomingText.trim().toLowerCase();

  // 1. Check if message is a booking / scheduling intent
  const isBookingQuery =
    cleanText.includes('schedule') ||
    cleanText.includes('book') ||
    cleanText.includes('appointment') ||
    cleanText.includes('meeting') ||
    cleanText.includes('time slot') ||
    cleanText.includes('availab');

  // Generate conflict-free slots
  const availableSlots = generateConflictFreeSlots(availability, calendarEvents, appointments);

  if (isBookingQuery) {
    const slotsListText = availableSlots.length > 0
      ? availableSlots.map((s, idx) => `${idx + 1}. *${s.displayDate} at ${s.displayTime}*`).join('\n')
      : 'Currently no slots free this week due to full calendar bookings.';

    const suggestedSlot = availableSlots[0];

    const reply = `Hi ${contact.name}! 📅 I've checked Google Calendar to ensure zero scheduling conflicts.\n\nHere are our next available conflict-free slots:\n${slotsListText}\n\nTap a slot or reply with your preferred number to instantly confirm the appointment!`;

    return {
      shouldReply: true,
      replyText: reply,
      reason: 'booking_requested',
      availableSlots,
      suggestedAppointment: suggestedSlot
        ? {
            date: suggestedSlot.date,
            time: suggestedSlot.time,
            title: `Meeting with ${contact.name}`,
            durationMinutes: availability.slotDurationMinutes,
          }
        : undefined,
    };
  }

  // 2. Evaluate Custom Keyword Rules
  for (const rule of rules) {
    if (!rule.isActive) continue;

    let isMatch = false;

    for (const kw of rule.keywords) {
      const cleanKw = kw.trim().toLowerCase();
      if (!cleanKw) continue;

      if (rule.matchType === 'exact') {
        if (cleanText === cleanKw) {
          isMatch = true;
          break;
        }
      } else if (rule.matchType === 'startsWith') {
        if (cleanText.startsWith(cleanKw)) {
          isMatch = true;
          break;
        }
      } else {
        // contains
        if (cleanText.includes(cleanKw)) {
          isMatch = true;
          break;
        }
      }
    }

    if (isMatch) {
      // Replace dynamic variables in template
      let reply = rule.responseTemplate
        .replace(/\{client_name\}/gi, contact.name)
        .replace(/\{contact_name\}/gi, contact.name)
        .replace(/\{user_name\}/gi, userName)
        .replace(/\{business_hours\}/gi, `${availability.workStartTime} - ${availability.workEndTime}`)
        .replace(
          /\{available_slots\}/gi,
          availableSlots.slice(0, 3).map((s) => `${s.displayDate} @ ${s.displayTime}`).join(', ')
        );

      // If rule is offer_scheduling, attach slots
      if (rule.actionType === 'offer_scheduling') {
        reply += `\n\n📅 Available slots:\n` +
          availableSlots.map((s, i) => `${i + 1}. ${s.displayDate} at ${s.displayTime}`).join('\n');
      }

      return {
        shouldReply: true,
        replyText: reply,
        matchedRule: rule,
        reason: 'keyword_match',
        availableSlots,
      };
    }
  }

  // 3. Availability check: Outside working hours auto-response
  const withinHours = isWithinWorkingHours(availability);
  if (!withinHours && availability.enableAfterHoursReply) {
    const afterHoursReply = availability.afterHoursMessage
      .replace(/\{client_name\}/gi, contact.name)
      .replace(/\{business_hours\}/gi, `${availability.workStartTime} - ${availability.workEndTime}`);

    return {
      shouldReply: true,
      replyText: `${afterHoursReply}\n\nIf you would like to book a time in advance, reply *schedule*!`,
      reason: 'after_hours',
      availableSlots,
    };
  }

  return {
    shouldReply: false,
    replyText: '',
    reason: 'keyword_match',
  };
}
