
import React, { useState, useEffect } from 'react';
import { Vehicle, Reservation, ReservationStatus } from '../types';
import { formatCurrency, calculateDays, formatDate } from '../utils/format';
import AvailabilityCalendar from './AvailabilityCalendar';

interface BookingFlowProps {
  vehicle: Vehicle;
  allReservations: Reservation[];
  onComplete: (data: any) => void;
  onCancel: () => void;
  isEmbedded?: boolean;
}

const BookingFlow: React.FC<BookingFlowProps> = ({ vehicle, allReservations, onComplete, onCancel, isEmbedded }) => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
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

  // Filtrování relevantních rezervací pro tento vůz
  const activeReservations = allReservations.filter(r => 
    r.vehicleId === vehicle.id && 
    r.status !== ReservationStatus.CANCELLED
  );

  const checkAvailability = (start: string, end: string) => {
    if (!start || !end) return true;
    return !activeReservations.some(r => {
      // Logika překryvu: (StartA <= EndB) and (EndA >= StartB)
      return (start <= r.endDate) && (end >= r.startDate);
    });
  };

  useEffect(() => {
    // Scroll to top of the widget when step changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Real-time validace dostupnosti
      if (name === 'startDate' || name === 'endDate') {
        if (newData.startDate && newData.endDate) {
          if (newData.endDate <= newData.startDate) {
            setError("Datum vrácení musí být po datu vyzvednutí.");
          } else if (!checkAvailability(newData.startDate, newData.endDate)) {
            setError("Bohužel, v tomto termínu je již vůz obsazen. Vyberte prosím jiné datum.");
          } else if (calculateDays(newData.startDate, newData.endDate) < vehicle.minDays) {
            setError(`Minimální délka pronájmu je ${vehicle.minDays} dny.`);
          } else {
            setError(null);
          }
        }
      }
      return newData;
    });
  };

  const calculateTotalPrice = () => {
    if (!formData.startDate || !formData.endDate || error) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
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

  const days = (formData.startDate && formData.endDate && !error) ? calculateDays(formData.startDate, formData.endDate) : 0;
  const totalPrice = calculateTotalPrice();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (error) return;
    
    if (step < 3) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    <div className={`max-w-3xl mx-auto px-4 ${isEmbedded ? 'py-4' : 'py-16'}`}>
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
              <div key={i} className={`h-1.5 flex-grow rounded-full transition-all duration-500 ${step >= i ? 'bg-slate-900' : 'bg-slate-200'}`}></div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div>
                <h3 className="text-2xl font-black text-slate-900">Vyberte si termín cesty</h3>
                <p className="text-slate-500 text-sm mt-2">Dostupnost kontrolujeme automaticky v reálném čase.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Datum vyzvednutí</label>
                  <input 
                    type="date" 
                    name="startDate" 
                    min={today} 
                    required 
                    value={formData.startDate} 
                    onChange={handleChange} 
                    className={`w-full px-5 py-4 border-2 rounded-2xl outline-none transition-all font-bold ${error && formData.startDate ? 'border-red-100 bg-red-50 text-red-900' : 'border-slate-100 focus:border-slate-900'}`} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Datum vrácení</label>
                  <input 
                    type="date" 
                    name="endDate" 
                    min={formData.startDate || today} 
                    required 
                    value={formData.endDate} 
                    onChange={handleChange} 
                    className={`w-full px-5 py-4 border-2 rounded-2xl outline-none transition-all font-bold ${error && formData.endDate ? 'border-red-100 bg-red-50 text-red-900' : 'border-slate-100 focus:border-slate-900'}`} 
                  />
                </div>
              </div>
              
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-3 animate-in slide-in-from-top-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  {error}
                </div>
              )}

              {/* Visual Availability Calendar */}
              <div className="pt-6 border-t border-slate-100">
                <AvailabilityCalendar 
                  vehicles={[vehicle]} 
                  reservations={allReservations} 
                  isEmbedded={true} 
                />
              </div>

              {days > 0 && totalPrice > 0 && !error && (
                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 animate-in zoom-in-95">
                  <div className="text-center md:text-left">
                    <div className="text-slate-900 font-black text-xl">{days} dní na cestě</div>
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Včetně kauce 25 000 Kč (vratná)</div>
                  </div>
                  <div className="text-center md:text-right">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Celková cena pronájmu</div>
                    <div className="text-4xl font-black text-slate-900 leading-none">{formatCurrency(totalPrice)}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <h3 className="text-2xl font-black text-slate-900">Vaše údaje</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <input type="text" name="firstName" placeholder="Jméno" required value={formData.firstName} onChange={handleChange} className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl outline-none focus:border-slate-900 font-medium" />
                <input type="text" name="lastName" placeholder="Příjmení" required value={formData.lastName} onChange={handleChange} className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl outline-none focus:border-slate-900 font-medium" />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <input type="email" name="email" placeholder="E-mail" required value={formData.email} onChange={handleChange} className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl outline-none focus:border-slate-900 font-medium" />
                <input type="tel" name="phone" placeholder="Telefon" required value={formData.phone} onChange={handleChange} className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl outline-none focus:border-slate-900 font-medium" />
              </div>
              <input type="text" name="address" placeholder="Adresa bydliště (ulice, město, PSČ)" required value={formData.address} onChange={handleChange} className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl outline-none focus:border-slate-900 font-medium" />
              <textarea name="note" placeholder="Poznámka pro nás..." value={formData.note} onChange={handleChange} className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl outline-none focus:border-slate-900 h-32 font-medium"></textarea>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <h3 className="text-2xl font-black text-slate-900">Shrnutí a potvrzení</h3>
              <div className="p-10 bg-slate-900 rounded-[2rem] text-white space-y-6">
                <div className="flex justify-between items-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  <span>Vozidlo</span>
                  <span className="text-white text-sm">{vehicle.name}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  <span>Termín</span>
                  <span className="text-white text-sm">{formatDate(formData.startDate)} - {formatDate(formData.endDate)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  <span>Doba pronájmu</span>
                  <span className="text-white text-sm">{days} dní</span>
                </div>
                <div className="pt-6 border-t border-slate-800 flex justify-between items-end">
                  <div className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Celková cena k úhradě</div>
                  <div className="text-4xl font-black text-slate-900">{formatCurrency(totalPrice)}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-2xl text-xs text-slate-600 font-bold leading-relaxed border border-slate-100">
                <input type="checkbox" required className="mt-1 w-5 h-5 rounded border-slate-200 text-slate-900 focus:ring-slate-900" />
                <label>Potvrzuji, že jsem se seznámil s obchodními podmínkami a souhlasím se zpracováním osobních údajů. Beru na vědomí, že ve voze platí přísný zákaz kouření a manipulace s ohněm.</label>
              </div>
            </div>
          )}

          <div className="mt-12 flex justify-between items-center">
            {step > 1 ? (
              <button type="button" onClick={() => setStep(step - 1)} className="px-8 py-3 text-slate-400 font-black uppercase text-xs hover:text-slate-900 transition-colors">Zpět</button>
            ) : (
              <div></div>
            )}
            <button 
              type="submit" 
              // Fix: Convert error string to boolean using !! to satisfy TypeScript's boolean requirement for the disabled prop
              disabled={step === 1 && (!!error || !formData.startDate || !formData.endDate)}
              className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-slate-200 hover:bg-slate-800 hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-30 disabled:hover:translate-y-0"
            >
              {step === 3 ? 'Odeslat rezervaci' : 'Další krok'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingFlow;
