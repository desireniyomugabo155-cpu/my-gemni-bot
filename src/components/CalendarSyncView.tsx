import React, { useState } from 'react';
import { GoogleCalendarEvent, Appointment } from '../types';
import { checkEventConflict } from '../services/googleCalendar';
import {
  CalendarDays,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Calendar,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface CalendarSyncViewProps {
  events: GoogleCalendarEvent[];
  appointments: Appointment[];
  googleConnected: boolean;
  userEmail?: string | null;
  userName?: string | null;
  userPhoto?: string | null;
  isLoading: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onSyncRefresh: () => void;
}

export const CalendarSyncView: React.FC<CalendarSyncViewProps> = ({
  events,
  appointments,
  googleConnected,
  userEmail,
  userName,
  userPhoto,
  isLoading,
  onLogin,
  onLogout,
  onSyncRefresh,
}) => {
  // Conflict tester
  const [testDate, setTestDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [testTime, setTestTime] = useState('14:00');
  const [testDuration, setTestDuration] = useState(45);

  const testConflict = checkEventConflict(events, testDate, testTime, testDuration);

  // Combine Google events + WhatsApp appointments sorted by date/time
  const combinedAgenda = [
    ...events.map((e) => {
      const startIso = e.start.dateTime || e.start.date || '';
      return {
        id: e.id,
        title: e.summary || 'Busy on Google Calendar',
        startIso,
        type: 'google' as const,
        displayTime: startIso
          ? new Date(startIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'All day',
        displayDate: startIso ? new Date(startIso).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '',
      };
    }),
    ...appointments
      .filter((a) => a.status === 'confirmed')
      .map((a) => {
        const startIso = `${a.date}T${a.time}:00`;
        return {
          id: a.id,
          title: `[WhatsApp] ${a.title} (${a.contactName})`,
          startIso,
          type: 'whatsapp' as const,
          displayTime: `${a.time} (${a.durationMinutes}m)`,
          displayDate: new Date(startIso).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        };
      }),
  ].sort((a, b) => new Date(a.startIso).getTime() - new Date(b.startIso).getTime());

  return (
    <div className="flex-1 flex flex-col h-full bg-[#111b21] overflow-hidden text-slate-100">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-[#202c33] border-b border-[#222e35] flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Google Calendar Sync Hub</h1>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                googleConnected
                  ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              }`}
            >
              {googleConnected ? 'Connected & Active' : 'Offline Preview Mode'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time calendar synchronization to prevent double-bookings across your WhatsApp automated scheduling bot.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSyncRefresh}
            disabled={isLoading}
            className="py-2 px-3.5 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-xs font-semibold text-slate-200 hover:text-white border border-[#2a3942] flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#00a884] ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Events Now</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Google Account Authentication Status Card */}
        <div className="bg-[#182229] border border-[#26353d] rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {googleConnected && userPhoto ? (
                <img
                  src={userPhoto}
                  alt={userName || 'User'}
                  className="w-12 h-12 rounded-full border-2 border-[#00a884]"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <CalendarDays className="w-6 h-6" />
                </div>
              )}

              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{googleConnected ? userName || 'Google Workspace Connected' : 'Google Calendar Authorization'}</span>
                  {googleConnected && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      OAuth Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {googleConnected
                    ? userEmail || 'Connected to primary Google Calendar'
                    : 'Connect your Google account to enable live two-way calendar sync'}
                </p>
              </div>
            </div>

            <div>
              {googleConnected ? (
                <button
                  onClick={onLogout}
                  className="px-4 py-2 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-xs font-medium text-slate-300 hover:text-white border border-[#2a3942] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              ) : (
                /* Official Sign in with Google Button from workspace skill */
                <button
                  onClick={onLogin}
                  className="inline-flex items-center gap-3 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Real-Time Conflict Test Inspector */}
        <div className="bg-[#182229] border border-[#26353d] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#00a884]" />
              <h2 className="text-sm font-bold text-white">Live Conflict Prevention Tester</h2>
            </div>
            <span className="text-xs text-slate-400">Validate any proposed booking slot</span>
          </div>

          <p className="text-xs text-slate-300">
            Whenever a WhatsApp client asks for an appointment, WhatsBot Flow queries this engine before offering times to guarantee zero double bookings.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Date</label>
              <input
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#111b21] rounded-xl text-xs text-white border border-[#2a3942] focus:outline-none focus:border-[#00a884]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Time</label>
              <input
                type="time"
                value={testTime}
                onChange={(e) => setTestTime(e.target.value)}
                className="w-full px-3 py-2 bg-[#111b21] rounded-xl text-xs text-white border border-[#2a3942] focus:outline-none focus:border-[#00a884]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Duration (Mins)
              </label>
              <select
                value={testDuration}
                onChange={(e) => setTestDuration(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#111b21] rounded-xl text-xs text-white border border-[#2a3942] focus:outline-none focus:border-[#00a884]"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>
          </div>

          {/* Test Result Callout */}
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 transition-all ${
              testConflict.hasConflict
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-200'
                : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-200'
            }`}
          >
            {testConflict.hasConflict ? (
              <>
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-rose-300">Conflict Detected! Slot Blocked.</div>
                  <p className="mt-0.5 text-xs text-rose-200/90">{testConflict.reason}</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    The bot will automatically skip this time and suggest alternate conflict-free slots to the customer.
                  </p>
                </div>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-emerald-300">Slot Free &amp; Verified Available</div>
                  <p className="mt-0.5 text-xs text-emerald-200/90">
                    No collisions found with Google Calendar on {testDate} at {testTime}.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Combined Agenda View */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Integrated Calendar Agenda ({combinedAgenda.length} Events)
            </h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-sky-400">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                Google Calendar
              </span>
              <span className="flex items-center gap-1.5 text-[#00a884]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00a884]" />
                WhatsApp Booked
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {combinedAgenda.length === 0 ? (
              <div className="p-8 text-center bg-[#182229] rounded-2xl border border-[#222e35] text-xs text-slate-400">
                No calendar events found in this window.
              </div>
            ) : (
              combinedAgenda.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                    item.type === 'google'
                      ? 'bg-[#182229] border-sky-500/20 hover:border-sky-500/40'
                      : 'bg-[#182229] border-emerald-500/20 hover:border-emerald-500/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        item.type === 'google'
                          ? 'bg-sky-500/20 text-sky-400'
                          : 'bg-emerald-500/20 text-[#00a884]'
                      }`}
                    >
                      {item.type === 'google' ? (
                        <CalendarDays className="w-4 h-4" />
                      ) : (
                        <Calendar className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{item.title}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>{item.displayDate}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-300">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {item.displayTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md shrink-0 ${
                      item.type === 'google'
                        ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                        : 'bg-emerald-500/10 text-[#00a884] border border-emerald-500/20'
                    }`}
                  >
                    {item.type === 'google' ? 'Google Sync' : 'WhatsApp'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
