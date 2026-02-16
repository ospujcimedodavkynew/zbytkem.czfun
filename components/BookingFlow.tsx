
import React, { useState } from 'react';
import { Vehicle, ReservationStatus } from '../types';
// Fixed: Added missing formatDate to imports
import { formatCurrency, calculateDays, formatDate } from '../utils/format';

interface BookingFlowProps {
  vehicle: Vehicle;
  onComplete: (data: any) => void;
  onCancel: () => void;
}

const BookingFlow: React.FC<BookingFlowProps> = ({ vehicle, onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    note: ''
  });

  const today = new Date().toISOString().split('T')[0];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateTotalPrice = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (end <= start) return 0;
    
    let total = 0;
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      const currentDateStr = d.toISOString().split('T')[0];
      const season = vehicle.seasonalPricing.find(s => 
        currentDateStr >= s.startDate && currentDateStr <= s.endDate
      );
      total += season ? season.pricePerDay : vehicle.basePrice;
    }
    return total;
  };

  const days = (formData.startDate && formData.endDate) ? calculateDays(formData.startDate, formData.endDate) : 0;
  const totalPrice = calculateTotalPrice();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete({
        ...formData,
        totalPrice,
        vehicleId: vehicle.id,
        status: ReservationStatus.PENDING,
        createdAt: new Date().toISOString()
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">
        <div className="bg-slate-900 px-10 py-8 text-white">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black">{vehicle.name}</h2>
            <button onClick={onCancel} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 flex-grow rounded-full transition-all duration-500 ${step >= i ? 'bg-orange-500' : 'bg-slate-800'}`}></div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <h3 className="text-2xl font-black text-slate-900">Vyberte si termín cesty</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Datum vyzvednutí</label>
                  <input type="date" name="startDate" min={today} required value={formData.startDate} onChange={handleChange} className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl focus:border-orange-500 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Datum vrácení</label>
                  <input type="date" name="endDate" min={formData.startDate || today} required value={formData.endDate} onChange={handleChange} className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl focus:border-orange-500 outline-none transition-all" />
                </div>
              </div>
              
              {days > 0 && totalPrice > 0 && (
                <div className="bg-orange-50 p-8 rounded-3xl border border-orange-100 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <div className="text-orange-900 font-black text-lg">{days} dní na cestě</div>
                    <div className="text-orange-600 text-sm font-medium">Včetně kauce 25 000 Kč (vratná)</div>
                  </div>
                  <div className="text-center md:text-right">
                    <div className="text-xs font-black text-orange-400 uppercase tracking-widest mb-1">Celková cena</div>
                    <div className="text-4xl font-black text-orange-900">{formatCurrency(totalPrice)}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <h3 className="text-2xl font-black text-slate-900">Kontaktní údaje</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <input type="text" name="firstName" placeholder="Jméno" required value={formData.firstName} onChange={handleChange} className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl outline-none focus:border-orange-500" />
                <input type="text" name="lastName" placeholder="Příjmení" required value={formData.lastName} onChange={handleChange} className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl outline-none focus:border-orange-500" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <input type="email" name="email" placeholder="E-mailová adresa" required value={formData.email} onChange={handleChange} className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl outline-none focus:border-orange-500" />
                <input type="tel" name="phone" placeholder="Telefonní číslo" required value={formData.phone} onChange={handleChange} className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl outline-none focus:border-orange-500" />
              </div>
              <input type="text" name="address" placeholder="Adresa bydliště (ulice, město, PSČ)" required value={formData.address} onChange={handleChange} className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl outline-none focus:border-orange-500" />
              <textarea name="note" placeholder="Máte nějaké speciální přání? (volitelné)" value={formData.note} onChange={handleChange} className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl outline-none focus:border-orange-500 h-32"></textarea>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <h3 className="text-2xl font-black text-slate-900">Shrnutí rezervace</h3>
              <div className="p-8 bg-slate-50 rounded-3xl space-y-4">
                <div className="flex justify-between font-bold text-slate-600"><span>Vozidlo:</span><span className="text-slate-900">{vehicle.name}</span></div>
                <div className="flex justify-between font-bold text-slate-600"><span>Termín:</span><span className="text-slate-900">{formatDate(formData.startDate)} - {formatDate(formData.endDate)}</span></div>
                <div className="flex justify-between font-bold text-slate-600"><span>Délka:</span><span className="text-slate-900">{days} dní</span></div>
                <div className="pt-4 border-t-2 border-slate-200 flex justify-between items-center">
                  <span className="text-lg font-black text-slate-900">Konečná cena:</span>
                  <span className="text-4xl font-black text-orange-600">{formatCurrency(totalPrice)}</span>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-2xl text-xs text-orange-900 font-medium">
                <input type="checkbox" required className="mt-1 w-4 h-4 rounded" />
                <label>Potvrzuji správnost údajů a souhlasím se zpracováním osobních údajů pro účely rezervace. Beru na vědomí, že ve voze platí přísný zákaz kouření.</label>
              </div>
            </div>
          )}

          <div className="mt-12 flex justify-between items-center">
            {step > 1 ? (
              <button type="button" onClick={() => setStep(step - 1)} className="px-8 py-3 text-slate-400 font-bold hover:text-slate-900 transition-colors">Zpět</button>
            ) : (
              <div></div>
            )}
            <button type="submit" className="px-10 py-4 bg-orange-600 text-white rounded-2xl font-bold shadow-xl shadow-orange-100 hover:scale-105 active:scale-95 transition-all">
              {step === 3 ? 'Dokončit rezervaci' : 'Pokračovat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingFlow;
