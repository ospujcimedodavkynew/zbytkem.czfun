
import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Droplets, Zap, Wind, Shield, Info, AlertTriangle } from 'lucide-react';

interface GuidesDetailProps {
  onBack: () => void;
}

const GuidesDetail: React.FC<GuidesDetailProps> = ({ onBack }) => {
  const guides = [
    {
      id: 'wc',
      title: 'WC a odpadní voda',
      icon: <Droplets className="w-8 h-8 text-blue-500" />,
      content: `Kazeta WC se nachází v servisním otvoru zvenčí. Po naplnění ji vyjměte, vyprázdněte na určeném místě (v kempu) a doplňte chemii. Šedá voda (z dřezu a sprchy) se vypouští ventilem pod vozem.`,
      tips: [
        'Vždy používejte speciální chemii do WC kazety.',
        'Kazetu vyprazdňujte pouze na místech k tomu určených (v kempech nebo na servisních stanicích).',
        'Šedou vodu vypouštějte pravidelně, aby se předešlo zápachu.'
      ]
    },
    {
      id: 'electricity',
      title: 'Elektřina a plyn',
      icon: <Zap className="w-8 h-8 text-orange-500" />,
      content: `Vůz má vlastní baterii dobíjenou solárem. Pro 230V zásuvky a klimatizaci se musíte připojit kabelem v kempu. Plyn slouží pro vaření, topení a ohřev vody (vždy mějte otevřenou lahev).`,
      tips: [
        'Při stání nadivoko šetřete elektřinou, solár dobíjí baterii pouze přes den.',
        'Před jízdou vždy zavřete plynovou lahev (pokud vůz nemá MonoControl).',
        'V kempu se vždy připojte kabelem, abyste šetřili baterii nástavby.'
      ]
    },
    {
      id: 'water',
      title: 'Voda a doplňování',
      icon: <Wind className="w-8 h-8 text-blue-400" />,
      content: `Nádrž na čistou vodu (100L) se plní zvenčí hadicí. Stav vody uvidíte na kontrolním panelu nad dveřmi. Vždy používejte pitnou vodu z ověřených zdrojů.`,
      tips: [
        'Vodu doplňujte raději častěji, abyste měli vždy rezervu.',
        'Při plnění hadicí v kempu nechte vodu chvíli odtéct, než ji začnete plnit do nádrže.',
        'V zimě nezapomeňte na vypouštění vody, pokud vůz netopí.'
      ]
    },
    {
      id: 'driving',
      title: 'Jízda a rozměry',
      icon: <Shield className="w-8 h-8 text-green-500" />,
      content: `Vůz je vysoký 3 metry a dlouhý 7 metrů. Pozor na podjezdy a větve! Při couvání vždy využívejte kameru a ideálně i pomocníka venku. Nezapomeňte před jízdou zavřít všechna okna a zajistit skříňky.`,
      tips: [
        'Pamatujte na výšku 3 metry – pozor na mosty a větve stromů.',
        'Před jízdou vždy zkontrolujte, zda jsou všechna střešní okna zavřená.',
        'Všechny skříňky a lednice musí být před jízdou zajištěny.'
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 overflow-x-hidden">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-brand-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Zpět na úvod
      </button>

      <div className="mb-16 text-center">
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-6 gradient-text">Návody a rady</h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
          Vše, co potřebujete vědět pro bezstarostné cestování s naším obytným vozem. Podrobné návody pro začátečníky i pokročilé.
        </p>
      </div>

      <div className="grid gap-12">
        {guides.map((guide, idx) => (
          <motion.div 
            key={guide.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="card-ultimate p-8 md:p-12 shadow-ultimate"
          >
            <div className="flex flex-col md:flex-row gap-10">
              <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center shrink-0">
                {guide.icon}
              </div>
              <div className="flex-grow">
                <h2 className="text-3xl font-black text-slate-900 mb-6">{guide.title}</h2>
                <p className="text-lg text-slate-600 leading-relaxed mb-8 font-medium">
                  {guide.content}
                </p>
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-brand-primary uppercase tracking-widest flex items-center gap-2">
                    <Info className="w-4 h-4" /> Praktické tipy
                  </h3>
                  <ul className="grid gap-3">
                    {guide.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-700">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0"></div>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 p-12 glass rounded-[3rem] border border-white/20 shadow-ultimate">
        <div className="flex flex-col md:flex-row items-center gap-10">
          <div className="w-20 h-20 bg-brand-primary/10 rounded-3xl flex items-center justify-center text-brand-primary shrink-0">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-4">Máte další dotazy?</h2>
            <p className="text-slate-600 font-medium leading-relaxed">
              Při předání vozu vám vše podrobně vysvětlíme a ukážeme. Pokud si nebudete vědět rady během cesty, jsme vám k dispozici na telefonu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidesDetail;
