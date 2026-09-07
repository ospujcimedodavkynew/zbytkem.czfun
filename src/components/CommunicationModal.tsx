import React, { useState } from 'react';
import { ContractData, CampervanSettings } from '../types';
import { COMMUNICATION_TEMPLATES, CommunicationTemplate } from '../utils/featureHelpers';
import { 
  MessageSquare, 
  Mail, 
  Send, 
  Copy, 
  Check, 
  X, 
  FileText, 
  ExternalLink 
} from 'lucide-react';

interface CommunicationModalProps {
  contract: ContractData;
  settings: CampervanSettings;
  contractUrl: string;
  onClose: () => void;
}

export default function CommunicationModal({
  contract,
  settings,
  contractUrl,
  onClose
}: CommunicationModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(COMMUNICATION_TEMPLATES[0].id);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const currentTemplate = COMMUNICATION_TEMPLATES.find(t => t.id === selectedTemplateId) || COMMUNICATION_TEMPLATES[0];

  const subject = currentTemplate.getSubject(contract, settings);
  const body = currentTemplate.getBody(contract, settings, contractUrl);
  const whatsAppText = currentTemplate.getWhatsApp(contract, settings, contractUrl);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleOpenWhatsApp = () => {
    // Format phone: remove spaces and plus, ensure international format
    let phone = (contract.tenantPhone || '').replace(/\s+/g, '').replace(/[-()]/g, '');
    if (phone.startsWith('00')) phone = phone.substring(2);
    if (phone.startsWith('+')) phone = phone.substring(1);
    if (phone.length === 9) phone = '420' + phone; // Czech default

    const encoded = encodeURIComponent(whatsAppText);
    const url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  const handleOpenEmail = () => {
    const to = contract.tenantEmail || '';
    const encSubject = encodeURIComponent(subject);
    const encBody = encodeURIComponent(body);
    window.location.href = `mailto:${to}?subject=${encSubject}&body=${encBody}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-auto overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/20 text-primary">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display">Automatické šablony zpráv</h2>
              <p className="text-xs text-slate-400">
                Příjemce: <strong className="text-white">{contract.tenantName}</strong> ({contract.tenantPhone || 'bez tel.'}, {contract.tenantEmail || 'bez e-mailu'})
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-700">
          
          {/* Template selector pills */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
              Vyberte šablonu zprávy:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {COMMUNICATION_TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplateId(t.id)}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    selectedTemplateId === t.id
                      ? 'bg-primary/10 border-primary text-primary shadow-sm font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <span className="block text-xs font-bold leading-snug">{t.title}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 italic mt-1">{currentTemplate.description}</p>
          </div>

          {/* E-mail version preview */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-primary" /> E-mailová zpráva
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(`Předmět: ${subject}\n\n${body}`, 'email')}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-primary transition-colors"
              >
                {copiedField === 'email' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copiedField === 'email' ? 'Zkopírováno!' : 'Kopírovat'}
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <p><strong className="text-slate-900">Předmět:</strong> {subject}</p>
              <div className="bg-white border border-slate-200 rounded-xl p-3 font-sans text-slate-800 whitespace-pre-line text-xs max-h-48 overflow-y-auto leading-relaxed">
                {body}
              </div>
            </div>
          </div>

          {/* WhatsApp / SMS version preview */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-emerald-200 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp / SMS zpráva
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(whatsAppText, 'wa')}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
              >
                {copiedField === 'wa' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copiedField === 'wa' ? 'Zkopírováno!' : 'Kopírovat'}
              </button>
            </div>

            <div className="bg-white border border-emerald-200 rounded-xl p-3 font-sans text-slate-800 whitespace-pre-line text-xs max-h-32 overflow-y-auto leading-relaxed">
              {whatsAppText}
            </div>
          </div>
        </div>

        {/* Footer instant actions */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 sm:p-5 flex flex-wrap justify-between items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl transition-colors"
          >
            Zavřít
          </button>

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all shadow-emerald-600/20"
            >
              <MessageSquare className="w-4 h-4" /> Odeslat přes WhatsApp
            </button>

            <button
              type="button"
              onClick={handleOpenEmail}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all shadow-primary/20"
            >
              <Mail className="w-4 h-4" /> Odeslat E-mailem
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
