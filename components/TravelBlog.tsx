
import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Ship, Compass, ArrowLeft, ChevronRight } from 'lucide-react';

interface TravelBlogProps {
  onBack: () => void;
}

const TravelBlog: React.FC<TravelBlogProps> = ({ onBack }) => {
  const posts = [
    {
      id: 'dolomites',
      title: 'Dolomity obytným vozem: Kompletní průvodce expedicí',
      icon: '🏔️',
      content: `Dolomity jsou pro karavanisty naprostým rájem. Tato oblast zapsaná na seznamu UNESCO nabízí jedny z nejkrásnějších výhledů v Evropě, které můžete mít přímo z okna svého obytňáku.

Hlavní klíčové slovo: Dolomity obytným vozem
Meta Description: Kompletní průvodce pro cestu do Dolomit obytným vozem. Tipy na nejlepší stání, trasy a praktické rady pro vaši horskou expedici.

Kde parkovat a spát:
1. Tre Cime di Lavaredo: Legendární parkoviště u chaty Auronzo. Je to jedno z nejdražších stání (cca 45€/24h), ale probuzení s výhledem na "Tři zuby" je k nezaplacení.
2. Passo Giau: Úchvatné sedlo s možností denního parkování. Pro nocleh hledejte vyhrazená místa v údolí.
3. Cortina d'Ampezzo: Skvělá základna s kompletním servisem v kempech.

Praktické tipy:
- Výškové limity: Náš Ahorn má 3,1m. Většina průsmyků je průjezdná, ale vždy sledujte značení před vjezdem do tunelů nebo pod převisy.
- Brzdy: Při sjezdech z průsmyků brzděte motorem. Renault Master má skvělou motorovou brzdu, využívejte ji!
- Voda: V horách je dostatek pítek, ale pro doplnění 100L nádrže hledejte oficiální "Area Sosta".`,
      tags: ['Itálie', 'Hory', 'Expedice'],
      mapUrl: 'https://www.google.com/maps/d/embed?mid=1_placeholder_dolomites'
    },
    {
      id: 'first-time',
      title: 'Poprvé v obytňáku: Manuál pro začátečníky',
      icon: '🔰',
      content: `Cesta obytným vozem je o svobodě, ale vyžaduje trochu jiný přístup než cesta osobákem. Tady je vše, co potřebujete vědět pro vaši první jízdu.

Hlavní klíčové slovo: První cesta obytným vozem
Meta Description: Chystáte se na svou první cestu obytňákem? Přečtěte si náš manuál pro začátečníky – od ovládání vozu až po etiketu v kempech.

Před startem:
- Checklist: Vždy zkontrolujte, zda jsou zavřená všechna okna, zajištěné skříňky a odpojená elektřina.
- Rozměry: Pamatujte, že jedete s vozem vysokým 3,1m a dlouhým 7m. Do McDrive raději nejezděte. :)

Život na palubě:
- Voda: Šetřete s ní. 100 litrů vydrží 2-3 dny běžného provozu.
- Elektřina: Solární panel dobíjí baterii nástavby, ale pro klimatizaci nebo kávovar se musíte připojit v kempu.
- WC: Používejte speciální chemii a vyprazdňujte pouze na určených místech.`,
      tags: ['Tipy', 'Začátečník', 'Manuál']
    },
    {
      id: 'albania',
      title: 'Albánie obytňákem: Průvodce divokým kempováním',
      icon: '🇦🇱',
      content: `Albánie je jednou z posledních zemí v Evropě, kde je divoké kempování stále široce tolerováno a kde zažijete skutečnou svobodu.

Hlavní klíčové slovo: Albánie obytným vozem
Meta Description: Objevte krásy Albánie s obytným vozem. Tipy na divoké kempování, nejkrásnější pláže a horské trasy v zemi orlů.

Kam vyrazit:
1. Albánská riviéra: Pláže jako Gjipe nebo Lukovë nabízejí možnost stát téměř u moře.
2. Národní park Theth: Cesta do hor je nyní vyasfaltovaná, takže i náš Ahorn ji zvládne. Výhledy jsou nepopsatelné.
3. Berat a Gjirokastër: Historická města s unikátní atmosférou.

Bezpečnost a etiketa:
- Místní lidé jsou neuvěřitelně pohostinní. Často vám nabídnou kávu nebo ovoce.
- Vždy po sobě ukliďte. Albánie bojuje s odpady, nebuďte součástí problému.`,
      tags: ['Albánie', 'Divočina', 'Dobrodružství']
    },
    {
      id: 'ahorn-review',
      title: 'Recenze Ahorn Canada TU Plus: Proč je to král prostoru?',
      icon: '🚐',
      content: `Představujeme vám náš vlajkový vůz. Proč jsme vybrali právě Ahorn Canada TU Plus pro naši půjčovnu v Brně?

Hlavní klíčové slovo: Recenze Ahorn Canada TU Plus
Meta Description: Detailní recenze obytného vozu Ahorn Canada TU Plus. Zjistěte, proč je zadní sezení ve tvaru U revoluční a jak se v něm bydlí.

Zadní sezení "U":
Toto je největší tahák vozu. Zatímco ostatní vozy mají vzadu postele, Ahorn tam má obrovský obývací pokoj s výhledem do tří stran. Večery u vína s výhledem na hory nebo moře jsou v tomto voze nezapomenutelné.

Technické parametry:
- Podvozek: Renault Master (velmi pohodlný a tichý)
- Lůžka: Elektricky spouštěcí lůžko nad sezením + rozkládací sezení.
- Kuchyně: Velká lednice s mrazákem, tříplotýnkový vařič.`,
      tags: ['Recenze', 'Technika', 'Ahorn']
    },
    {
      id: 'winter-camping',
      title: 'Zimní kempování: Jak nezmrznout a užít si hory',
      icon: '❄️',
      content: `Kempování v zimě má své kouzlo. Prázdné kempy, ranní káva s výhledem na zasněžené sjezdovky a útulné teplo uvnitř vozu.

Hlavní klíčové slovo: Zimní kempování obytným vozem
Meta Description: Průvodce zimním kempováním. Jak připravit obytný vůz na mráz, jak efektivně topit a na co si dát pozor při cestě na hory.

Topení a izolace:
Náš vůz je vybaven výkonným plynovým topením Truma s rozfukem po celém voze včetně koupelny. Izolovaná nádrž na odpadní vodu umožňuje provoz i v mrazech.

Tipy pro zimu:
- Plyn: V zimě spotřebujete jednu 11kg lahev za 2-4 dny. Vždy mějte záložní.
- Sněhové řetězy: Povinná výbava, kterou vám k vozu rádi zapůjčíme.
- Větrání: I v zimě je nutné krátce a intenzivně větrat, aby se uvnitř nesrážela vlhkost.`,
      tags: ['Zima', 'Hory', 'Tipy']
    }
  ];

  const [selectedPost, setSelectedPost] = React.useState<typeof posts[0] | null>(null);

  if (selectedPost) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button 
          onClick={() => setSelectedPost(null)}
          className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Zpět na přehled článků
        </button>

        <div className="bg-white rounded-[3rem] p-8 md:p-16 border border-slate-100 shadow-2xl">
          <div className="text-6xl mb-8">{selectedPost.icon}</div>
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedPost.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-10 tracking-tight leading-tight">
            {selectedPost.title}
          </h1>
          
          <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap font-medium text-lg mb-12">
            {selectedPost.content}
          </div>

          {selectedPost.mapUrl && (
            <div className="mt-12">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-600" />
                Interaktivní mapa trasy
              </h3>
              <div className="aspect-video rounded-[2rem] overflow-hidden border border-slate-100 shadow-inner bg-slate-50">
                <iframe 
                  src={selectedPost.mapUrl} 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy"
                  title={`Mapa - ${selectedPost.title}`}
                />
              </div>
              <p className="mt-4 text-xs text-slate-400 font-medium italic">
                * Toto je ukázková mapa. Pro reálné články zde bude vložen kód z Google My Maps.
              </p>
            </div>
          )}

          <div className="mt-16 pt-16 border-t border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white font-black text-xs">OB</div>
              <div>
                <div className="text-sm font-black text-slate-900 uppercase tracking-widest">Obytkem.cz</div>
                <div className="text-xs text-slate-400 font-bold">Specialista na svobodu</div>
              </div>
            </div>
            <button 
              onClick={onBack}
              className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-orange-600 transition-all shadow-xl"
            >
              Rezervovat vůz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 overflow-x-hidden">
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

      <div className="grid md:grid-cols-2 gap-8">
        {posts.map((post, idx) => (
          <motion.div 
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => setSelectedPost(post)}
            className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer flex flex-col"
          >
            <div className="flex gap-6 mb-6">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-4xl shrink-0 group-hover:scale-110 transition-transform">
                {post.icon}
              </div>
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-orange-600 transition-colors">{post.title}</h2>
              </div>
            </div>
            <p className="text-slate-500 text-sm line-clamp-3 mb-6 font-medium leading-relaxed">
              {post.content.split('\n')[0]}
            </p>
            <div className="mt-auto flex items-center text-[10px] font-black text-orange-600 uppercase tracking-widest">
              Číst celý článek <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
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
