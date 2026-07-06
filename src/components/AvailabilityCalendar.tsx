import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Info, 
  Check,
  AlertCircle
} from 'lucide-react';
import { ContractData, ReservationInquiry } from '../types';
import { dbService } from '../lib/supabase';

interface AvailabilityCalendarProps {
  startDate: string;
  endDate: string;
  onSelectRange: (start: string, end: string) => void;
  dailyPrice: number;
}

export default function AvailabilityCalendar({ 
  startDate, 
  endDate, 
  onSelectRange,
  dailyPrice
}: AvailabilityCalendarProps) {
  // Focus date (defaults to July 2026 since current local time is July 2026)
  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    // Default to the current month/year or July 2026
    const now = new Date();
    // If it's 2026, use that, otherwise default to current year-month
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [inquiries, setInquiries] = useState<ReservationInquiry[]>([]);

  // Load contracts and inquiries from database
  useEffect(() => {
    const loadDbData = () => {
      dbService.getContracts().then(res => setContracts(res));
      dbService.getInquiries().then(res => setInquiries(res));
    };

    loadDbData();

    // Listen for storage fallback changes or manual sync triggers
    window.addEventListener('storage', loadDbData);
    return () => {
      window.removeEventListener('storage', loadDbData);
    };
  }, []);

  // Format Helper for timezone-safe YYYY-MM-DD
  const getFormatDateStr = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Check state of a date string
  const getDateStatus = (dateStr: string): 'occupied' | 'pending' | 'selected' | 'selected-start' | 'selected-end' | 'free' | 'disabled' => {
    const todayStr = getFormatDateStr(new Date());
    
    // Past dates are disabled
    if (dateStr < todayStr) {
      return 'disabled';
    }

    // Is it selected by the user?
    if (startDate && endDate && dateStr >= startDate && dateStr <= endDate) {
      if (dateStr === startDate) return 'selected-start';
      if (dateStr === endDate) return 'selected-end';
      return 'selected';
    }
    if (startDate && dateStr === startDate) {
      return 'selected-start';
    }

    // Is there a confirmed contract covering this date?
    const isOccupied = contracts.some(c => dateStr >= c.startDate && dateStr <= c.endDate);
    if (isOccupied) return 'occupied';

    // Is there an active pending inquiry?
    const isPending = inquiries.some(i => i.status === 'pending' && dateStr >= i.startDate && dateStr <= i.endDate);
    if (isPending) return 'pending';

    return 'free';
  };

  // Helper to get helper text for hover/info
  const getCzechMonthName = (monthIdx: number): string => {
    const months = [
      'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
      'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
    ];
    return months[monthIdx];
  };

  // Generate calendar days for a specific month
  const getDaysInMonth = (year: number, month: number) => {
    const days = [];
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Day of the week of the first day (0 = Sunday, 1 = Monday, etc.)
    let startDayOfWeek = firstDay.getDay();
    // Convert Sunday (0) to 7, so Monday is 1, Sunday is 7
    if (startDayOfWeek === 0) startDayOfWeek = 7;

    // Total days in the month
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Add empty placeholders for previous month days
    for (let i = 1; i < startDayOfWeek; i++) {
      days.push(null);
    }

    // Add actual days
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentMonthDate(prev => {
      const copy = new Date(prev);
      copy.setMonth(copy.getMonth() - 1);
      return copy;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(prev => {
      const copy = new Date(prev);
      copy.setMonth(copy.getMonth() + 1);
      return copy;
    });
  };

  // Day selection click handler
  const handleDayClick = (date: Date) => {
    const clickedStr = getFormatDateStr(date);
    const status = getDateStatus(clickedStr);

    if (status === 'disabled' || status === 'occupied') {
      return; // Cannot select occupied or past dates
    }

    if (!startDate || (startDate && endDate)) {
      // Start a new selection
      onSelectRange(clickedStr, '');
    } else {
      // We already have a start date, now set the end date
      if (clickedStr < startDate) {
        // If they click before start date, treat this as the new start date
        onSelectRange(clickedStr, '');
      } else {
        // Check if there is an occupied day in between
        let hasOccupiedInBetween = false;
        let d = new Date(startDate);
        const endD = new Date(clickedStr);
        
        while (d <= endD) {
          const currentCheckStr = getFormatDateStr(d);
          if (contracts.some(c => currentCheckStr >= c.startDate && currentCheckStr <= c.endDate)) {
            hasOccupiedInBetween = true;
            break;
          }
          d.setDate(d.getDate() + 1);
        }

        if (hasOccupiedInBetween) {
          alert('Zvolený termín obsahuje již obsazené dny. Vyberte prosím jiný volný blok.');
          onSelectRange(clickedStr, '');
        } else {
          onSelectRange(startDate, clickedStr);
        }
      }
    }
  };

  // Calculate rendering for 2 consecutive months (Current focus & Next focus)
  const month1Date = currentMonthDate;
  const month2Date = new Date(month1Date.getFullYear(), month1Date.getMonth() + 1, 1);

  const monthsToRender = [
    { date: month1Date, days: getDaysInMonth(month1Date.getFullYear(), month1Date.getMonth()) },
    { date: month2Date, days: getDaysInMonth(month2Date.getFullYear(), month2Date.getMonth()) }
  ];

  const daysOfWeek = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
      
      {/* Header section with month navigator */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary p-2.5 rounded-2xl">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">Kalendář obsazenosti</h3>
            <p className="text-xs text-slate-500">Kliknutím na dny v kalendáři si rovnou zvolíte termín</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button 
            type="button"
            onClick={handlePrevMonth}
            className="p-2 hover:bg-slate-50 rounded-xl border border-slate-200 transition-all text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={handleNextMonth}
            className="p-2 hover:bg-slate-50 rounded-xl border border-slate-200 transition-all text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Two Month Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {monthsToRender.map((monthData, monthIdx) => {
          const monthYearLabel = `${getCzechMonthName(monthData.date.getMonth())} ${monthData.date.getFullYear()}`;
          return (
            <div key={monthIdx} className="space-y-4">
              <div className="text-center">
                <span className="font-display font-bold text-slate-900 text-sm">{monthYearLabel}</span>
              </div>

              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {daysOfWeek.map((day, dIdx) => (
                  <div key={dIdx} className="py-1">{day}</div>
                ))}
              </div>

              {/* Grid of Days */}
              <div className="grid grid-cols-7 gap-1">
                {monthData.days.map((day, dayIdx) => {
                  if (day === null) {
                    return <div key={`empty-${dayIdx}`} className="aspect-square" />;
                  }

                  const dateStr = getFormatDateStr(day);
                  const status = getDateStatus(dateStr);
                  const isToday = dateStr === getFormatDateStr(new Date());

                  let btnClasses = "aspect-square rounded-xl text-xs font-semibold flex flex-col items-center justify-center relative transition-all cursor-pointer ";
                  let labelDotClass = "";

                  switch (status) {
                    case 'disabled':
                      btnClasses += "text-slate-300 bg-slate-50/50 cursor-not-allowed pointer-events-none";
                      break;
                    case 'occupied':
                      btnClasses += "bg-rose-50 text-rose-800 border border-rose-100 hover:bg-rose-100 line-through decoration-rose-300/60";
                      labelDotClass = "bg-rose-500";
                      break;
                    case 'pending':
                      btnClasses += "bg-amber-50/70 text-amber-800 border border-amber-100/60 hover:bg-amber-100";
                      labelDotClass = "bg-amber-500 animate-pulse";
                      break;
                    case 'selected-start':
                      btnClasses += "bg-primary text-white font-bold ring-2 ring-primary ring-offset-1 scale-105 z-10";
                      break;
                    case 'selected-end':
                      btnClasses += "bg-primary text-white font-bold ring-2 ring-primary ring-offset-1 scale-105 z-10";
                      break;
                    case 'selected':
                      btnClasses += "bg-primary/20 text-primary font-bold";
                      break;
                    case 'free':
                    default:
                      btnClasses += "bg-white border border-slate-100 text-slate-700 hover:border-primary hover:bg-primary/5 hover:scale-105";
                      if (isToday) {
                        btnClasses += " ring-1 ring-slate-400 ring-offset-1";
                      }
                      break;
                  }

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => handleDayClick(day)}
                      disabled={status === 'disabled'}
                      className={btnClasses}
                      title={`${day.getDate()}. ${getCzechMonthName(day.getMonth())} - ${
                        status === 'occupied' ? 'Obsazeno' : 
                        status === 'pending' ? 'Poptáno (v řešení)' : 
                        'Volno'
                      }`}
                    >
                      <span>{day.getDate()}</span>
                      
                      {/* Colored status dot at the bottom of the date button */}
                      {labelDotClass && (
                        <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 ${labelDotClass}`} />
                      )}

                      {/* Display special label for Start and End selections */}
                      {status === 'selected-start' && (
                        <span className="text-[7px] uppercase tracking-wider font-bold absolute bottom-0.5 leading-none text-white/90">OD</span>
                      )}
                      {status === 'selected-end' && (
                        <span className="text-[7px] uppercase tracking-wider font-bold absolute bottom-0.5 leading-none text-white/90">DO</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic explanatory legend and selection feedback */}
      <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-white border border-slate-200"></div>
          <span className="text-slate-600 font-medium">Volný termín</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-rose-50 border border-rose-200 relative flex items-center justify-center">
            <div className="w-2.5 h-[1px] bg-rose-300 rotate-45"></div>
          </div>
          <span className="text-slate-600 font-medium">Obsazeno (přijato)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
          </div>
          <span className="text-slate-600 font-medium">V řešení (poptávka)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-primary"></div>
          <span className="text-slate-600 font-medium">Váš vybraný termín</span>
        </div>
      </div>

      {/* Helper callout for client selections */}
      {startDate && !endDate && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3 flex gap-2.5 items-center">
          <Info className="w-4 h-4 text-primary animate-bounce" />
          <p className="text-xs text-primary font-semibold">
            Vybrali jste začátek <strong className="underline">{startDate}</strong>. Nyní klikněte na libovolné pozdější datum pro výběr konce pronájmu.
          </p>
        </div>
      )}

      {startDate && endDate && (
        <div className="bg-green-50/60 border border-green-200/80 rounded-2xl p-3.5 flex justify-between items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-green-100 text-green-700 p-1.5 rounded-lg">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-green-600 uppercase tracking-wider block font-bold">Vybraný termín</span>
              <strong className="text-xs text-green-800">{startDate} až {endDate}</strong>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelectRange('', '')}
            className="text-[10px] bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 font-bold px-2.5 py-1.5 rounded-lg cursor-pointer transition-all"
          >
            Vymazat
          </button>
        </div>
      )}
    </div>
  );
}
