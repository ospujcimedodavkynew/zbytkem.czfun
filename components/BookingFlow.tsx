
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
  initialStartDate?: string;
}

const BookingFlow: React.FC<BookingFlowProps> = ({ vehicle, allReservations, onComplete, onCancel, isEmbedded, initialStartDate }) => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    startDate: initialStartDate || '',
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
        <div className="bg-slate-900 px-6 py-4 text-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-black">{vehicle.name}</h2>
            <button onClick={onCancel} className="p-1.5 hover:bg-slate-800 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1 flex-grow rounded-full transition-all duration-500 ${step >= i ? 'bg-white' : 'bg-slate-700'}`}></div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className={isEmbedded ? 'p-5' : 'p-10'}>
          {step === 1 && (
            <div className={`space-y-4 animate-in fade-in duration-500`}>
              <div>
                <h3 className="text-lg font-black text-slate-900">Termín cesty</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vyzvednutí</label>
                  <input 
                    type="date" 
                    name="startDate" 
                    min={today} 
                    required 
                    value={formData.startDate} 
                    onChange={handleChange} 
                    className={`w-full px-3 py-2.5 border-2 rounded-xl outline-none transition-all font-bold text-sm ${error && formData.startDate ? 'border-red-100 bg-red-50 text-red-900' : 'border-slate-100 focus:border-slate-900'}`} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Vrácení</label>
                  <input 
                    type="date" 
                    name="endDate" 
                    min={formData.startDate || today} 
                    required 
                    value={formData.endDate} 
                    onChange={handleChange} 
                    className={`w-full px-3 py-2.5 border-2 rounded-xl outline-none transition-all font-bold text-sm ${error && formData.endDate ? 'border-red-100 bg-red-50 text-red-900' : 'border-slate-100 focus:border-slate-900'}`} 
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
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center gap-2 animate-in zoom-in-95">
                  <div>
                    <div className="text-slate-900 font-black text-sm">{days} dní</div>
                    <div className="text-slate-500 text-[8px] font-bold uppercase tracking-widest">Kauce 25 000 Kč</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Celkem</div>
                    <div className="text-xl font-black text-slate-900 leading-none">{formatCurrency(totalPrice)}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-500">
              <h3 className="text-lg font-black text-slate-900">Vaše údaje</h3>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" name="firstName" placeholder="Jméno" required value={formData.firstName} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl outline-none focus:border-slate-900 font-medium text-sm" />
                <input type="text" name="lastName" placeholder="Příjmení" required value={formData.lastName} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl outline-none focus:border-slate-900 font-medium text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="email" name="email" placeholder="E-mail" required value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl outline-none focus:border-slate-900 font-medium text-sm" />
                <input type="tel" name="phone" placeholder="Telefon" required value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl outline-none focus:border-slate-900 font-medium text-sm" />
              </div>
              <input type="text" name="address" placeholder="Adresa bydliště" required value={formData.address} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl outline-none focus:border-slate-900 font-medium text-sm" />
              <textarea name="note" placeholder="Poznámka..." value={formData.note} onChange={handleChange} className="w-full px-4 py-3 border-2 border-slate-100 rounded-xl outline-none focus:border-slate-900 h-20 font-medium text-sm"></textarea>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-500">
              <h3 className="text-lg font-black text-slate-900">Shrnutí</h3>
              <div className="p-6 bg-slate-900 rounded-2xl text-white space-y-3">
                <div className="flex justify-between items-center text-slate-400 font-bold uppercase tracking-widest text-[8px]">
                  <span>Vozidlo</span>
                  <span className="text-white text-xs">{vehicle.name}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400 font-bold uppercase tracking-widest text-[8px]">
                  <span>Termín</span>
                  <span className="text-white text-xs">{formatDate(formData.startDate)} - {formatDate(formData.endDate)}</span>
                </div>
                <div className="pt-3 border-t border-slate-800 flex justify-between items-end">
                  <div className="text-slate-400 font-black uppercase tracking-widest text-[8px]">Celkem</div>
                  <div className="text-2xl font-black text-white">{formatCurrency(totalPrice)}</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl text-[10px] text-slate-600 font-bold leading-tight border border-slate-100">
                <input type="checkbox" required className="mt-0.5 w-4 h-4 rounded border-slate-200 text-slate-900 focus:ring-slate-900" />
                <label>Souhlasím s obchodními podmínkami a zákazem kouření ve voze.</label>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between items-center">
            {step > 1 ? (
              <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-2 text-slate-400 font-black uppercase text-[10px] hover:text-slate-900 transition-colors">Zpět</button>
            ) : (
              <div></div>
            )}
            <button 
              type="submit" 
              disabled={step === 1 && (!!error || !formData.startDate || !formData.endDate)}
              className="px-8 py-4 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg hover:bg-slate-800 transition-all disabled:opacity-30"
            >
              {step === 3 ? 'Odeslat' : 'Další'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingFlow;
