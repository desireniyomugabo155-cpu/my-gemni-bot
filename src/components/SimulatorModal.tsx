import React, { useState } from 'react';
import { Contact, KeywordRule } from '../types';
import {
  Zap,
  X,
  Send,
  Sparkles,
  Bot,
  Calendar,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface SimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  rules: KeywordRule[];
  onTriggerSimulation: (contactId: string, text: string) => void;
}

export const SimulatorModal: React.FC<SimulatorModalProps> = ({
  isOpen,
  onClose,
  contacts,
  rules,
  onTriggerSimulation,
}) => {
  const [selectedContactId, setSelectedContactId] = useState(contacts[0]?.id || '');
  const [customText, setCustomText] = useState('');

  if (!isOpen) return null;

  const presets = [
    {
      label: '📅 Auto-Schedule Request',
      text: 'Good morning! Can I book an appointment with you for a 30-min strategy review?',
      desc: 'Checks Google Calendar in real-time and replies with available conflict-free slots',
    },
    {
      label: '💼 Pricing & Rates Inquiry',
      text: 'Hi, what are your service packages and hourly consulting rates?',
      desc: 'Triggers the pricing keyword auto-response template',
    },
    {
      label: '🕒 Business Hours & Office',
      text: 'What are your working hours and office location this week?',
      desc: 'Triggers the operational availability and working hours template',
    },
    {
      label: '🚨 Emergency Alert',
      text: 'URGENT: Our production database is failing, need immediate advice!',
      desc: 'Triggers priority escalation auto-reply and notifies manager',
    },
    {
      label: '🔄 Reschedule Request',
      text: 'Hi Desire, I need to reschedule our upcoming meeting to another day.',
      desc: 'Triggers slot generator with alternate conflict-free times',
    },
  ];

  const handleSend = (text: string) => {
    onTriggerSimulation(selectedContactId, text);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#111b21] border border-[#2a3942] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#202c33] border-b border-[#2a3942] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Zap className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Simulate WhatsApp Message</h3>
              <p className="text-xs text-slate-400">Test Bot Auto-Response &amp; Calendar Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#2a3942]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Contact selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Simulate Message From Client:
            </label>
            <select
              value={selectedContactId}
              onChange={(e) => setSelectedContactId(e.target.value)}
              className="w-full px-3 py-2 bg-[#202c33] rounded-xl text-xs text-white border border-[#2a3942] focus:outline-none focus:border-[#00a884]"
            >
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select a Test Scenario:
            </label>
            <div className="space-y-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(preset.text)}
                  className="w-full text-left p-3 rounded-xl bg-[#182229] hover:bg-[#202c33] border border-[#26353d] hover:border-[#00a884] transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white group-hover:text-[#00a884] transition-colors">
                      {preset.label}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 group-hover:text-emerald-400">
                      <span>Simulate</span>
                      <Send className="w-3 h-3" />
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium mb-1">&quot;{preset.text}&quot;</p>
                  <p className="text-[10px] text-slate-500">{preset.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom text */}
          <div className="pt-2 border-t border-[#26353d]">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Or Send Custom WhatsApp Message:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type any message..."
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="flex-1 px-3 py-2 bg-[#202c33] rounded-xl text-xs text-white placeholder-slate-400 border border-[#2a3942] focus:outline-none focus:border-[#00a884]"
              />
              <button
                type="button"
                disabled={!customText.trim()}
                onClick={() => handleSend(customText)}
                className="px-4 py-2 bg-[#00a884] hover:bg-[#029070] disabled:bg-[#2a3942] disabled:text-slate-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
