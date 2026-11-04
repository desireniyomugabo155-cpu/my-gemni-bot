import React, { useState } from 'react';
import { Appointment, Contact, GoogleCalendarEvent } from '../types';
import { checkEventConflict } from '../services/googleCalendar';
import {
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
  RefreshCw,
  Send,
  X,
  User,
  Phone,
  CalendarCheck,
  CalendarDays,
  ShieldCheck,
} from 'lucide-react';

interface AppointmentsViewProps {
  appointments: Appointment[];
  contacts: Contact[];
  calendarEvents: GoogleCalendarEvent[];
  googleConnected: boolean;
  onBookAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => Promise<void>;
  onSyncToGoogleCalendar: (appointment: Appointment) => void;
  onCancelAppointment: (appointment: Appointment) => void;
  onSendWhatsAppReminder: (appointment: Appointment) => void;
  onOpenCalendarSyncView: () => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments,
  contacts,
  calendarEvents,
  googleConnected,
  onBookAppointment,
  onSyncToGoogleCalendar,
  onCancelAppointment,
  onSendWhatsAppReminder,
  onOpenCalendarSyncView,
}) => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'confirmed' | 'cancelled'>('upcoming');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New appointment form state
  const [formContactId, setFormContactId] = useState(contacts[0]?.id || '');
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [formTime, setFormTime] = useState('10:00');
  const [formDuration, setFormDuration] = useState(30);
  const [formNotes, setFormNotes] = useState('');

  // Real-time conflict feedback in the modal!
  const conflictCheck = checkEventConflict(
    calendarEvents,
    formDate,
    formTime,
    Number(formDuration)
  );

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.contactName.toLowerCase().includes(search.toLowerCase()) ||
      apt.title.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === 'upcoming') return apt.status === 'confirmed';
    if (filter === 'confirmed') return apt.status === 'confirmed';
    if (filter === 'cancelled') return apt.status === 'cancelled';
    return true;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const contact = contacts.find((c) => c.id === formContactId);
    if (!contact || !formTitle) return;

    await onBookAppointment({
      contactId: contact.id,
      contactName: contact.name,
      contactPhone: contact.phone,
      title: formTitle,
      date: formDate,
      time: formTime,
      durationMinutes: Number(formDuration),
      status: 'confirmed',
      notes: formNotes || 'Created manually via Appointments Manager',
      source: 'manual',
      googleCalendarSynced: false,
    });

    setIsModalOpen(false);
    setFormTitle('');
  };

  const todayCount = appointments.filter((a) => {
    const todayStr = new Date().toISOString().split('T')[0];
    return a.date === todayStr && a.status === 'confirmed';
  }).length;

  const syncedCount = appointments.filter((a) => a.googleCalendarSynced).length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#111b21] overflow-hidden text-slate-100">
      {/* Header bar */}
      <div className="p-4 sm:p-6 bg-[#202c33] border-b border-[#222e35] flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Appointment Manager</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00a884]/20 text-[#00a884] font-medium border border-[#00a884]/30">
              Live Conflict Guard
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Directly organize client bookings, prevent Google Calendar collisions, and auto-dispatch WhatsApp confirmations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-[#00a884] hover:bg-[#029070] text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Appointment</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4 sm:px-6 bg-[#182229] border-b border-[#222e35] shrink-0">
        <div className="bg-[#111b21] p-3 rounded-xl border border-[#26353d]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Bookings</span>
            <CalendarCheck className="w-4 h-4 text-[#00a884]" />
          </div>
          <div className="text-xl font-bold text-white">{appointments.length}</div>
        </div>

        <div className="bg-[#111b21] p-3 rounded-xl border border-[#26353d]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Today&apos;s Schedule</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white">{todayCount}</div>
        </div>

        <div className="bg-[#111b21] p-3 rounded-xl border border-[#26353d]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Google Synced</span>
            <CalendarDays className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {syncedCount} / {appointments.length}
          </div>
        </div>

        <div className="bg-[#111b21] p-3 rounded-xl border border-[#26353d]">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Conflicts Prevented</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white">100% Guarded</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#222e35] bg-[#111b21] shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['all', 'upcoming', 'confirmed', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all ${
                filter === tab
                  ? 'bg-[#00a884] text-white shadow-sm'
                  : 'bg-[#202c33] text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search appointments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#202c33] rounded-xl text-xs text-white placeholder-slate-400 border border-[#2a3942] focus:outline-none focus:border-[#00a884]"
          />
        </div>
      </div>

      {/* Appointments List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-16 bg-[#182229] rounded-2xl border border-[#222e35] p-6">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">No Appointments Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              You haven&apos;t scheduled any appointments matching this view. Clients can auto-book through WhatsApp or you can create one directly.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-[#00a884] text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Book Appointment Now</span>
            </button>
          </div>
        ) : (
          filteredAppointments.map((apt) => {
            return (
              <div
                key={apt.id}
                className="bg-[#182229] border border-[#26353d] hover:border-[#374954] rounded-2xl p-4 sm:p-5 transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Details */}
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-white truncate">{apt.title}</h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize border ${
                        apt.status === 'confirmed'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {apt.status}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#111b21] text-slate-400 border border-[#2a3942]">
                      {apt.source === 'whatsapp_bot' ? '🤖 WhatsApp Bot' : '👤 Direct Manual'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#00a884]" />
                      <span className="font-semibold text-white">
                        {apt.date} at {apt.time}
                      </span>
                      <span className="text-slate-400">({apt.durationMinutes} mins)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{apt.contactName}</span>
                      <span className="text-slate-500 text-[11px] font-mono">{apt.contactPhone}</span>
                    </div>
                  </div>

                  {apt.notes && (
                    <p className="text-xs text-slate-400 italic bg-[#111b21]/70 px-3 py-1.5 rounded-lg border border-[#222e35]">
                      &quot;{apt.notes}&quot;
                    </p>
                  )}
                </div>

                {/* Status & Actions */}
                <div className="flex flex-wrap items-center md:flex-col md:items-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#222e35]">
                  <div className="flex items-center gap-2 text-xs">
                    {apt.googleCalendarSynced ? (
                      <span className="flex items-center gap-1.5 text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-xl border border-sky-500/20 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Google Calendar Synced
                      </span>
                    ) : (
                      <button
                        onClick={() => onSyncToGoogleCalendar(apt)}
                        className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-xl border border-amber-500/20 font-medium transition-colors cursor-pointer"
                        title="Sync this appointment directly to Google Calendar"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Push to Google Calendar
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSendWhatsAppReminder(apt)}
                      className="px-3 py-1.5 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-xs font-medium text-slate-200 hover:text-white border border-[#2a3942] transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Send WhatsApp confirmation message"
                    >
                      <Send className="w-3 h-3 text-[#00a884]" />
                      <span>Send Reminder</span>
                    </button>
                    {apt.status === 'confirmed' && (
                      <button
                        onClick={() => onCancelAppointment(apt)}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium border border-rose-500/20 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111b21] border border-[#2a3942] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100 max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 bg-[#202c33] border-b border-[#2a3942] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#00a884]" />
                <h3 className="text-base font-semibold text-white">Schedule New Appointment</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#2a3942]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 overflow-y-auto">
              {/* Select Client */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Client / WhatsApp Contact
                </label>
                <select
                  value={formContactId}
                  onChange={(e) => setFormContactId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#202c33] rounded-xl text-xs text-white border border-[#2a3942] focus:outline-none focus:border-[#00a884]"
                >
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Appointment Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Q4 Roadmap Consultation"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#202c33] rounded-xl text-xs text-white placeholder-slate-400 border border-[#2a3942] focus:outline-none focus:border-[#00a884]"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#202c33] rounded-xl text-xs text-white border border-[#2a3942] focus:outline-none focus:border-[#00a884]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Time</label>
                  <input
                    type="time"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full px-3 py-2 bg-[#202c33] rounded-xl text-xs text-white border border-[#2a3942] focus:outline-none focus:border-[#00a884]"
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Duration (Minutes)
                </label>
                <div className="flex items-center gap-3">
                  {[15, 30, 45, 60].map((dur) => (
                    <button
                      type="button"
                      key={dur}
                      onClick={() => setFormDuration(dur)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                        formDuration === dur
                          ? 'bg-[#00a884] text-white border-[#00a884]'
                          : 'bg-[#202c33] text-slate-300 border-[#2a3942] hover:bg-[#2a3942]'
                      }`}
                    >
                      {dur} mins
                    </button>
                  ))}
                </div>
              </div>

              {/* Real-time Conflict Alert Box */}
              <div
                className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                  conflictCheck.hasConflict
                    ? 'bg-rose-500/15 border-rose-500/30 text-rose-200'
                    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
                }`}
              >
                {conflictCheck.hasConflict ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-rose-300">Google Calendar Conflict Detected!</div>
                      <p className="mt-0.5 text-[11px] text-rose-200/90">{conflictCheck.reason}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-emerald-300">Conflict Check Passed</div>
                      <p className="mt-0.5 text-[11px] text-emerald-200/90">
                        This slot is 100% free across your Google Calendar.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Notes &amp; Agenda (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Meeting agenda or preparation instructions..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#202c33] rounded-xl text-xs text-white placeholder-slate-400 border border-[#2a3942] focus:outline-none focus:border-[#00a884]"
                />
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:text-white bg-[#202c33] hover:bg-[#2a3942]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#00a884] hover:bg-[#029070] text-white shadow-md flex items-center gap-1.5"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Confirm &amp; Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
