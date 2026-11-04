import React, { useState } from 'react';
import { Contact, Message } from '../types';
import { Search, ShieldCheck, CheckCheck, Lock } from 'lucide-react';

interface ChatListProps {
  contacts: Contact[];
  selectedContactId: string;
  onSelectContact: (id: string) => void;
  messages: Record<string, Message[]>;
}

export const ChatList: React.FC<ChatListProps> = ({
  contacts,
  selectedContactId,
  onSelectContact,
  messages,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'verified'>('all');

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === 'unread') return c.unreadCount > 0;
    if (filter === 'verified') return c.isVerified;
    return true;
  });

  return (
    <div className="w-80 sm:w-96 bg-[#111b21] border-r border-[#222e35] flex flex-col h-full shrink-0">
      {/* Top Bar */}
      <div className="p-3.5 bg-[#202c33] border-b border-[#222e35] flex items-center justify-between">
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          <span>Chats</span>
          <span className="text-xs font-normal text-slate-400 bg-[#111b21] px-2 py-0.5 rounded-full border border-[#2a3942]">
            {contacts.length}
          </span>
        </h2>
        <div className="flex items-center gap-1.5 text-xs text-[#00a884] font-medium bg-[#111b21] px-2.5 py-1 rounded-lg border border-[#2a3942]">
          <Lock className="w-3.5 h-3.5" />
          <span>E2EE Active</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-[#222e35] space-y-2.5 bg-[#111b21]">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search contacts or start new chat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#202c33] rounded-xl text-xs text-white placeholder-slate-400 border border-[#2a3942] focus:outline-none focus:border-[#00a884] transition-colors"
          />
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5">
          {(['all', 'unread', 'verified'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium capitalize transition-all ${
                filter === tab
                  ? 'bg-[#00a884] text-white shadow-sm'
                  : 'bg-[#202c33] text-slate-400 hover:text-slate-200 hover:bg-[#2a3942]'
              }`}
            >
              {tab === 'all' ? 'All Chats' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#1e2a30]">
        {filteredContacts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No conversations match your filter.
          </div>
        ) : (
          filteredContacts.map((contact) => {
            const isSelected = selectedContactId === contact.id;
            const contactMessages = messages[contact.id] || [];
            const lastMessage = contactMessages[contactMessages.length - 1];

            return (
              <button
                key={contact.id}
                onClick={() => onSelectContact(contact.id)}
                className={`w-full p-3 text-left flex items-start gap-3 transition-colors ${
                  isSelected
                    ? 'bg-[#2a3942] text-white'
                    : 'hover:bg-[#182229] text-slate-300'
                }`}
              >
                {/* Avatar with online dot */}
                <div className="relative shrink-0">
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#2a3942]"
                  />
                  {contact.online ? (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#111b21]" />
                  ) : null}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-semibold text-xs text-white truncate">
                        {contact.name}
                      </span>
                      {contact.isVerified && (
                        <span title="Verified Safety Number">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#00a884] shrink-0" />
                        </span>
                      )}
                    </div>
                    {lastMessage && (
                      <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                        {lastMessage.timestamp}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 pr-2">
                      {lastMessage?.sender === 'user' && (
                        <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] shrink-0" />
                      )}
                      {lastMessage?.sender === 'bot' && (
                        <span className="text-[9px] px-1 bg-[#00a884]/20 text-[#00a884] rounded font-medium">
                          BOT
                        </span>
                      )}
                      <span className="truncate">
                        {lastMessage?.text || contact.about || 'Start messaging...'}
                      </span>
                    </p>

                    {contact.unreadCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-[#00a884] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
