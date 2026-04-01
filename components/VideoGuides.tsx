
import React from 'react';
import { motion } from 'motion/react';
import { Play, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

const VideoGuides: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const guides = [
    {
      title: "Představení vozu",
      duration: "5:20",
      thumbnail: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=800&auto=format&fit=crop",
      description: "Základní seznámení s vozem Ahorn Canada TU Plus a jeho ovládáním."
    },
    {
      title: "Obsluha kuchyně a plynu",
      duration: "3:45",
      thumbnail: "https://images.unsplash.com/photo-1517090504586-fde19ea6066f?q=80&w=800&auto=format&fit=crop",
      description: "Jak bezpečně používat vařič, lednici a plynovou bombu."
    },
    {
      title: "Voda a odpad",
      duration: "4:15",
      thumbnail: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop",
      description: "Doplňování čisté vody a vypouštění šedé vody a chemického WC."
    },
    {
      title: "Topení a elektřina",
      duration: "6:10",
      thumbnail: "https://images.unsplash.com/photo-1513243858048-9302627f1c39?q=80&w=800&auto=format&fit=crop",
      description: "Nastavení nezávislého topení a správa baterií v nástavbě."
    }
  ];

  return (
    <section id="video-guides" className={`py-24 px-4 transition-colors duration-500 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-widest mb-4">
            <Play size={12} fill="currentColor" />
            Video návody
          </div>
          <h2 className={`text-4xl md:text-5xl font-black mb-6 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Vše, co potřebujete vědět
          </h2>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto">
            Připravili jsme pro vás detailní video návody, aby vaše první cesta obytným vozem byla naprosto bezstarostná.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {guides.map((guide, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`group rounded-[2.5rem] overflow-hidden border transition-all duration-500 ${
                isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-brand-primary/50' : 'bg-slate-50 border-slate-100 hover:border-brand-primary/50 shadow-xl'
              }`}
            >
              <div className="relative aspect-video overflow-hidden">
                <img 
                  src={guide.thumbnail} 
                  alt={guide.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-12 h-12 rounded-full bg-brand-primary text-white flex items-center justify-center shadow-xl">
                    <Play size={20} fill="currentColor" className="ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white">
                  {guide.duration}
                </div>
              </div>
              <div className="p-6 space-y-3">
                <h3 className={`text-lg font-black leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {guide.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {guide.description}
                </p>
                <button className="flex items-center gap-2 text-[10px] font-black text-brand-primary uppercase tracking-widest pt-2 group-hover:gap-3 transition-all">
                  Přehrát video
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className={`mt-16 p-8 md:p-12 rounded-[3rem] border flex flex-col md:flex-row items-center justify-between gap-8 ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100 shadow-premium'
        }`}>
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-green-500/10 flex items-center justify-center text-green-500">
              <FileText size={32} />
            </div>
            <div>
              <h4 className={`text-xl font-black mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Kompletní manuál v PDF</h4>
              <p className="text-sm text-slate-500 font-medium">Stáhněte si podrobný návod k obsluze do svého telefonu.</p>
            </div>
          </div>
          <button className="btn-ultimate-primary px-10 py-5 text-xs whitespace-nowrap">
            Stáhnout manuál (PDF)
          </button>
        </div>
      </div>
    </section>
  );
};

export default VideoGuides;
