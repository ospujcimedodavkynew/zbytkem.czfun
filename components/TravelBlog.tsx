
import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Ship, Compass, ArrowLeft } from 'lucide-react';

interface TravelBlogProps {
  onBack: () => void;
}

const TravelBlog: React.FC<TravelBlogProps> = ({ onBack }) => {
  const posts = [
    {
      id: 'italy',
      title: 'Itálie obytným vozem: Od Dolomit po Toskánsko',
      icon: '🇮🇹',
      content: `Itálie je pro karavanisty zaslíbenou zemí. Nabízí perfektní infrastrukturu, tisíce kempů a tzv. "Area Sosta" (stání pro obytná auta). 
      
      Dolomity: Ideální pro milovníky hor. Doporučujeme oblast kolem Tre Cime di Lavaredo. Pozor na výškové limity v některých průsmycích.
      Toskánsko: Projíždějte mezi vinicemi a historickými městy jako Siena nebo San Gimignano. Většina vinařství nabízí stání výměnou za nákup vína.
      Pobřeží: Amalfi je pro velké obytňáky výzvou kvůli úzkým silnicím, raději volte kempy v Salernu a využijte trajekt nebo bus.`,
      tags: ['Itálie', 'Hory', 'Moře']
    },
    {
      id: 'balkans',
      title: 'Černá Hora a Albánie: Poslední divočina Evropy',
      icon: '🇲🇪',
      content: `Pokud hledáte dobrodružství a méně zaplněné kempy, vyrazte na jih.
      
      Černá Hora: Národní park Durmitor nabízí úchvatné výhledy a možnost kempování v srdci hor. Kotorský záliv je pak povinnou zastávkou u moře.
      Albánie: Země, která vás překvapí svou pohostinností. Divoké kempování je zde stále tolerováno, ale vždy respektujte přírodu. Doporučujeme pláže na jihu (Ksamil, Himarë) a hory na severu (Theth).`,
      tags: ['Černá Hora', 'Albánie', 'Dobrodružství']
    },
    {
      id: 'croatia',
      title: 'Chorvatsko: Ostrovy a křišťálové moře',
      icon: '🇭🇷',
      content: `Chorvatsko je klasikou, ale s obytňákem ho zažijete jinak. 
      
      Ostrovy: Nebojte se trajektů! Na ostrovy jako Brač, Hvar nebo Cres se dostanete snadno. Ceny trajektů pro obytná auta se liší podle délky (náš Ahorn má 7m, což je střední kategorie).
      Kempy: V Chorvatsku je zakázáno kempovat "nadivoko". Využívejte síť kempů, které jsou často přímo u vody.`,
      tags: ['Chorvatsko', 'Ostrovy', 'Rodina']
    },
    {
      id: 'ferries',
      title: 'Jak na trajekty s obytným vozem',
      icon: '🚢',
      content: `Cesta trajektem vám ušetří stovky kilometrů a nabídne skvělý zážitek.
      
      Kde se nalodit: 
      - Benátky (Venezia): Ideální pro cestu do Řecka nebo Chorvatska.
      - Ancona: Hlavní uzel pro cesty do Řecka (Patras, Igoumenitsa) a Albánie (Durrës).
      - Bari: Nejlepší startovní bod pro cestu do Černé Hory (Bar) nebo jižní Itálie.
      
      Tipy pro nalodění:
      1. Rezervujte včas (zejména v sezóně).
      2. Uveďte přesné rozměry (včetně výšky 3m a délky 7m).
      3. Na palubě vypněte plyn a lednici přepněte na baterii nebo plyn (pokud je povoleno v režimu "Camping on Board").`,
      tags: ['Trajekty', 'Logistika', 'Tipy']
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Zpět na úvod
      </button>

      <div className="mb-16 text-center">
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-6">Cestovatelský blog</h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
          Inspirace pro vaše cesty s naším obytným vozem. Tipy na nejkrásnější místa, kempy a praktické rady z cest.
        </p>
      </div>

      <div className="grid gap-12">
        {posts.map((post, idx) => (
          <motion.div 
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
          >
            <div className="flex flex-col md:flex-row gap-10">
              <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center text-5xl shrink-0 group-hover:scale-110 transition-transform">
                {post.icon}
              </div>
              <div className="flex-grow">
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-6">{post.title}</h2>
                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                  {post.content}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 p-12 bg-slate-900 rounded-[3rem] text-white text-center">
        <Compass className="w-12 h-12 text-orange-500 mx-auto mb-6" />
        <h2 className="text-3xl font-black mb-4">Chcete vyrazit také?</h2>
        <p className="text-slate-400 font-medium mb-8 max-w-xl mx-auto">
          Všechna tato místa jsou s naším Ahorn Canada TU Plus na dosah ruky. Rezervujte si svůj termín ještě dnes.
        </p>
        <button 
          onClick={onBack}
          className="px-12 py-5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-500 hover:text-white transition-all"
        >
          Zarezervovat vůz
        </button>
      </div>
    </div>
  );
};

export default TravelBlog;
