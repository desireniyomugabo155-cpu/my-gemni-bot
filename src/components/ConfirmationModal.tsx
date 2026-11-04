import React from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  details?: string[];
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  details,
  confirmLabel = 'Confirm & Proceed',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#111b21] border border-[#2a3942] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-slate-100">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isDestructive
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-[#00a884] border border-emerald-500/30'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="text-xs text-slate-400">Google Calendar Synchronization Request</p>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed mb-4">{message}</p>

          {details && details.length > 0 && (
            <div className="bg-[#1a252d] border border-[#26353d] rounded-xl p-3 mb-5 space-y-1.5 text-xs text-slate-300">
              {details.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-[#00a884] font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-[#202c33] hover:bg-[#2a3942] transition-colors flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all shadow-md flex items-center gap-1.5 ${
                isDestructive
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-[#00a884] hover:bg-[#029070] text-white shadow-emerald-900/30'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
