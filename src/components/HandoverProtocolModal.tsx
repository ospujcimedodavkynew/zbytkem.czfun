import React, { useState, useRef } from 'react';
import { ContractData, HandoverProtocol, CampervanSettings } from '../types';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { 
  ClipboardCheck, 
  Gauge, 
  Fuel, 
  Flame, 
  Sparkles, 
  AlertTriangle, 
  Camera, 
  Check, 
  Trash2, 
  PenTool, 
  Download,
  X,
  ShieldCheck
} from 'lucide-react';

interface HandoverProtocolModalProps {
  contract: ContractData;
  settings: CampervanSettings;
  type: 'check_in' | 'check_out';
  initialProtocol?: HandoverProtocol;
  onSave: (protocol: HandoverProtocol) => void;
  onClose: () => void;
}

export default function HandoverProtocolModal({
  contract,
  settings,
  type,
  initialProtocol,
  onSave,
  onClose
}: HandoverProtocolModalProps) {
  const isCheckIn = type === 'check_in';
  const title = isCheckIn ? 'Předávací protokol (Při převzetí vozu)' : 'Přebírací protokol (Při vrácení vozu)';

  const [date, setDate] = useState(initialProtocol?.date || (isCheckIn ? contract.startDate : contract.endDate) || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(initialProtocol?.time || (isCheckIn ? (contract.startTime || '10:00') : (contract.endTime || '10:00')));
  const [odometer, setOdometer] = useState<number>(initialProtocol?.odometer || 45200);
  const [fuelLevel, setFuelLevel] = useState<'empty' | '1/4' | '1/2' | '3/4' | 'full'>(initialProtocol?.fuelLevel || 'full');
  const [gasBottlesCount, setGasBottlesCount] = useState<number>(initialProtocol?.gasBottlesCount ?? 2);
  const [cleanliness, setCleanliness] = useState<'clean' | 'acceptable' | 'dirty'>(initialProtocol?.cleanliness || 'clean');
  const [existingDamages, setExistingDamages] = useState(initialProtocol?.existingDamages || (isCheckIn ? 'Vůz bez viditelného poškození karoserie. Běžné provozní mikroškrábance.' : ''));
  const [notes, setNotes] = useState(initialProtocol?.notes || '');
  const [depositHandled, setDepositHandled] = useState(initialProtocol?.depositHandled ?? true);
  const [depositAmount, setDepositAmount] = useState(initialProtocol?.depositAmount || (contract.deposit || settings.deposit));
  const [depositNote, setDepositNote] = useState(initialProtocol?.depositNote || (isCheckIn ? 'Kauce složena v plné výši' : 'Kauce vrácena bez srážek'));
  const [photos, setPhotos] = useState<string[]>(initialProtocol?.photos || []);
  
  // Signature pad states
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tenantSig, setTenantSig] = useState<string>(initialProtocol?.tenantSignature || '');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // Canvas drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setTenantSig(canvas.toDataURL('image/png'));
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setTenantSig('');
  };

  const handleSaveProtocol = () => {
    const protocol: HandoverProtocol = {
      id: initialProtocol?.id || `proto-${Date.now()}`,
      contractId: contract.id,
      type,
      date,
      time,
      odometer: Number(odometer) || 0,
      fuelLevel,
      gasBottlesCount: Number(gasBottlesCount) || 0,
      cleanliness,
      existingDamages,
      notes,
      depositHandled,
      depositAmount: Number(depositAmount) || 0,
      depositNote,
      photos,
      tenantSignature: tenantSig,
      ownerSignature: settings.ownerName
    };
    onSave(protocol);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full my-auto overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${isCheckIn ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display">{title}</h2>
              <p className="text-xs text-slate-400">
                {settings.brand} {settings.model} (SPZ: {settings.plateNumber}) • Nájemce: <strong className="text-white">{contract.tenantName}</strong>
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
          
          {/* Quick info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Datum předání / převzetí</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Přesný čas</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>

          {/* Core Technical Status */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-primary" /> Technický stav vozidla při {isCheckIn ? 'předání' : 'vrácení'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Odometer */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-slate-500" /> Stav tachometru (km)
                </label>
                <input
                  type="number"
                  value={odometer}
                  onChange={e => setOdometer(Number(e.target.value))}
                  placeholder="např. 45200"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-base font-bold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              {/* Fuel Level */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-slate-500" /> Stav nafty (Palivo)
                </label>
                <select
                  value={fuelLevel}
                  onChange={e => setFuelLevel(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="full">Plná nádrž (100 %)</option>
                  <option value="3/4">3/4 nádrže</option>
                  <option value="1/2">1/2 nádrže</option>
                  <option value="1/4">1/4 nádrže</option>
                  <option value="empty">Rezerva / Prázdná</option>
                </select>
              </div>

              {/* Gas Bottles */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-slate-500" /> Plynové lahve (ks)
                </label>
                <input
                  type="number"
                  min="0"
                  max="4"
                  value={gasBottlesCount}
                  onChange={e => setGasBottlesCount(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>

            {/* Cleanliness */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <label className="block text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-slate-500" /> Čistota interiéru a exteriéru
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'clean', label: '✨ Perfektně čisté' },
                  { value: 'acceptable', label: '👍 Běžné znečištění' },
                  { value: 'dirty', label: '⚠️ Silně znečištěno' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCleanliness(opt.value as any)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                      cleanliness === opt.value
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Damages & Notes */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-900 mb-1.5 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Záznam o stavu / poškození / škrábancích
              </label>
              <textarea
                value={existingDamages}
                onChange={e => setExistingDamages(e.target.value)}
                rows={2}
                placeholder="Popište stav karoserie, oken, markýzy, kol nebo interiéru..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none"
              />
            </div>

            {/* Photo attachments */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-primary" /> Fotodokumentace stavu vozu ({photos.length})
                </label>
                <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-xl transition-colors">
                  <Camera className="w-3.5 h-3.5" /> Přidat fotku z mobilu
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {photos.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {photos.map((photo, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden aspect-video border border-slate-200 bg-slate-100">
                      <img src={photo} alt={`Stav ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute top-1 right-1 bg-red-600/90 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-slate-300 rounded-2xl p-4 text-center text-xs text-slate-400 bg-slate-50/50">
                  Zatím nebyla pořízena žádná fotka stavu vozu.
                </div>
              )}
            </div>
          </div>

          {/* Deposit Settlement */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Vratná kauce ({depositAmount.toLocaleString('cs-CZ')} Kč)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-emerald-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={depositHandled}
                  onChange={e => setDepositHandled(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span>{isCheckIn ? 'Kauce byla řádně složena' : 'Kauce byla vyúčtována / vrácena'}</span>
              </label>
              <input
                type="text"
                value={depositNote}
                onChange={e => setDepositNote(e.target.value)}
                placeholder="Poznámka ke kauci (např. hotovost / účet)..."
                className="bg-white border border-emerald-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none"
              />
            </div>
          </div>

          {/* Signature of Tenant */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <PenTool className="w-4 h-4 text-primary" /> Podpis nájemce při {isCheckIn ? 'převzetí' : 'vrácení'}
              </label>
              {tenantSig && (
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-xs text-slate-500 hover:text-red-600 transition-colors"
                >
                  Smazat podpis
                </button>
              )}
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 overflow-hidden relative touch-none">
              <canvas
                ref={canvasRef}
                width={600}
                height={140}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-28 bg-white cursor-crosshair block"
              />
              {!tenantSig && !isDrawing && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs text-slate-400">
                  Podepište se prstem nebo myší zde
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 sm:p-5 flex flex-wrap justify-between items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <Download className="w-4 h-4" /> Vytisknout / PDF
          </button>

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-xl transition-colors"
            >
              Zavřít
            </button>
            <button
              type="button"
              onClick={handleSaveProtocol}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all shadow-primary/20"
            >
              <Check className="w-4 h-4" /> Uložit protokol do smlouvy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
