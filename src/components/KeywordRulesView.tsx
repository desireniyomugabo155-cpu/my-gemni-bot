import React, { useState } from 'react';
import { KeywordRule, AvailabilityConfig, Contact, GoogleCalendarEvent, Appointment } from '../types';
import { evaluateAutoResponse } from '../services/autoResponder';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Play,
  Bot,
  Zap,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  Send,
} from 'lucide-react';

interface KeywordRulesViewProps {
  rules: KeywordRule[];
  onAddRule: (rule: Omit<KeywordRule, 'id' | 'triggerCount'>) => void;
  onUpdateRule: (rule: KeywordRule) => void;
  onDeleteRule: (id: string) => void;
  availability: AvailabilityConfig;
  contacts: Contact[];
  calendarEvents: GoogleCalendarEvent[];
  appointments: Appointment[];
}

export const KeywordRulesView: React.FC<KeywordRulesViewProps> = ({
  rules,
  onAddRule,
  onUpdateRule,
  onDeleteRule,
  availability,
  contacts,
  calendarEvents,
  appointments,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<KeywordRule | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [keywordsText, setKeywordsText] = useState('');
  const [matchType, setMatchType] = useState<'contains' | 'exact' | 'startsWith'>('contains');
  const [actionType, setActionType] = useState<KeywordRule['actionType']>('reply_only');
  const [responseTemplate, setResponseTemplate] = useState('');

  // Sandbox testing state
  const [testInput, setTestInput] = useState('Can I book a slot for tomorrow?');
  const [sandboxResult, setSandboxResult] = useState<any>(null);

  const openCreateModal = () => {
    setEditingRule(null);
    setName('');
    setKeywordsText('');
    setMatchType('contains');
    setActionType('reply_only');
    setResponseTemplate('Hi {client_name}! Thank you for your inquiry.');
    setIsModalOpen(true);
  };

  const openEditModal = (rule: KeywordRule) => {
    setEditingRule(rule);
    setName(rule.name);
    setKeywordsText(rule.keywords.join(', '));
    setMatchType(rule.matchType);
    setActionType(rule.actionType);
    setResponseTemplate(rule.responseTemplate);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const keywords = keywordsText
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    if (keywords.length === 0 || !name.trim() || !responseTemplate.trim()) return;

    if (editingRule) {
      onUpdateRule({
        ...editingRule,
        name,
        keywords,
        matchType,
        actionType,
        responseTemplate,
      });
    } else {
      onAddRule({
        name,
        keywords,
        matchType,
        actionType,
        responseTemplate,
        isActive: true,
      });
    }

    setIsModalOpen(false);
  };

  const handleTestSandbox = () => {
    const testContact = contacts[0] || {
      id: 'demo',
      name: 'Demo Client',
      phone: '+1 555-0199',
    };

    const res = evaluateAutoResponse({
      incomingText: testInput,
      contact: testContact as Contact,
      rules,
      availability,
      calendarEvents,
      appointments,
    });

    setSandboxResult(res);
  };

  const insertVariable = (varName: string) => {
    setResponseTemplate((prev) => `${prev} {${varName}}`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#111b21] overflow-hidden text-slate-100">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-[#202c33] border-b border-[#222e35] flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Auto-Responder Keyword Rules
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00a884]/20 text-[#00a884] font-medium border border-[#00a884]/30">
              {rules.length} Rules Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Define custom keywords to automatically trigger smart replies, conflict-free appointment scheduling, or service packages.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="py-2.5 px-4 rounded-xl bg-[#00a884] hover:bg-[#029070] text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Keyword Trigger</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Rules Grid */}
        <div className="space-y-3">
          <h2 className="text-xs uppercase font-bold tracking-wider text-slate-400">
            Active Auto-Response Rules ({rules.length})
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={`bg-[#182229] border rounded-2xl p-4 sm:p-5 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                  rule.isActive ? 'border-[#26353d]' : 'border-[#222e35] opacity-60'
                }`}
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{rule.name}</h3>
                    <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-[#111b21] text-[#00a884] border border-[#26353d]">
                      Match: {rule.matchType}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#202c33] text-slate-300 font-medium">
                      Action: {rule.actionType.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Triggered {rule.triggerCount} times
                    </span>
                  </div>

                  {/* Keywords tags */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-slate-400 font-medium">Keywords:</span>
                    {rule.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-lg bg-[#202c33] border border-[#2a3942] text-emerald-300 font-mono"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>

                  {/* Template preview */}
                  <div className="bg-[#111b21] p-3 rounded-xl border border-[#222e35] text-xs text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                    {rule.responseTemplate}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                  <button
                    onClick={() => onUpdateRule({ ...rule, isActive: !rule.isActive })}
                    className="p-2 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-xs text-slate-300 hover:text-white border border-[#2a3942] transition-colors"
                    title={rule.isActive ? 'Pause Rule' : 'Activate Rule'}
                  >
                    {rule.isActive ? (
                      <ToggleRight className="w-5 h-5 text-[#00a884]" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-slate-500" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(rule)}
                    className="p-2 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-xs text-slate-300 hover:text-white border border-[#2a3942] transition-colors"
                    title="Edit Rule"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteRule(rule.id)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs border border-rose-500/20 transition-colors"
                    title="Delete Rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Rule Testing Sandbox */}
        <div className="bg-[#182229] border border-[#26353d] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white">Live Keyword Testing Sandbox</h2>
            </div>
            <span className="text-xs text-slate-400">Test incoming customer messages</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Type test message (e.g. 'Can I book a meeting?', 'What are your rates?')..."
              className="flex-1 px-4 py-2.5 bg-[#111b21] rounded-xl text-xs text-white border border-[#2a3942] focus:outline-none focus:border-[#00a884]"
            />
            <button
              onClick={handleTestSandbox}
              className="px-4 py-2.5 bg-[#00a884] hover:bg-[#029070] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Evaluate</span>
            </button>
          </div>

          {sandboxResult && (
            <div className="bg-[#111b21] rounded-xl p-4 border border-[#26353d] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Bot className="w-4 h-4" />
                  Trigger Evaluation Result:
                </span>
                <span className="text-slate-400 text-[11px] capitalize">
                  Trigger Reason: {sandboxResult.reason.replace('_', ' ')}
                </span>
              </div>
              <div className="p-3 bg-[#182229] rounded-lg text-slate-200 whitespace-pre-wrap border border-[#222e35]">
                {sandboxResult.shouldReply ? sandboxResult.replyText : '(No keyword matched. Left for human response)'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Rule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111b21] border border-[#2a3942] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100 max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 bg-[#202c33] border-b border-[#2a3942] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#00a884]" />
                <h3 className="text-base font-semibold text-white">
                  {editingRule ? 'Edit Keyword Rule' : 'Create New Auto-Response Rule'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#2a3942]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Rule Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Consultation Inquiry"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#202c33] rounded-xl text-xs text-white border border-[#2a3942] focus:outline-none focus:border-[#00a884]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Keywords (comma separated)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. schedule, book, consult, appointment"
                  value={keywordsText}
                  onChange={(e) => setKeywordsText(e.target.value)}
                  className="w-full px-3 py-2 bg-[#202c33] rounded-xl text-xs text-white border border-[#2a3942] focus:outline-none focus:border-[#00a884]"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Triggers when client message includes any of these words.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Match Condition
                  </label>
                  <select
                    value={matchType}
                    onChange={(e) => setMatchType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#202c33] rounded-xl text-xs text-white border border-[#2a3942] focus:outline-none focus:border-[#00a884]"
                  >
                    <option value="contains">Contains Keyword</option>
                    <option value="exact">Exact Match</option>
                    <option value="startsWith">Starts With</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Action Type
                  </label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#202c33] rounded-xl text-xs text-white border border-[#2a3942] focus:outline-none focus:border-[#00a884]"
                  >
                    <option value="reply_only">Standard Auto-Reply</option>
                    <option value="offer_scheduling">Suggest Calendar Slots</option>
                    <option value="send_pricing">Send Service Pricing</option>
                    <option value="send_hours">Send Office Hours</option>
                    <option value="escalate">Priority Notification</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Response Message Template
                  </label>
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="text-slate-400">Insert tag:</span>
                    <button
                      type="button"
                      onClick={() => insertVariable('client_name')}
                      className="text-[#00a884] hover:underline"
                    >
                      &#123;client_name&#125;
                    </button>
                    <span className="text-slate-600">•</span>
                    <button
                      type="button"
                      onClick={() => insertVariable('available_slots')}
                      className="text-[#00a884] hover:underline"
                    >
                      &#123;available_slots&#125;
                    </button>
                    <span className="text-slate-600">•</span>
                    <button
                      type="button"
                      onClick={() => insertVariable('business_hours')}
                      className="text-[#00a884] hover:underline"
                    >
                      &#123;business_hours&#125;
                    </button>
                  </div>
                </div>
                <textarea
                  required
                  rows={4}
                  value={responseTemplate}
                  onChange={(e) => setResponseTemplate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#202c33] rounded-xl text-xs text-white placeholder-slate-400 border border-[#2a3942] focus:outline-none focus:border-[#00a884]"
                />
              </div>

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
                  <Check className="w-4 h-4" />
                  <span>Save Rule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
