import React from 'react';
import { Message } from '../types';
import { Mail, Phone, Clock, CheckCircle, Trash2, MessageSquare } from 'lucide-react';

interface MessageManagerProps {
  messages: Message[];
  onUpdateStatus: (id: string, status: Message['status']) => void;
  onDelete: (id: string) => void;
}

const MessageManager: React.FC<MessageManagerProps> = ({ messages, onUpdateStatus, onDelete }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-orange-600" />
          Zprávy z webu
        </h2>
        <div className="text-sm text-slate-500">
          Celkem: {messages.length} zpráv
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">Žádné nové zprávy</h3>
          <p className="text-slate-500">Zatím vás nikdo přes kontaktní formulář nekontaktoval.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {messages.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((msg) => (
            <div 
              key={msg.id} 
              className={`bg-white rounded-2xl p-6 border transition-all ${
                msg.status === 'new' ? 'border-orange-200 shadow-md shadow-orange-500/5' : 'border-slate-100'
              }`}
            >
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900 text-lg">{msg.name}</h3>
                    {msg.status === 'new' && (
                      <span className="bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                        Nová
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                    <a href={`mailto:${msg.email}`} className="flex items-center gap-1.5 hover:text-orange-600 transition-colors">
                      <Mail className="w-4 h-4" />
                      {msg.email}
                    </a>
                    {msg.phone && (
                      <a href={`tel:${msg.phone}`} className="flex items-center gap-1.5 hover:text-orange-600 transition-colors">
                        <Phone className="w-4 h-4" />
                        {msg.phone}
                      </a>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {new Date(msg.createdAt).toLocaleString('cs-CZ')}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {msg.status === 'new' ? (
                    <button 
                      onClick={() => onUpdateStatus(msg.id, 'read')}
                      className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                      title="Označit jako přečtené"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => onUpdateStatus(msg.id, 'new')}
                      className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
                      title="Označit jako nepřečtené"
                    >
                      <Mail className="w-5 h-5" />
                    </button>
                  )}
                  <button 
                    onClick={() => onDelete(msg.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Smazat zprávu"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Předmět: {msg.subject}</div>
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{msg.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageManager;
