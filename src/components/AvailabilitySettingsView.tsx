import React, { useState } from 'react';
import { AvailabilityConfig } from '../types';
import {
  Clock,
  Calendar,
  Save,
  Check,
  Power,
  Moon,
  Coffee,
  Shield,
  Bot,
} from 'lucide-react';

interface AvailabilitySettingsViewProps {
  availability: AvailabilityConfig;
  onUpdateAvailability: (config: AvailabilityConfig) => void;
}

export const AvailabilitySettingsView: React.FC<AvailabilitySettingsViewProps> = ({
  availability,
  onUpdateAvailability,
}) => {
  const [formData, setFormData] = useState<AvailabilityConfig>(availability);
  const [saved, setSaved] = useState(false);

  const days = [
    { label: 'Sun', value: 0 },
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
  ];

  const handleDayToggle = (dayVal: number) => {
    const current = formData.workingDays;
    const next = current.includes(dayVal)
      ? current.filter((d) => d !== dayVal)
      : [...current, dayVal].sort();
    setFormData({ ...formData, workingDays: next });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAvailability(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#111b21] overflow-hidden text-slate-100">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-[#202c33] border-b border-[#222e35] flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Availability &amp; Working Hours
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00a884]/20 text-[#00a884] font-medium border border-[#00a884]/30">
              Bot Schedule Controller
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure your business hours, lunch break buffer, and after-hours automated response policy.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="py-2.5 px-4 rounded-xl bg-[#00a884] hover:bg-[#029070] text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Saved Successfully!' : 'Save Changes'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Bot Automation Mode */}
        <div className="bg-[#182229] border border-[#26353d] rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Bot className="w-5 h-5 text-[#00a884]" />
            <h2>Bot Automation Mode</h2>
          </div>
          <p className="text-xs text-slate-400">
            Select how the WhatsApp bot handles customer inquiries and calendar slot bookings:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {[
              {
                mode: 'autonomous' as const,
                title: 'Autonomous Bot',
                desc: 'Auto-replies in ~1.5s and books conflict-free slots on Google Calendar automatically.',
              },
              {
                mode: 'assistive' as const,
                title: 'Assistive Co-Pilot',
                desc: 'Prepares auto-replies and suggested slots as drafts for you to approve.',
              },
              {
                mode: 'off' as const,
                title: 'Bot Paused',
                desc: 'Auto-responder is inactive. Only manual chat messages are sent.',
              },
            ].map((option) => (
              <button
                type="button"
                key={option.mode}
                onClick={() => setFormData({ ...formData, botMode: option.mode })}
                className={`p-4 rounded-xl text-left border transition-all ${
                  formData.botMode === option.mode
                    ? 'bg-[#111b21] border-[#00a884] shadow-md shadow-emerald-950/40'
                    : 'bg-[#111b21]/50 border-[#26353d] hover:border-[#374954]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">{option.title}</span>
                  {formData.botMode === option.mode && (
                    <Check className="w-4 h-4 text-[#00a884]" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{option.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Working Days */}
        <div className="bg-[#182229] border border-[#26353d] rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Calendar className="w-5 h-5 text-[#00a884]" />
            <h2>Active Working Days</h2>
          </div>
          <p className="text-xs text-slate-400">
            Appointments will only be offered on these selected days:
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {days.map((d) => {
              const isSelected = formData.workingDays.includes(d.value);
              return (
                <button
                  type="button"
                  key={d.value}
                  onClick={() => handleDayToggle(d.value)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-[#00a884] text-white shadow-sm'
                      : 'bg-[#111b21] text-slate-400 hover:text-white border border-[#26353d]'
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Business Hours & Lunch Break */}
        <div className="bg-[#182229] border border-[#26353d] rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Clock className="w-5 h-5 text-[#00a884]" />
            <h2>Hours &amp; Meeting Buffers</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Work Start Time
              </label>
              <input
                type="time"
                value={formData.workStartTime}
                onChange={(e) => setFormData({ ...formData, workStartTime: e.target.value })}
                className="w-full px-3 py-2 bg-[#111b21] rounded-xl text-xs text-white border border-[#2a3942] focus:outline-none focus:border-[#00a884]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Work End Time
              </label>
              <input
                type="time"
                value={formData.workEndTime}
                onChange={(e) => setFormData({ ...formData, workEndTime: e.target.value })}
                className="w-full px-3 py-2 bg-[#111b21] rounded-xl text-xs text-white border border-[#2a3942] focus:outline-none focus:border-[#00a884]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Slot Duration
              </label>
              <select
                value={formData.slotDurationMinutes}
                onChange={(e) =>
                  setFormData({ ...formData, slotDurationMinutes: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-[#111b21] rounded-xl text-xs text-white border border-[#2a3942] focus:outline-none focus:border-[#00a884]"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Buffer Between Meetings
              </label>
              <select
                value={formData.bufferMinutes}
                onChange={(e) =>
                  setFormData({ ...formData, bufferMinutes: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-[#111b21] rounded-xl text-xs text-white border border-[#2a3942] focus:outline-none focus:border-[#00a884]"
              >
                <option value={0}>0 Minutes</option>
                <option value={10}>10 Minutes</option>
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
              </select>
            </div>
          </div>

          {/* Lunch Break / Focus Block */}
          <div className="pt-2 border-t border-[#26353d] flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Coffee className="w-4 h-4 text-amber-400" />
              <span>Lunch / Focus Block (No slots offered):</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <input
                type="time"
                value={formData.lunchBreakStart}
                onChange={(e) => setFormData({ ...formData, lunchBreakStart: e.target.value })}
                className="px-2.5 py-1.5 bg-[#111b21] rounded-lg text-xs text-white border border-[#2a3942]"
              />
              <span className="text-slate-400">to</span>
              <input
                type="time"
                value={formData.lunchBreakEnd}
                onChange={(e) => setFormData({ ...formData, lunchBreakEnd: e.target.value })}
                className="px-2.5 py-1.5 bg-[#111b21] rounded-lg text-xs text-white border border-[#2a3942]"
              />
            </div>
          </div>
        </div>

        {/* After-Hours Auto-Responder */}
        <div className="bg-[#182229] border border-[#26353d] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-400" />
              <div>
                <h2 className="text-sm font-bold text-white">After-Hours Auto-Responder</h2>
                <p className="text-xs text-slate-400">
                  Automatically message clients who text outside your working hours or on weekends
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableAfterHoursReply}
                onChange={(e) =>
                  setFormData({ ...formData, enableAfterHoursReply: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[#202c33] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00a884]"></div>
            </label>
          </div>

          {formData.enableAfterHoursReply && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                After-Hours Automated Reply Template
              </label>
              <textarea
                rows={3}
                value={formData.afterHoursMessage}
                onChange={(e) => setFormData({ ...formData, afterHoursMessage: e.target.value })}
                className="w-full px-3 py-2 bg-[#111b21] rounded-xl text-xs text-white placeholder-slate-400 border border-[#2a3942] focus:outline-none focus:border-[#00a884]"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Supports tags: &#123;client_name&#125;, &#123;business_hours&#125;
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
