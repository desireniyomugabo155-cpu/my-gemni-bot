import React from 'react';
import { Contact } from '../types';
import { ShieldCheck, Lock, X, CheckCircle2, QrCode, KeyRound, Copy, Check } from 'lucide-react';

interface SafetyNumberModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleVerify: (contactId: string) => void;
}

export const SafetyNumberModal: React.FC<SafetyNumberModalProps> = ({
  contact,
  isOpen,
  onClose,
  onToggleVerify,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !contact) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(contact.safetyNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const blocks = contact.safetyNumber.split(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-[#111b21] border border-[#2a3942] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#202c33] border-b border-[#2a3942] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#00a884]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Verify Security Code</h3>
              <p className="text-xs text-slate-400">End-to-End Encryption with {contact.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#2a3942] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="flex items-start gap-3 bg-[#182229] border border-[#222e35] p-3.5 rounded-xl text-xs text-slate-300">
            <Lock className="w-4 h-4 text-[#00a884] shrink-0 mt-0.5" />
            <p>
              Messages and calls with <span className="font-semibold text-white">{contact.name}</span> are protected with AES-256-GCM encryption. Compare this safety number with the recipient’s device to verify end-to-end encryption.
            </p>
          </div>

          {/* QR Code and Key representation */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="p-4 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-3">
              <div className="w-44 h-44 border-4 border-slate-900 rounded-lg p-2 grid grid-cols-6 gap-1 bg-white">
                {Array.from({ length: 36 }).map((_, i) => {
                  const isBlack = (i * 7 + (contact.name.charCodeAt(0) || 1)) % 3 !== 0;
                  return (
                    <div
                      key={i}
                      className={`rounded-sm ${isBlack ? 'bg-slate-950' : 'bg-transparent'}`}
                    />
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <QrCode className="w-3.5 h-3.5 text-[#00a884]" />
              <span>Scan QR code with contact&apos;s phone</span>
            </div>
          </div>

          {/* 60-digit number */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Safety Number (60 Digits)
              </label>
              <button
                onClick={handleCopy}
                className="text-xs text-[#00a884] hover:underline flex items-center gap-1 font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Number'}
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 bg-[#182229] p-3.5 rounded-xl border border-[#222e35] font-mono text-xs text-center text-slate-200">
              {blocks.map((block, idx) => (
                <div
                  key={idx}
                  className="bg-[#111b21] py-1.5 px-2 rounded-lg border border-[#26353d] font-semibold tracking-wider text-emerald-400"
                >
                  {block}
                </div>
              ))}
            </div>
          </div>

          {/* Cryptographic Key Details */}
          <div className="bg-[#182229] p-3.5 rounded-xl border border-[#222e35] text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#00a884]" />
                Contact Public Key Fingerprint:
              </span>
              <span className="font-mono text-emerald-400 font-semibold">{contact.keyFingerprint}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Cipher Protocol:</span>
              <span className="text-slate-200 font-medium">AES-256-GCM / SHA-256</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Verification Status:</span>
              <span
                className={`font-medium ${
                  contact.isVerified ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {contact.isVerified ? 'Verified & Trusted' : 'Unverified (New Key)'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#202c33] border-t border-[#2a3942] flex items-center justify-between">
          <button
            onClick={() => onToggleVerify(contact.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
              contact.isVerified
                ? 'bg-[#2a3942] text-slate-300 hover:bg-[#324450]'
                : 'bg-[#00a884] text-white hover:bg-[#029070] shadow-md shadow-emerald-900/30'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {contact.isVerified ? 'Mark as Unverified' : 'Mark as Verified'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-[#111b21] hover:bg-[#182229] border border-[#2a3942]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
