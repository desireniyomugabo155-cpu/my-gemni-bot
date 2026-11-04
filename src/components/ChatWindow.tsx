import React, { useState, useRef, useEffect } from 'react';
import {
  Contact,
  Message,
  AvailabilityConfig,
  GoogleCalendarEvent,
  Appointment,
} from '../types';
import {
  ShieldCheck,
  Lock,
  Send,
  Calendar,
  CheckCheck,
  Bot,
  Zap,
  Info,
  Clock,
  Sparkles,
  Phone,
  Video,
  Check,
  AlertCircle,
  Eye,
} from 'lucide-react';

interface ChatWindowProps {
  contact: Contact;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onSimulateIncoming: (text: string) => void;
  onOpenSafetyNumber: (contact: Contact) => void;
  onBookAppointmentFromChat: (slot: { date: string; time: string; title: string }) => void;
  availability: AvailabilityConfig;
  calendarEvents: GoogleCalendarEvent[];
  appointments: Appointment[];
  onOpenCipherModal?: (msg: Message) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  contact,
  messages,
  onSendMessage,
  onSimulateIncoming,
  onOpenSafetyNumber,
  onBookAppointmentFromChat,
  availability,
  onOpenCipherModal,
}) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const quickKeywordTriggers = [
    { label: '📅 schedule', prompt: 'Hi, can I book an appointment with you?' },
    { label: '💼 pricing', prompt: 'What are your rates and pricing packages?' },
    { label: '🕒 hours', prompt: 'What are your business hours and location?' },
    { label: '🚨 urgent', prompt: 'URGENT: need emergency assistance asap!' },
    { label: '🔄 reschedule', prompt: 'Can we reschedule our meeting time?' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b141a] relative overflow-hidden">
      {/* WhatsApp Wallpaper texture overlay */}
      <div
        className="absolute inset-0 opacity-4 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(#00a884 1px, transparent 1px), radial-gradient(#2a3942 1px, #0b141a 1px)',
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px',
        }}
      />

      {/* Chat Header */}
      <div className="h-16 px-4 bg-[#202c33] border-b border-[#222e35] flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative">
            <img
              src={contact.avatar}
              alt={contact.name}
              className="w-10 h-10 rounded-full object-cover border border-[#2a3942]"
            />
            {contact.online && (
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#202c33]" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white truncate">{contact.name}</h2>
              {contact.isVerified ? (
                <button
                  onClick={() => onOpenSafetyNumber(contact)}
                  title="Verified end-to-end encryption. Click to view safety number."
                  className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                >
                  <ShieldCheck className="w-3 h-3 text-[#00a884]" />
                  <span>E2EE Verified</span>
                </button>
              ) : (
                <button
                  onClick={() => onOpenSafetyNumber(contact)}
                  className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 hover:bg-amber-500/20 transition-colors flex items-center gap-1"
                >
                  <Lock className="w-3 h-3" />
                  <span>Verify Key</span>
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {contact.online ? 'Online' : contact.lastSeen || contact.phone}
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenSafetyNumber(contact)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#2a3942] transition-colors flex items-center gap-1.5 text-xs font-medium"
            title="Inspect End-to-End Encryption Keys"
          >
            <Lock className="w-4 h-4 text-[#00a884]" />
            <span className="hidden sm:inline text-slate-300">Safety Code</span>
          </button>
          <div className="w-px h-5 bg-[#2a3942] mx-1" />
          <button
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#2a3942] transition-colors"
            title="Voice Call (End-to-end encrypted)"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#2a3942] transition-colors"
            title="Video Call (End-to-end encrypted)"
          >
            <Video className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Encryption Banner */}
      <div className="bg-[#182229]/90 border-b border-[#222e35] px-4 py-2 flex items-center justify-between text-xs text-slate-400 z-10">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-[#00a884] shrink-0" />
          <span className="text-[11px]">
            Messages are end-to-end encrypted with AES-256-GCM. No third party can read them.
          </span>
        </div>
        <button
          onClick={() => onOpenSafetyNumber(contact)}
          className="text-[11px] text-[#00a884] hover:underline font-medium shrink-0 ml-2"
        >
          Verify Safety Number
        </button>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 z-10">
        {/* Date header */}
        <div className="flex justify-center my-2">
          <span className="bg-[#182229] border border-[#222e35] text-slate-400 text-[11px] font-medium px-3 py-1 rounded-full shadow-sm">
            Today
          </span>
        </div>

        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isBot = msg.sender === 'bot';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${
                isUser ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 shadow-md relative group transition-all ${
                  isUser
                    ? 'bg-[#005c4b] text-white rounded-tr-xs'
                    : isBot
                    ? 'bg-[#02473a] text-emerald-50 border border-emerald-500/20 rounded-tl-xs'
                    : 'bg-[#202c33] text-slate-100 rounded-tl-xs'
                }`}
              >
                {/* Bot Label */}
                {isBot && (
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-300 font-semibold mb-1 pb-1 border-b border-emerald-500/20">
                    <Bot className="w-3 h-3 text-emerald-400" />
                    <span>WhatsBot Flow • Auto-Responder</span>
                    <span className="text-[9px] bg-emerald-950/60 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                      Calendar Synced
                    </span>
                  </div>
                )}

                {/* Message Text with bold formatting */}
                <div className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-line select-text">
                  {msg.text.split('\n').map((line, lidx) => {
                    // Quick markdown parser for *bold* and bullet points
                    const parts = line.split(/(\*[^*]+\*)/g);
                    return (
                      <div key={lidx} className="min-h-[1.25em]">
                        {parts.map((p, pidx) => {
                          if (p.startsWith('*') && p.endsWith('*')) {
                            return (
                              <strong key={pidx} className="font-bold text-white">
                                {p.slice(1, -1)}
                              </strong>
                            );
                          }
                          return p;
                        })}
                      </div>
                    );
                  })}
                </div>

                {/* Interactive Appointment Card if present */}
                {msg.appointmentData && (
                  <div className="mt-3 pt-3 border-t border-emerald-500/20 bg-[#111b21]/60 p-3 rounded-xl">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#00a884]" />
                        <span className="text-xs font-semibold text-white">
                          {msg.appointmentData.title}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium capitalize">
                        {msg.appointmentData.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-300 space-y-1 mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {msg.appointmentData.date} at {msg.appointmentData.time} ({msg.appointmentData.durationMinutes} mins)
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                        <Check className="w-3 h-3" />
                        <span>Google Calendar Conflict Check: Verified Available</span>
                      </div>
                    </div>

                    {msg.appointmentData.status === 'proposed' && (
                      <button
                        onClick={() =>
                          onBookAppointmentFromChat({
                            date: msg.appointmentData!.date,
                            time: msg.appointmentData!.time,
                            title: msg.appointmentData!.title,
                          })
                        }
                        className="w-full py-1.5 px-3 rounded-lg bg-[#00a884] hover:bg-[#029070] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        Confirm Booking &amp; Add to Google Calendar
                      </button>
                    )}
                  </div>
                )}

                {/* Bubble Footer: Timestamp, Encryption lock, Read ticks, Cipher inspect */}
                <div className="flex items-center justify-end gap-1.5 mt-1 text-[10px] text-slate-300/80">
                  {msg.isEncrypted && (
                    <button
                      onClick={() => onOpenCipherModal?.(msg)}
                      title="End-to-End Encrypted (AES-256-GCM). Click to inspect ciphertext."
                      className="opacity-70 hover:opacity-100 transition-opacity"
                    >
                      <Lock className="w-2.5 h-2.5 text-[#00a884]" />
                    </button>
                  )}
                  <span>{msg.timestamp}</span>
                  {isUser && (
                    <CheckCheck
                      className={`w-3.5 h-3.5 ${
                        msg.status === 'read' ? 'text-[#53bdeb]' : 'text-slate-400'
                      }`}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-[#202c33] px-3.5 py-2 rounded-2xl w-fit">
            <span className="w-2 h-2 rounded-full bg-[#00a884] animate-bounce"></span>
            <span
              className="w-2 h-2 rounded-full bg-[#00a884] animate-bounce"
              style={{ animationDelay: '0.2s' }}
            ></span>
            <span
              className="w-2 h-2 rounded-full bg-[#00a884] animate-bounce"
              style={{ animationDelay: '0.4s' }}
            ></span>
            <span className="text-[11px] text-slate-300 ml-1">
              {contact.name} is typing...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Keyword Simulation Strip */}
      <div className="px-4 py-2 bg-[#182229] border-t border-[#222e35] z-10">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            Test Client Triggers:
          </span>
          {quickKeywordTriggers.map((trig, idx) => (
            <button
              key={idx}
              onClick={() => onSimulateIncoming(trig.prompt)}
              className="px-2.5 py-1 rounded-lg bg-[#202c33] hover:bg-[#2a3942] text-[11px] text-slate-200 hover:text-white border border-[#2a3942] shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
              title={`Simulate ${contact.name} sending: "${trig.prompt}"`}
            >
              <span>{trig.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Message Composer */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-[#202c33] border-t border-[#222e35] flex items-center gap-2 z-10 shrink-0"
      >
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={`Type a message to ${contact.name} (E2EE encrypted)...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-[#2a3942] rounded-2xl text-xs sm:text-sm text-white placeholder-slate-400 border border-[#374954] focus:outline-none focus:border-[#00a884] transition-colors"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-400">
            <span title="End-to-End Encrypted">
              <Lock className="w-3.5 h-3.5 text-[#00a884]" />
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={!inputText.trim()}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            inputText.trim()
              ? 'bg-[#00a884] hover:bg-[#029070] text-white shadow-md'
              : 'bg-[#2a3942] text-slate-500 cursor-not-allowed'
          }`}
          title="Send Encrypted Message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
