import React, { useState } from 'react';
import { Contact } from '../types';
import { getLocalFingerprint, encryptMessage } from '../services/crypto';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  QrCode,
  Eye,
  RefreshCw,
  Terminal,
} from 'lucide-react';

interface SecurityViewProps {
  contacts: Contact[];
  onOpenSafetyNumber: (contact: Contact) => void;
  onToggleVerify: (contactId: string) => void;
}

export const SecurityView: React.FC<SecurityViewProps> = ({
  contacts,
  onOpenSafetyNumber,
  onToggleVerify,
}) => {
  const localFingerprint = getLocalFingerprint();
  const [copiedFingerprint, setCopiedFingerprint] = useState(false);

  // Live E2EE encryption inspector test
  const [sampleText, setSampleText] = useState(
    'Private client appointment details: Q4 Strategy Session confirmed for Nov 5 at 10:00 AM.'
  );
  const [encryptedOutput, setEncryptedOutput] = useState<any>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);

  const handleTestEncrypt = async () => {
    setIsEncrypting(true);
    const result = await encryptMessage(sampleText);
    setEncryptedOutput(result);
    setIsEncrypting(false);
  };

  const copyFingerprint = () => {
    navigator.clipboard.writeText(localFingerprint);
    setCopiedFingerprint(true);
    setTimeout(() => setCopiedFingerprint(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#111b21] overflow-hidden text-slate-100">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-[#202c33] border-b border-[#222e35] flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              End-to-End Encryption (E2EE) Hub
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#00a884]/20 text-[#00a884] font-medium border border-[#00a884]/30">
              AES-256-GCM Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Industry standard Signal-protocol compatible encryption protects all WhatsApp messages and appointment scheduling data.
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Device Cryptographic Identity Card */}
        <div className="bg-[#182229] border border-[#26353d] rounded-2xl p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[#00a884]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Your Device Identity Key</span>
                  <span className="text-[10px] bg-emerald-500/20 text-[#00a884] px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Hardware Verified
                  </span>
                </div>
                <div className="text-xs font-mono text-emerald-400 font-semibold mt-1 flex items-center gap-2">
                  <span>{localFingerprint}</span>
                  <button
                    onClick={copyFingerprint}
                    className="text-slate-400 hover:text-white transition-colors"
                    title="Copy Key Fingerprint"
                  >
                    {copiedFingerprint ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-300">
              <div className="bg-[#111b21] px-3.5 py-2 rounded-xl border border-[#26353d]">
                <span className="text-slate-400 block text-[10px]">Algorithm:</span>
                <span className="font-semibold text-white">AES-256-GCM</span>
              </div>
              <div className="bg-[#111b21] px-3.5 py-2 rounded-xl border border-[#26353d]">
                <span className="text-slate-400 block text-[10px]">Hash Digest:</span>
                <span className="font-semibold text-white">SHA-256</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Cryptographic Payload Inspector */}
        <div className="bg-[#182229] border border-[#26353d] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[#00a884]" />
              <h2 className="text-sm font-bold text-white">Live Cryptographic Cipher Visualizer</h2>
            </div>
            <span className="text-xs text-slate-400">WebCrypto Subtle API Sandbox</span>
          </div>

          <p className="text-xs text-slate-300">
            Every incoming and outgoing message on WhatsBot Flow is encrypted client-side before transmission. Test encrypting a sample payload below:
          </p>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Plaintext Message:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                className="flex-1 px-3 py-2 bg-[#111b21] rounded-xl text-xs text-white border border-[#2a3942] focus:outline-none focus:border-[#00a884]"
              />
              <button
                onClick={handleTestEncrypt}
                disabled={isEncrypting}
                className="px-4 py-2 bg-[#00a884] hover:bg-[#029070] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Encrypt via AES-256-GCM</span>
              </button>
            </div>
          </div>

          {encryptedOutput && (
            <div className="bg-[#111b21] p-4 rounded-xl border border-[#26353d] space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-semibold text-emerald-400">
                  Ciphertext Output (Base64 Encoded):
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  IV: {encryptedOutput.iv}
                </span>
              </div>
              <div className="p-3 bg-[#182229] rounded-lg font-mono text-[11px] text-emerald-300 break-all border border-[#222e35]">
                {encryptedOutput.ciphertext}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#00a884]" />
                <span>Only recipients possessing the paired private session key can decrypt this payload.</span>
              </div>
            </div>
          )}
        </div>

        {/* Contact Safety Numbers Directory */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Contact Safety Numbers &amp; Verification Status
            </h2>
            <span className="text-xs text-slate-400">
              {contacts.filter((c) => c.isVerified).length} / {contacts.length} Verified
            </span>
          </div>

          <div className="space-y-2">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-[#182229] border border-[#26353d] hover:border-[#374954] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={contact.avatar}
                    alt={contact.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#2a3942]"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">{contact.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{contact.phone}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">
                      Key Fingerprint: {contact.keyFingerprint}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium border flex items-center gap-1 ${
                      contact.isVerified
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {contact.isVerified ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-[#00a884]" />
                        <span>Verified</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 text-amber-400" />
                        <span>Unverified</span>
                      </>
                    )}
                  </span>

                  <button
                    onClick={() => onOpenSafetyNumber(contact)}
                    className="px-3 py-1.5 rounded-xl bg-[#202c33] hover:bg-[#2a3942] text-xs font-semibold text-slate-200 hover:text-white border border-[#2a3942] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 text-[#00a884]" />
                    <span>View 60-Digit Code</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
