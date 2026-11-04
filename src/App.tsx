import React, { useState, useEffect, useCallback } from 'react';
import { searchAcademicPapers } from './academicSearch';
import {
  Contact,
  Message,
  Appointment,
  KeywordRule,
  AvailabilityConfig,
  GoogleCalendarEvent,
} from './types';
import {
  INITIAL_CONTACTS,
  INITIAL_MESSAGES,
  INITIAL_RULES,
  INITIAL_APPOINTMENTS,
  INITIAL_AVAILABILITY,
  USER_PHONE,
} from './mockData';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from './services/firebaseAuth';
import {
  fetchCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
  getMockInitialCalendarEvents,
  checkEventConflict,
} from './services/googleCalendar';
import {
  evaluateAutoResponse,
  generateConflictFreeSlots,
} from './services/autoResponder';
import { encryptMessage, initEncryption } from './services/crypto';

import { Sidebar, TabType } from './components/Sidebar';
import { ChatList } from './components/ChatList';
import { ChatWindow } from './components/ChatWindow';
import { AppointmentsView } from './components/AppointmentsView';
import { KeywordRulesView } from './components/KeywordRulesView';
import { CalendarSyncView } from './components/CalendarSyncView';
import { AvailabilitySettingsView } from './components/AvailabilitySettingsView';
import { SecurityView } from './components/SecurityView';
import { SafetyNumberModal } from './components/SafetyNumberModal';
import { SimulatorModal } from './components/SimulatorModal';
import { CipherDetailsModal } from './components/CipherDetailsModal';
import { ConfirmationModal } from './components/ConfirmationModal';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<TabType>('chats');

  // Application Data States
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [selectedContactId, setSelectedContactId] = useState<string>(INITIAL_CONTACTS[0].id);
  const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [rules, setRules] = useState<KeywordRule[]>(INITIAL_RULES);
  const [availability, setAvailability] = useState<AvailabilityConfig>(INITIAL_AVAILABILITY);

  // Google Calendar Integration
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [calendarEvents, setCalendarEvents] = useState<GoogleCalendarEvent[]>(getMockInitialCalendarEvents());
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);

  // Modals & Drawers
  const [safetyModalContact, setSafetyModalContact] = useState<Contact | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [inspectedMessage, setInspectedMessage] = useState<Message | null>(null);

  // User Confirmation Modal (Required for Workspace guidelines)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    details?: string[];
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warn' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Initialize Web Crypto on mount
  useEffect(() => {
    initEncryption().catch(console.error);
  }, []);

  // Fetch real Google Calendar events if token is present
  const refreshCalendarEvents = useCallback(async (token: string) => {
    setIsLoadingCalendar(true);
    try {
      const realEvents = await fetchCalendarEvents(token);
      setCalendarEvents(realEvents);
      showToast('Google Calendar synced successfully! Events updated.', 'success');
    } catch (err: any) {
      console.warn('Could not fetch Google Calendar events:', err);
      showToast('Google Calendar preview mode active.', 'info');
    } finally {
      setIsLoadingCalendar(false);
    }
  }, []);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleConnected(true);
        setGoogleUser(user);
        if (token) {
          refreshCalendarEvents(token);
        }
      },
      () => {
        setGoogleConnected(false);
        setGoogleUser(null);
      }
    );
    return () => unsubscribe();
  }, [refreshCalendarEvents]);

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    try {
      setIsLoadingCalendar(true);
      const res = await googleSignIn();
      if (res) {
        setGoogleConnected(true);
        setGoogleUser(res.user);
        await refreshCalendarEvents(res.accessToken);
        showToast(`Connected as ${res.user.email}! Calendar sync enabled.`, 'success');
      }
    } catch (err: any) {
      console.error('Google Calendar login error:', err);
      showToast(`Sign in canceled or failed: ${err.message}`, 'warn');
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  // Google Logout Handler
  const handleGoogleLogout = async () => {
    await logout();
    setGoogleConnected(false);
    setGoogleUser(null);
    setCalendarEvents(getMockInitialCalendarEvents());
    showToast('Disconnected from Google Calendar.', 'info');
  };

  // Contact Selection
  const selectedContact = contacts.find((c) => c.id === selectedContactId) || contacts[0];

  // Send an outgoing WhatsApp message from user
 const handleSendMessage = async (text: string) => {
  const encPayload = await encryptMessage(text);
  const now = new Date();
  const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    chatId: selectedContact.id,
    sender: 'user',
    text,
    timestamp,
  };

  // Add the user message to state
  setMessages((prev) => [...prev, newMessage]);

  // --- ACADEMIC RESEARCH INTEGRATION ---
  const isResearch = text.toLowerCase().includes('research') || text.toLowerCase().includes('paper');

  if (isResearch) {
    const papers = await searchAcademicPapers(text);

    const responseText = papers.length > 0
      ? papers.map((p, i) => 
          `**${i + 1}. ${p.title}** (${p.year || 'N/A'})\n` +
          `*Authors:* ${p.authors.map(a => a.name).join(', ')}\n` +
          `*Abstract:* ${p.abstract ? p.abstract.slice(0, 150) + '...' : 'No abstract available.'}\n` +
          `[Link to Paper](${p.url})`
        ).join('\n\n---\n\n')
      : "No research papers found for this topic.";

    const botMessage: Message = {
      id: `msg-${Date.now() + 1}`,
      chatId: selectedContact.id,
      sender: 'bot',
      text: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, botMessage]);
    return; // Stops here so it doesn't trigger default bot replies
  }

  // --- YOUR EXISTING APP LOGIC CONTINUES BELOW ---
  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    chatId: selectedContact.id,
    sender: 'user',
    text,
    timestamp,
  };

  // Add the new user message to the conversation state
  setMessages([...messages, newMessage]);
  // --- ACADEMIC RESEARCH INTEGRATION START ---
  const isResearch = text.toLowerCase().includes('research') || text.toLowerCase().includes('paper');

  if (isResearch) {
    const papers = await searchAcademicPapers(text);

    const responseText = papers.length > 0
      ? papers.map((p, i) => 
          `**${i + 1}. ${p.title}** (${p.year || 'N/A'})\n` +
          `*Authors:* ${p.authors.map(a => a.name).join(', ')}\n` +
          `*Abstract:* ${p.abstract ? p.abstract.slice(0, 150) + '...' : 'No abstract available.'}\n` +
          `[Link to Paper](${p.url})`
        ).join('\n\n---\n\n')
      : "No research papers found for this topic.";

    const botMessage: Message = {
      id: `msg-${Date.now() + 1}`,
      chatId: selectedContact.id,
      sender: 'bot',
      text: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, botMessage]);
    return; // Prevents executing standard automated responses below
  }
  // --- ACADEMIC RESEARCH INTEGRATION END ---

  // Keep all of your existing message logic below this line...
    const encPayload = await encryptMessage(text);
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      chatId: selectedContact.id,
      sender: 'user',
      text,
      timestamp,
      status: 'sent',
      isEncrypted: true,
      encryptedData: encPayload,
    };

    setMessages((prev) => ({
      ...prev,
      [selectedContact.id]: [...(prev[selectedContact.id] || []), newMessage],
    }));
  };

  // Simulate an incoming WhatsApp message from a contact and trigger auto-responder
  const handleSimulateIncoming = async (text: string, contactId = selectedContact.id) => {
    const contact = contacts.find((c) => c.id === contactId) || selectedContact;
    setSelectedContactId(contact.id);

    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const encIncoming = await encryptMessage(text);
    const incomingMsg: Message = {
      id: `msg-in-${Date.now()}`,
      chatId: contact.id,
      sender: 'contact',
      text,
      timestamp,
      status: 'read',
      isEncrypted: true,
      encryptedData: encIncoming,
    };

    // Append incoming message
    setMessages((prev) => ({
      ...prev,
      [contact.id]: [...(prev[contact.id] || []), incomingMsg],
    }));

    // Evaluate Auto-Response logic
    const evalResult = evaluateAutoResponse({
      incomingText: text,
      contact,
      rules,
      availability,
      calendarEvents,
      appointments,
    });

    if (evalResult.shouldReply) {
      // Simulate typing delay (1.2s)
      setTimeout(async () => {
        const botEncPayload = await encryptMessage(evalResult.replyText);
        const botTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const botMsg: Message = {
          id: `msg-bot-${Date.now()}`,
          chatId: contact.id,
          sender: 'bot',
          text: evalResult.replyText,
          timestamp: botTimestamp,
          status: 'read',
          isEncrypted: true,
          encryptedData: botEncPayload,
          appointmentData: evalResult.suggestedAppointment
            ? {
                id: `apt-prop-${Date.now()}`,
                title: evalResult.suggestedAppointment.title,
                date: evalResult.suggestedAppointment.date,
                time: evalResult.suggestedAppointment.time,
                durationMinutes: evalResult.suggestedAppointment.durationMinutes,
                status: 'proposed',
              }
            : undefined,
        };

        setMessages((prev) => ({
          ...prev,
          [contact.id]: [...(prev[contact.id] || []), botMsg],
        }));

        // Increment rule trigger count if a rule was matched
        if (evalResult.matchedRule) {
          setRules((prev) =>
            prev.map((r) =>
              r.id === evalResult.matchedRule!.id
                ? { ...r, triggerCount: r.triggerCount + 1 }
                : r
            )
          );
        }

        showToast(`WhatsBot auto-responded to ${contact.name}!`, 'success');
      }, 1200);
    }
  };

  // Direct Book Appointment from WhatsApp Chat Proposal Card
  const handleBookFromChat = async (slot: { date: string; time: string; title: string }) => {
    // 1. Conflict check
    const conflict = checkEventConflict(
      calendarEvents,
      slot.date,
      slot.time,
      availability.slotDurationMinutes
    );

    if (conflict.hasConflict) {
      showToast(`Conflict detected: ${conflict.reason}`, 'warn');
      return;
    }

    // 2. Present user confirmation before pushing to Google Calendar (Workspace guideline requirement)
    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Appointment & Sync with Google Calendar',
      message: `Schedule an appointment with ${selectedContact.name} on ${slot.date} at ${slot.time}?`,
      details: [
        `Client: ${selectedContact.name} (${selectedContact.phone})`,
        `Time: ${slot.date} at ${slot.time} (${availability.slotDurationMinutes} mins)`,
        `Calendar Sync: Automatically add event to your primary Google Calendar`,
        `Notification: Send end-to-end encrypted confirmation to client via WhatsApp`,
      ],
      confirmLabel: 'Confirm & Schedule',
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        await executeBookAppointment({
          contactId: selectedContact.id,
          contactName: selectedContact.name,
          contactPhone: selectedContact.phone,
          title: slot.title,
          date: slot.date,
          time: slot.time,
          durationMinutes: availability.slotDurationMinutes,
          status: 'confirmed',
          notes: 'Booked directly via WhatsApp chat card with Google Calendar sync.',
          source: 'whatsapp_bot',
          googleCalendarSynced: false,
        });
      },
    });
  };

  // Core execution of booking appointment
  const executeBookAppointment = async (
    aptData: Omit<Appointment, 'id' | 'createdAt'>
  ) => {
    const aptId = `apt-${Date.now()}`;
    let googleSynced = false;
    let googleEventId: string | undefined = undefined;

    // Check if Google token is available
    const token = await getAccessToken();
    if (token) {
      try {
        const [year, month, day] = aptData.date.split('-').map(Number);
        const [hour, min] = aptData.time.split(':').map(Number);
        const start = new Date(year, month - 1, day, hour, min);
        const end = new Date(start.getTime() + aptData.durationMinutes * 60 * 1000);

        const created = await createCalendarEvent(token, {
          summary: `[WhatsBot] ${aptData.title}`,
          description: `Appointment with ${aptData.contactName} (${aptData.contactPhone})\nNotes: ${aptData.notes || 'N/A'}\nManaged via WhatsBot Flow.`,
          startDateTime: start.toISOString(),
          endDateTime: end.toISOString(),
        });

        googleSynced = true;
        googleEventId = created.id;
        setCalendarEvents((prev) => [created, ...prev]);
        showToast('Appointment successfully created in Google Calendar!', 'success');
      } catch (e: any) {
        console.warn('Google Calendar creation failed:', e);
        showToast('Created locally. Google Calendar sync requires active authorization.', 'info');
      }
    } else {
      // In preview mode without active token, simulate sync
      googleSynced = true;
      googleEventId = `mock-event-${Date.now()}`;
      setCalendarEvents((prev) => [
        {
          id: googleEventId!,
          summary: `[WhatsBot] ${aptData.title}`,
          start: { dateTime: `${aptData.date}T${aptData.time}:00Z` },
          end: {
            dateTime: new Date(
              new Date(`${aptData.date}T${aptData.time}:00Z`).getTime() +
                aptData.durationMinutes * 60 * 1000
            ).toISOString(),
          },
        },
        ...prev,
      ]);
      showToast('Appointment scheduled and synced with calendar engine!', 'success');
    }

    const newAppointment: Appointment = {
      ...aptData,
      id: aptId,
      createdAt: new Date().toISOString(),
      googleCalendarSynced: googleSynced,
      googleCalendarEventId: googleEventId,
    };

    setAppointments((prev) => [newAppointment, ...prev]);

    // Send encrypted WhatsApp confirmation message to contact
    const confText = `✅ *Appointment Confirmed!*\n\n• *Event:* ${aptData.title}\n• *Date:* ${aptData.date}\n• *Time:* ${aptData.time} (${aptData.durationMinutes} mins)\n• *Status:* Confirmed & Synced with Google Calendar\n\nA calendar invite has been reserved. Reply anytime if you need to reschedule!`;
    const encConf = await encryptMessage(confText);
    const confMsg: Message = {
      id: `msg-conf-${Date.now()}`,
      chatId: aptData.contactId,
      sender: 'bot',
      text: confText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      isEncrypted: true,
      encryptedData: encConf,
    };

    setMessages((prev) => ({
      ...prev,
      [aptData.contactId]: [...(prev[aptData.contactId] || []), confMsg],
    }));
  };

  // Sync an existing appointment to Google Calendar
  const handleSyncToGoogleCalendar = async (apt: Appointment) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Sync Appointment to Google Calendar',
      message: `Push "${apt.title}" on ${apt.date} at ${apt.time} to your primary Google Calendar?`,
      details: [
        `Client: ${apt.contactName}`,
        `Duration: ${apt.durationMinutes} minutes`,
        `Operation: Add new Google Calendar event`,
      ],
      confirmLabel: 'Push to Calendar',
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        const token = await getAccessToken();
        if (token) {
          try {
            const [year, month, day] = apt.date.split('-').map(Number);
            const [hour, min] = apt.time.split(':').map(Number);
            const start = new Date(year, month - 1, day, hour, min);
            const end = new Date(start.getTime() + apt.durationMinutes * 60 * 1000);

            const created = await createCalendarEvent(token, {
              summary: `[WhatsBot] ${apt.title}`,
              description: `Appointment with ${apt.contactName} (${apt.contactPhone})\nNotes: ${apt.notes}`,
              startDateTime: start.toISOString(),
              endDateTime: end.toISOString(),
            });

            setAppointments((prev) =>
              prev.map((a) =>
                a.id === apt.id
                  ? { ...a, googleCalendarSynced: true, googleCalendarEventId: created.id }
                  : a
              )
            );
            setCalendarEvents((prev) => [created, ...prev]);
            showToast('Event pushed to Google Calendar!', 'success');
          } catch (e: any) {
            showToast(`Sync failed: ${e.message}`, 'warn');
          }
        } else {
          // Preview sync
          setAppointments((prev) =>
            prev.map((a) => (a.id === apt.id ? { ...a, googleCalendarSynced: true } : a))
          );
          showToast('Appointment synced with calendar schedule.', 'success');
        }
      },
    });
  };

  // Cancel an appointment (with confirmation)
  const handleCancelAppointment = (apt: Appointment) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Cancel Appointment',
      message: `Are you sure you want to cancel "${apt.title}" with ${apt.contactName}?`,
      details: [
        `Date & Time: ${apt.date} at ${apt.time}`,
        apt.googleCalendarSynced
          ? 'Google Calendar event will be removed'
          : 'Will mark appointment as cancelled in manager',
        'An encrypted cancellation notification will be sent via WhatsApp',
      ],
      confirmLabel: 'Cancel Appointment',
      isDestructive: true,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));

        if (apt.googleCalendarEventId) {
          const token = await getAccessToken();
          if (token) {
            try {
              await deleteCalendarEvent(token, apt.googleCalendarEventId);
            } catch (err) {
              console.warn('Could not delete from Google Calendar:', err);
            }
          }
          setCalendarEvents((prev) => prev.filter((e) => e.id !== apt.googleCalendarEventId));
        }

        setAppointments((prev) =>
          prev.map((a) => (a.id === apt.id ? { ...a, status: 'cancelled' } : a))
        );

        // Notify client in WhatsApp
        const cancelText = `⚠️ *Appointment Cancelled*\n\nThe appointment "${apt.title}" scheduled for ${apt.date} at ${apt.time} has been cancelled. Please let me know if you would like to reschedule!`;
        const enc = await encryptMessage(cancelText);
        setMessages((prev) => ({
          ...prev,
          [apt.contactId]: [
            ...(prev[apt.contactId] || []),
            {
              id: `msg-cancel-${Date.now()}`,
              chatId: apt.contactId,
              sender: 'bot',
              text: cancelText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'sent',
              isEncrypted: true,
              encryptedData: enc,
            },
          ],
        }));

        showToast('Appointment cancelled and client notified.', 'info');
      },
    });
  };

  // Send WhatsApp Reminder
  const handleSendReminder = async (apt: Appointment) => {
    const reminderText = `🔔 *Reminder: Upcoming Appointment*\n\nHi ${apt.contactName}! Just a reminder about our upcoming meeting "${apt.title}" on *${apt.date} at ${apt.time}*.\n\nLooking forward to speaking with you!`;
    const enc = await encryptMessage(reminderText);
    const msg: Message = {
      id: `msg-rem-${Date.now()}`,
      chatId: apt.contactId,
      sender: 'bot',
      text: reminderText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      isEncrypted: true,
      encryptedData: enc,
    };

    setMessages((prev) => ({
      ...prev,
      [apt.contactId]: [...(prev[apt.contactId] || []), msg],
    }));

    showToast(`WhatsApp reminder dispatched to ${apt.contactName}!`, 'success');
  };

  // Toggle Verification of a Contact's Safety Number
  const handleToggleVerify = (contactId: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, isVerified: !c.isVerified } : c))
    );
    showToast('Contact security status updated.', 'info');
  };

  // Toggle Bot Mode
  const handleToggleBotMode = () => {
    const modes: AvailabilityConfig['botMode'][] = ['autonomous', 'assistive', 'off'];
    const currentIdx = modes.indexOf(availability.botMode);
    const nextMode = modes[(currentIdx + 1) % modes.length];
    setAvailability((prev) => ({ ...prev, botMode: nextMode }));
    showToast(`Bot mode switched to: ${nextMode.toUpperCase()}`, 'info');
  };

  const unreadTotal = contacts.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0c1317] font-sans antialiased select-none">
      {/* Toast Notification Bar */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div
            className={`px-4 py-2.5 rounded-xl shadow-2xl border text-xs font-semibold flex items-center gap-2 backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-[#00a884] text-white border-emerald-400/30 shadow-emerald-950/50'
                : toast.type === 'warn'
                ? 'bg-amber-600 text-white border-amber-400/30'
                : 'bg-[#202c33] text-slate-100 border-[#2a3942]'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadTotal={unreadTotal}
        appointmentsCount={appointments.filter((a) => a.status === 'confirmed').length}
        rulesCount={rules.filter((r) => r.isActive).length}
        googleConnected={googleConnected}
        googleEmail={googleUser?.email}
        availability={availability}
        onToggleBotMode={handleToggleBotMode}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
      />

      {/* Primary Workspace View */}
      <main className="flex-1 flex h-full overflow-hidden">
        {activeTab === 'chats' && (
          <div className="flex-1 flex h-full overflow-hidden">
            <ChatList
              contacts={contacts}
              selectedContactId={selectedContactId}
              onSelectContact={(id) => {
                setSelectedContactId(id);
                // Mark as read
                setContacts((prev) =>
                  prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
                );
              }}
              messages={messages}
            />
            <ChatWindow
              contact={selectedContact}
              messages={messages[selectedContact.id] || []}
              onSendMessage={handleSendMessage}
              onSimulateIncoming={(text) => handleSimulateIncoming(text, selectedContact.id)}
              onOpenSafetyNumber={(c) => setSafetyModalContact(c)}
              onBookAppointmentFromChat={handleBookFromChat}
              availability={availability}
              calendarEvents={calendarEvents}
              appointments={appointments}
              onOpenCipherModal={(msg) => setInspectedMessage(msg)}
            />
          </div>
        )}

        {activeTab === 'appointments' && (
          <AppointmentsView
            appointments={appointments}
            contacts={contacts}
            calendarEvents={calendarEvents}
            googleConnected={googleConnected}
            onBookAppointment={executeBookAppointment}
            onSyncToGoogleCalendar={handleSyncToGoogleCalendar}
            onCancelAppointment={handleCancelAppointment}
            onSendWhatsAppReminder={handleSendReminder}
            onOpenCalendarSyncView={() => setActiveTab('calendar')}
          />
        )}

        {activeTab === 'rules' && (
          <KeywordRulesView
            rules={rules}
            onAddRule={(newRule) => {
              const rule: KeywordRule = {
                ...newRule,
                id: `rule-${Date.now()}`,
                triggerCount: 0,
              };
              setRules((prev) => [rule, ...prev]);
              showToast('Keyword rule created successfully!', 'success');
            }}
            onUpdateRule={(updated) => {
              setRules((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
              showToast('Rule updated!', 'success');
            }}
            onDeleteRule={(id) => {
              setRules((prev) => prev.filter((r) => r.id !== id));
              showToast('Rule deleted.', 'info');
            }}
            availability={availability}
            contacts={contacts}
            calendarEvents={calendarEvents}
            appointments={appointments}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarSyncView
            events={calendarEvents}
            appointments={appointments}
            googleConnected={googleConnected}
            userEmail={googleUser?.email}
            userName={googleUser?.displayName}
            userPhoto={googleUser?.photoURL}
            isLoading={isLoadingCalendar}
            onLogin={handleGoogleSignIn}
            onLogout={handleGoogleLogout}
            onSyncRefresh={async () => {
              const token = await getAccessToken();
              if (token) {
                await refreshCalendarEvents(token);
              } else {
                setCalendarEvents(getMockInitialCalendarEvents());
                showToast('Refreshed local calendar cache.', 'info');
              }
            }}
          />
        )}

        {activeTab === 'availability' && (
          <AvailabilitySettingsView
            availability={availability}
            onUpdateAvailability={(newConfig) => {
              setAvailability(newConfig);
              showToast('Availability & hours updated!', 'success');
            }}
          />
        )}

        {activeTab === 'security' && (
          <SecurityView
            contacts={contacts}
            onOpenSafetyNumber={(c) => setSafetyModalContact(c)}
            onToggleVerify={handleToggleVerify}
          />
        )}
      </main>

      {/* Safety Number Modal (E2EE 60-digit verification) */}
      <SafetyNumberModal
        contact={safetyModalContact}
        isOpen={Boolean(safetyModalContact)}
        onClose={() => setSafetyModalContact(null)}
        onToggleVerify={(cid) => {
          handleToggleVerify(cid);
          setSafetyModalContact((prev) => (prev ? { ...prev, isVerified: !prev.isVerified } : null));
        }}
      />

      {/* Simulator Modal (Incoming client message generator) */}
      <SimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        contacts={contacts}
        rules={rules}
        onTriggerSimulation={(cid, text) => {
          setActiveTab('chats');
          handleSimulateIncoming(text, cid);
        }}
      />

      {/* Cipher Payload Inspector Modal */}
      <CipherDetailsModal
        isOpen={Boolean(inspectedMessage)}
        message={inspectedMessage}
        onClose={() => setInspectedMessage(null)}
      />

      {/* Mandatory User Confirmation Modal for Destructive Workspace Operations */}
      <ConfirmationModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        details={confirmDialog.details}
        confirmLabel={confirmDialog.confirmLabel}
        isDestructive={confirmDialog.isDestructive}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
