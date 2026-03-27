import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Circle, AlertTriangle, Truck, Home, Settings, Navigation } from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  category: 'exterior' | 'interior' | 'tech' | 'safety';
}

const checklistItems: ChecklistItem[] = [
  { id: '1', text: 'Zavřená všechna střešní okna', category: 'exterior' },
  { id: '2', text: 'Zatažený nástupní schůdek', category: 'exterior' },
  { id: '3', text: 'Odpojený kabel 230V', category: 'exterior' },
  { id: '4', text: 'Zajištěná a uzamčená garáž', category: 'exterior' },
  { id: '5', text: 'Zajištěná lednice (západka)', category: 'interior' },
  { id: '6', text: 'Zavřené všechny skříňky na pojistku', category: 'interior' },
  { id: '7', text: 'Uklizené volné předměty (kávovar, nádobí)', category: 'interior' },
  { id: '8', text: 'Vypnuté čerpadlo vody', category: 'tech' },
  { id: '9', text: 'Zavřený plyn (pokud není MonoControl)', category: 'tech' },
  { id: '10', text: 'Nastavená zrcátka a sedačka', category: 'safety' },
  { id: '11', text: 'Všichni cestující připoutáni', category: 'safety' },
  { id: '12', text: 'Kontrola výšky vozu (3.1m) před trasou', category: 'safety' },
];

interface ChecklistProps {
  onBack: () => void;
}

const Checklist: React.FC<ChecklistProps> = ({ onBack }) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('pujcimedodavky_checklist');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  React.useEffect(() => {
    localStorage.setItem('pujcimedodavky_checklist', JSON.stringify(Array.from(checkedItems)));
  }, [checkedItems]);

  const toggleItem = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  const progress = (checkedItems.size / checklistItems.length) * 100;

  const renderCategory = (category: ChecklistItem['category'], title: string, Icon: any) => {
    const items = checklistItems.filter(item => item.category === category);
    return (
      <div className="mb-8" id={`category-${category}`}>
        <div className="flex items-center gap-2 mb-4">
          <Icon className="w-5 h-5 text-brand-primary" />
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">{title}</h3>
        </div>
        <div className="space-y-3">
          {items.map((item) => (
            <motion.div
              key={item.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleItem(item.id)}
              className={`flex items-center gap-4 p-5 rounded-[1.5rem] border transition-all cursor-pointer ${
                checkedItems.has(item.id)
                  ? 'bg-brand-primary/5 border-brand-primary/20'
                  : 'bg-white border-slate-100 hover:border-brand-primary/20 hover:shadow-sm'
              }`}
            >
              {checkedItems.has(item.id) ? (
                <CheckCircle2 className="w-6 h-6 text-brand-primary flex-shrink-0" />
              ) : (
                <Circle className="w-6 h-6 text-slate-200 flex-shrink-0" />
              )}
              <span className={`text-sm font-bold ${checkedItems.has(item.id) ? 'text-brand-primary line-through opacity-60' : 'text-slate-700'}`}>
                {item.text}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-32 overflow-x-hidden">
      <div className="max-w-2xl mx-auto px-6">
        <button 
          onClick={onBack}
          className="mb-8 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-primary flex items-center gap-2 transition-colors"
        >
          ← Zpět na úvod
        </button>

        <div className="card-ultimate p-10 shadow-ultimate mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-[9px] font-black uppercase tracking-widest rounded-full">
              Bezpečnost především
            </span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">Checklist před startem</h1>
          
          <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="absolute top-0 left-0 h-full bg-brand-primary"
            />
          </div>
          <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>{checkedItems.size} z {checklistItems.length} hotovo</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {progress === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-10 p-8 bg-emerald-50 border border-emerald-100 rounded-[2.5rem] flex items-center gap-6 shadow-ultimate shadow-emerald-100"
          >
            <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <Navigation className="w-7 h-7" />
            </div>
            <div>
              <h4 className="font-black text-emerald-900 text-lg">Vše je připraveno!</h4>
              <p className="text-sm text-emerald-700 font-medium">Můžete bezpečně vyrazit na cestu. Šťastnou cestu!</p>
            </div>
          </motion.div>
        )}

        {renderCategory('exterior', 'Exteriér vozu', Truck)}
        {renderCategory('interior', 'Interiér a obytná část', Home)}
        {renderCategory('tech', 'Technika a plyn', Settings)}
        {renderCategory('safety', 'Bezpečnost jízdy', AlertTriangle)}

        <div className="mt-16 p-10 bg-slate-900 rounded-[3rem] text-white text-center shadow-ultimate">
          <h3 className="text-2xl font-black mb-4">Potřebujete PDF verzi?</h3>
          <p className="text-slate-400 text-sm mb-8 font-medium">Stáhněte si checklist do telefonu pro případ, že budete bez signálu.</p>
          <button className="btn-ultimate-primary w-full py-5 text-xs shadow-xl shadow-brand-primary/20">
            Stáhnout PDF checklist
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checklist;
