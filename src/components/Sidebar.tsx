import React from 'react';
import {
  MessageSquare,
  Calendar,
  Sparkles,
  ShieldCheck,
  Clock,
  CalendarDays,
  Bot,
  Zap,
  Power,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { AvailabilityConfig } from '../types';

export type TabType = 'chats' | 'appointments' | 'rules' | 'calendar' | 'availability' | 'security';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  unreadTotal: number;
  appointmentsCount: number;
  rulesCount: number;
  googleConnected: boolean;
  googleEmail?: string | null;
  availability: AvailabilityConfig;
  onToggleBotMode: () => void;
  onOpenSimulator: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  unreadTotal,
  appointmentsCount,
  rulesCount,
  googleConnected,
  googleEmail,
  availability,
  onToggleBotMode,
  onOpenSimulator,
}) => {
  const navItems = [
    {
      id: 'chats' as TabType,
      label: 'WhatsApp Chats',
      icon: MessageSquare,
      badge: unreadTotal > 0 ? unreadTotal : undefined,
      description: 'Conversations & Live Messages',
    },
    {
      id: 'appointments' as TabType,
      label: 'Appointments',
      icon: Calendar,
      badge: appointmentsCount > 0 ? appointmentsCount : undefined,
      description: 'Scheduled & Confirmed Bookings',
    },
    {
      id: 'rules' as TabType,
      label: 'Auto-Responder Rules',
      icon: Sparkles,
      badge: rulesCount,
      description: 'Custom Keywords & Triggers',
    },
    {
      id: 'calendar' as TabType,
      label: 'Google Calendar Sync',
      icon: CalendarDays,
      badge: googleConnected ? 'Active' : 'Offline',
      badgeColor: googleConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400',
      description: 'Conflict Checking Engine',
    },
    {
      id: 'availability' as TabType,
      label: 'Availability & Hours',
      icon: Clock,
      description: 'Working Hours & Away Bot',
    },
    {
      id: 'security' as TabType,
      label: 'Encryption (E2EE)',
      icon: ShieldCheck,
      badge: 'AES-256',
      badgeColor: 'bg-emerald-500/20 text-[#00a884]',
      description: 'Safety Numbers & Keys',
    },
  ];

  return (
    <aside className="w-72 sm:w-80 bg-[#111b21] border-r border-[#222e35] flex flex-col h-full shrink-0 select-none">
      {/* Brand & Bot Header */}
      <div className="p-4 border-b border-[#222e35] bg-[#1a252d]/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00a884] to-emerald-400 p-0.5 shadow-lg shadow-emerald-950/50 flex items-center justify-center">
              <div className="w-full h-full bg-[#111b21] rounded-[14px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-[#00a884]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-sm tracking-tight text-white">WhatsBot Flow</h1>
                <span className="text-[10px] px-1.5 py-0.2 bg-[#00a884]/20 text-[#00a884] font-medium rounded-full border border-[#00a884]/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                WhatsApp Business Manager
              </p>
            </div>
          </div>
        </div>

        {/* Bot Status Card */}
        <div className="mt-3 bg-[#111b21] border border-[#26353d] rounded-xl p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                availability.botMode === 'autonomous'
                  ? 'bg-emerald-500/20 text-[#00a884]'
                  : availability.botMode === 'assistive'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              <Power className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-200 capitalize">
                Bot: {availability.botMode}
              </div>
              <div className="text-[10px] text-slate-400">
                {availability.botMode === 'autonomous'
                  ? 'Auto-reply & bookings on'
                  : availability.botMode === 'assistive'
                  ? 'Generates drafts only'
                  : 'Bot responder paused'}
              </div>
            </div>
          </div>
          <button
            onClick={onToggleBotMode}
            title="Toggle Bot automation mode"
            className="text-[11px] px-2 py-1 rounded-lg bg-[#202c33] hover:bg-[#2a3942] text-slate-300 hover:text-white border border-[#2a3942] transition-colors"
          >
            Switch
          </button>
        </div>

        {/* Quick Simulator Launcher */}
        <button
          onClick={onOpenSimulator}
          className="mt-2.5 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-[#00a884] hover:from-emerald-500 hover:to-[#029070] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-emerald-950/40 transition-all cursor-pointer group"
        >
          <Zap className="w-3.5 h-3.5 fill-white group-hover:scale-110 transition-transform" />
          <span>Simulate Incoming Client Message</span>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 px-3 py-1">
          Workspace Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between group transition-all ${
                isActive
                  ? 'bg-[#202c33] text-white shadow-sm border border-[#2a3942]'
                  : 'text-slate-400 hover:bg-[#182229] hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive
                      ? 'bg-[#00a884] text-white'
                      : 'bg-[#182229] text-slate-400 group-hover:text-slate-200 border border-[#222e35]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{item.description}</div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.badgeColor
                        ? item.badgeColor
                        : isActive
                        ? 'bg-[#00a884] text-white'
                        : 'bg-[#26353d] text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform ${
                    isActive ? 'text-[#00a884] translate-x-0.5' : 'text-slate-600 opacity-0 group-hover:opacity-100'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </nav>

      {/* Integration & Security Status Footer */}
      <div className="p-3 border-t border-[#222e35] bg-[#111b21] space-y-2">
        <div className="p-2.5 rounded-xl bg-[#182229] border border-[#222e35] text-[11px] flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                googleConnected ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <div className="truncate">
              <div className="text-slate-300 font-medium truncate">
                {googleConnected ? 'Google Calendar Synced' : 'Calendar Standby'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {googleConnected && googleEmail ? googleEmail : 'Conflict check ready'}
              </div>
            </div>
          </div>
          <button
            onClick={() => onTabChange('calendar')}
            className="text-[10px] text-[#00a884] hover:underline shrink-0 flex items-center gap-0.5 font-medium ml-1"
          >
            <span>View</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
        </div>

        {/* Encryption badge */}
        <div className="px-2 py-1.5 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00a884]" />
            E2EE Protocol: AES-256-GCM
          </span>
          <span className="text-emerald-400 font-mono">Secured</span>
        </div>
      </div>
    </aside>
  );
};
