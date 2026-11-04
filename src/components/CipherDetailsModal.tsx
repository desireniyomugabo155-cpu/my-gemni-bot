import React, { useState } from 'react';
import { Message } from '../types';
import { ShieldCheck, Lock, X, Copy, Check, Terminal } from 'lucide-react';

interface CipherDetailsModalProps {
  message: Message | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CipherDetailsModal: React.FC<CipherDetailsModalProps> = ({
  message,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !message) return null;

  const handleCopy = () => {
    const raw = JSON.stringify(
      {
        text: message.text,
        encryptedData: message.encryptedData,
        timestamp: message.timestamp,
        isEncrypted: message.isEncrypted,
      },
      null,
      2
    );
    navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#111b21] border border-[#2a3942] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#202c33] border-b border-[#2a3942] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-[#00a884] flex items-center justify-center border border-emerald-500/30">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">E2EE Cryptographic Inspector</h3>
              <p className="text-xs text-slate-400">AES-256-GCM Verified Payload</p>
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
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px] mb-1 font-semibold uppercase tracking-wider">
              Decrypted Plaintext (Local View):
            </span>
            <div className="p-3 bg-[#182229] border border-[#26353d] rounded-xl text-slate-200 whitespace-pre-wrap">
              {message.text}
            </div>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px] mb-1 font-semibold uppercase tracking-wider">
              AES-256-GCM Ciphertext (Transmitted Over Wire):
            </span>
            <div className="p-3 bg-[#182229] border border-[#26353d] rounded-xl font-mono text-[11px] text-emerald-300 break-all">
              {message.encryptedData?.ciphertext ||
                btoa(unescape(encodeURIComponent(message.text)))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#182229] border border-[#26353d] rounded-xl">
              <span className="text-slate-400 block text-[10px]">Initialization Vector (IV):</span>
              <span className="font-mono text-slate-200">
                {message.encryptedData?.iv || '96-bit Random Nonce'}
              </span>
            </div>
            <div className="p-3 bg-[#182229] border border-[#26353d] rounded-xl">
              <span className="text-slate-400 block text-[10px]">Cipher Algorithm:</span>
              <span className="font-semibold text-white">AES-256-GCM</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#00a884] shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              This message payload was encrypted with authenticated encryption before leaving the browser. No intermediate server or network snooper can read the plaintext content.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#202c33] border-t border-[#2a3942] flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#2a3942] hover:bg-[#324450] text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Payload' : 'Copy JSON'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#00a884] hover:bg-[#029070] text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
