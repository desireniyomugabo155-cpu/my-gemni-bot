export interface Contact {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  online: boolean;
  lastSeen?: string;
  unreadCount: number;
  safetyNumber: string; // 60-digit safety number grouped in blocks of 5
  keyFingerprint: string;
  isVerified: boolean;
  about?: string;
}

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  tag?: string;
  algorithm: string;
  keyFingerprint: string;
}

export interface Message {
  id: string;
  chatId: string;
  sender: 'user' | 'contact' | 'bot';
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  isEncrypted: boolean;
  encryptedData?: EncryptedPayload;
  appointmentData?: {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    durationMinutes: number;
    status: 'proposed' | 'confirmed' | 'cancelled';
    googleEventId?: string;
    hasConflict?: boolean;
    conflictReason?: string;
  };
}

export interface Appointment {
  id: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationMinutes: number;
  status: 'confirmed' | 'rescheduled' | 'cancelled' | 'completed';
  notes?: string;
  source: 'whatsapp_bot' | 'manual';
  googleCalendarEventId?: string;
  googleCalendarSynced: boolean;
  createdAt: string;
}

export interface KeywordRule {
  id: string;
  name: string;
  keywords: string[]; // e.g. ["book", "schedule", "appointment"]
  matchType: 'contains' | 'exact' | 'startsWith';
  responseTemplate: string;
  actionType: 'reply_only' | 'offer_scheduling' | 'send_pricing' | 'send_hours' | 'escalate';
  isActive: boolean;
  triggerCount: number;
}

export interface AvailabilityConfig {
  workingDays: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  workStartTime: string; // "09:00"
  workEndTime: string; // "17:00"
  slotDurationMinutes: number; // 30, 45, 60
  bufferMinutes: number; // 15
  lunchBreakStart: string; // "12:00"
  lunchBreakEnd: string; // "13:00"
  enableAfterHoursReply: boolean;
  afterHoursMessage: string;
  botMode: 'autonomous' | 'assistive' | 'off';
  timezone: string;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  location?: string;
  htmlLink?: string;
  status?: string;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingEvents: GoogleCalendarEvent[];
  reason?: string;
}
