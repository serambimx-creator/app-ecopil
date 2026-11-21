'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Landmark, Mountain, Trees, TreePine, Waves, Fish, MapPin, Thermometer, Mountain as AltIcon } from 'lucide-react';
import { clsx } from 'clsx';
import Mixtli from '@/components/brand/Mixtli';

type TabType = 'historia' | 'geologia' | 'biologia' | 'llevar';

const SEDES_DATA = [
  {
    day: 18,
    name: 'Parque Nacional Tula',
    icon: Landmark,
    imageUrl: '/guia/optimized/tula.webp',
    altText: 'Pirámides y atlantes de Tula',
    altitud: '2,020 msnm',
    clima: '5–18°C',
    climaTipo: 'Semiseco templado',
    historia: 'Capital tolteca Tollan-Xicocotitlan, 700-1150 d.C., ~85,000 habitantes. Fundada por Ce Acatl Topiltzin Quetzalcóatl. Atlantes de basalto de 4.6m únicos en Mesoamérica. Parque Nacional decretado en 1981, 99.5 ha.',
    geologia: 'Valle del Mezquital sobre calizas y lutitas del Cretácico con intrusiones volcánicas. Río Tula en depósitos aluviales del Cuaternario. Parte del Geoparque Mundial UNESCO (Comarca Minera, 2017).',
    biologia: 'Matorral xerófilo y mezquital. Flora: mezquite, maguey pulquero, nopales, yuca, acacia. Fauna: conejos, ardillas, correcaminos, coyotes, tlacuaches, víbora hocico de puerco.',
    llevar: {
      items: ['Ropa de capas (mañana fría 5°C / tarde cálida 18°C)', 'Protector solar (zona abierta sin sombra)', 'Zapatos cerrados cómodos', 'Agua mínimo 1.5L por persona', 'Sombrero o gorra'],
      alerta: null,
    },
  },
  {
    day: 18,
    name: 'Grutas Xoxafi',
    icon: Mountain,
    imageUrl: '/guia/optimized/xoxafi.webp',
    altText: 'Grutas Xoxafi con formaciones kársticas',
    altitud: '1,900 msnm',
    clima: '4–17°C',
    climaTipo: 'Semiseco',
    historia: 'Ecoparque en Valle del Mezquital con grutas naturales de más de 500m explorable. Punto estratégico para educación ambiental en zona otomí-hñähñú. Ofrece espeleología, tirolesas y feria ambiental.',
    geologia: 'Formaciones kársticas en calizas del Cretácico formadas por disolución de carbonato de calcio. Valle del Mezquital es depresión tectónica entre serranías del Eje Neovolcánico.',
    biologia: 'Interior: 3 especies de murciélagos (Tadarida brasiliensis, Myotis sp.), microfauna especializada. Exterior: matorral crassicaule con cardones, biznagas y fauna de zona árida.',
    llevar: {
      items: ['Linterna o headlamp (obligatorio en grutas)', 'Ropa que pueda ensuciarse', 'Botas con agarre', 'Efectivo para propinas y compras personales'],
      alerta: 'Interior de grutas ~10°C constante — llevar chamarra aunque afuera haga calor.',
    },
  },
  {
    day: 19,
    name: 'Villa de Tezontepec',
    icon: Trees,
    imageUrl: '/guia/optimized/tezontepec.webp',
    altText: 'Vista del municipio de Villa de Tezontepec',
    altitud: '1,800 msnm',
    clima: '4–18°C',
    climaTipo: 'Templado seco',
    historia: 'Municipio del Valle de Tezontepec, zona de tradición agrícola y ganadera. Centro histórico con presidencia municipal del siglo XIX. Zona de influencia otomí con producción de barbacoa y artesanías en piel.',
    geologia: 'Planicie aluvial del Valle de México con suelos volcánicos derivados de tezontle (roca volcánica escoriácea roja). El nombre Tezontepec deriva del náhuatl: "cerro de tezontle".',
    biologia: 'Agricultura de temporal, pastizales y zonas de matorral. Actividades de reforestación con especies nativas de la región semiárida hidalguense.',
    llevar: {
      items: ['Ropa cómoda para trabajo de reforestación', 'Guantes', 'Calzado resistente', 'Ropa que pueda ensuciarse', 'Protector solar'],
      alerta: null,
    },
  },
  {
    day: 20,
    name: 'Acaxochitlán · Cascadas Dos Mundos',
    icon: Waves,
    imageUrl: '/guia/optimized/acaxochitlan.webp',
    altText: 'Cascadas Dos Mundos en Acaxochitlán',
    altitud: '2,260 msnm',
    clima: '5–16°C',
    climaTipo: 'Templado húmedo',
    historia: 'Nombre náhuatl "lugar donde abunda el Acaxochitl" (carrizo de flor roja). Comunidades otomíes y tepehuas. Las Cascadas Dos Mundos son gestionadas ecoturísticamente por la comunidad de San Fernando. Municipio con ríos Tecolutla y Cazones.',
    geologia: 'Transición entre Eje Neovolcánico y Sierra Madre Oriental. Afloramientos de rocas ígneas extrusivas con depósitos fluviales en cañadas. Cascadas formadas por fracturas volcánicas que canalizan agua subterránea a la superficie.',
    biologia: 'Bosque mesófilo de montaña — uno de los ecosistemas más biodiversos de México. Flora: helechos arborescentes, bromelias, orquídeas, musgos. Corredor de aves migratorias en diciembre. Colinda con Puebla, alta conectividad biológica.',
    llevar: {
      items: ['Botas impermeables (sendero con lodo y agua)', 'Impermeable ligero (neblina constante)', 'Proteger equipo electrónico de humedad', 'Botiquín básico', 'Ropa de capas', 'Efectivo: entrada al manantial $30 por persona'],
      alerta: null,
    },
  },
  {
    day: 20,
    alsoDay: 21,
    name: 'Tulancingo · Ajolotequio',
    icon: Fish,
    imageUrl: '/guia/optimized/ajolote.webp',
    altText: 'Axolote mexicano (Ambystoma mexicanum)',
    altitud: '2,100 msnm',
    clima: '6–20°C',
    climaTipo: 'Templado',
    historia: '"Tulancingo" del náhuatl "lugar de pequeños tules". Segunda ciudad más importante de Hidalgo. El ajolotequio es un centro de conservación del axolote (Ambystoma mexicanum), anfibio endémico de México en peligro crítico de extinción.',
    geologia: 'Cuenca de Tulancingo, depresión volcánica rodeada de serranías. Suelos volcánicos fértiles del Eje Neovolcánico. Zona hidrológica importante con manantiales y corrientes que alimentan el sistema Tula-Moctezuma.',
    biologia: 'El axolote (Ambystoma mexicanum) es un anfibio neoténico — retiene características larvales toda su vida. Capaz de regenerar extremidades, corazón y partes del cerebro. Especie clave para investigación biomédica mundial.',
    llevar: {
      items: ['Ropa de trabajo que pueda ensuciarse (tequio: biopiscina, maguey, jagüey)', 'Insumos propios para temazcal y campamento', 'Ropa abrigadora para la noche', 'Actitud de observación y respeto con los animales'],
      alerta: 'Temazcal y campamento con registro previo. Se duerme en Ajolotequio la noche del 20.',
    },
  },
];

const DAYS = [17, 18, 19, 20, 21];

// Sedes que se visitan en más de un día (p. ej. Ajolotequio: tequio el 20, cierre el 21)
type Sede = (typeof SEDES_DATA)[number] & { alsoDay?: number; tentative?: boolean };

function ImageWithFallback({
  url,
  alt,
  icon: IconComponent
}: {
  url: string;
  alt: string;
  icon: React.ComponentType<any>
}) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="w-full h-52 bg-[var(--t-accent-tint-bg)] flex items-center justify-center">
        <IconComponent size={48} className="text-[var(--t-text-faint)]" />
      </div>
    );
  }

  return (
    <Image
      src={url}
      alt={alt}
      width={800}
      height={400}
      onError={() => setError(true)}
      className="w-full h-52 object-cover"
    />
  );
}

function InfoCard({ label, value, type }: { label: string; value: string; type: 'clima' | 'temp' | 'alt' }) {
  // Colores del logo de Ecopil: lomas (verde claro), sol (amarillo), tierra (café Mixtli)
  const styles = {
    clima: 'bg-ecopil-leaf',
    temp: 'bg-ecopil-sun',
    alt: 'bg-mixtli',
  };

  return (
    <div className={clsx('sticker rounded-2xl px-3 py-2 text-ink', styles[type])}>
      <p className="font-futura text-[10px] font-bold uppercase tracking-wider opacity-75">{label}</p>
      <p className="text-sm font-extrabold mt-0.5 leading-tight">{value}</p>
    </div>
  );
}

function SedeCard({ sede, isActive }: { sede: Sede; isActive: boolean }) {
  const [activeTab, setActiveTab] = useState<TabType>('historia');

  const tabs: { key: TabType; label: string }[] = [
    { key: 'historia', label: 'Historia' },
    { key: 'geologia', label: 'Geología' },
    { key: 'biologia', label: 'Biología' },
    { key: 'llevar', label: 'Qué llevar' },
  ];

  const IconComponent = sede.icon;

  return (
    <div className={clsx(
      'bg-[var(--t-surface)] border-2 border-[var(--t-border)] rounded-3xl overflow-hidden transition-all',
      isActive ? 'opacity-100' : 'hidden'
    )}>
      <ImageWithFallback url={sede.imageUrl} alt={sede.altText} icon={IconComponent} />

      <div className="p-5 space-y-4">
        <div className="flex items-start gap-3">
        <span className="sticker flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-green text-ink">
          <IconComponent size={20} />
        </span>
        <div className="flex-1">
          <h3 className="font-display text-xl font-semibold leading-tight text-[var(--t-text)]">{sede.name}</h3>
          {sede.tentative && (
            <span className="inline-block mt-1 bg-ecopil-sun/30 text-[var(--t-text)] border border-ecopil-orange text-[10px] font-bold px-2 py-0.5 rounded-full">
              TENTATIVO
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <InfoCard label="Altitud" value={sede.altitud} type="alt" />
        <InfoCard label="Temperatura" value={sede.clima} type="temp" />
        <InfoCard label="Clima" value={sede.climaTipo} type="clima" />
      </div>

      <div className="flex gap-1 rounded-full bg-[var(--t-surface-2)] p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              'font-futura flex-1 shrink-0 whitespace-nowrap rounded-full text-[11px] font-bold px-3 py-1.5 transition-colors',
              activeTab === tab.key
                ? 'sticker bg-[var(--t-surface)] text-[var(--t-text)]'
                : 'border-2 border-transparent text-[var(--t-text-faint)] hover:text-[var(--t-text)]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {activeTab === 'historia' && (
          <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{sede.historia}</p>
        )}
        {activeTab === 'geologia' && (
          <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{sede.geologia}</p>
        )}
        {activeTab === 'biologia' && (
          <p className="text-sm text-[var(--t-text-secondary)] leading-relaxed">{sede.biologia}</p>
        )}
        {activeTab === 'llevar' && (
          <div className="space-y-2">
            <div className="bg-[var(--t-accent-tint-bg)] border-2 border-[var(--t-accent-tint-border)] rounded-2xl p-3 space-y-2">
              {sede.llevar.items.map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <span className="text-[var(--t-accent)] text-xs font-black mt-1">✓</span>
                  <span className="text-sm text-[var(--t-text-secondary)]">{item}</span>
                </div>
              ))}
            </div>
            {sede.llevar.alerta && (
              <div className="bg-ecopil-sun/25 border-2 border-ecopil-orange rounded-2xl p-3">
                <p className="font-futura text-xs text-[var(--t-text)] font-bold uppercase mb-1">⚠ Ojo</p>
                <p className="text-sm text-[var(--t-text-secondary)]">{sede.llevar.alerta}</p>
              </div>
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

export default function GuiaPage() {
  const [activeDay, setActiveDay] = useState(17);

  const sedesForDay = (SEDES_DATA as Sede[]).filter((s) => s.day === activeDay || s.alsoDay === activeDay);

  return (
    <div className="theme-surface min-h-screen bg-[var(--t-bg)] text-[var(--t-text)] font-sans pt-4">
      <header className="sticker bg-[var(--t-surface)] rounded-3xl mb-6 p-4 pr-2 flex items-center gap-2">
        <div className="flex-1">
          <h1 className="font-display text-3xl font-semibold leading-none">Guía de sedes</h1>
          <p className="text-[var(--t-text-muted)] text-sm mt-2">Mixtli investigó lo que vas a encontrar en cada lugar: historia, rocas, bichos y qué llevar.</p>
        </div>
        <Mixtli pose="lupa" height={96} className="shrink-0" />
      </header>

      {/* Day Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto snap-x snap-mandatory pb-1">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={clsx(
              'font-futura flex-shrink-0 px-5 py-2.5 rounded-full font-bold text-sm uppercase tracking-wider transition-all border-2',
              activeDay === day
                ? 'sticker bg-brand-green text-ink'
                : 'bg-[var(--t-surface)] border-[var(--t-border)] text-[var(--t-text-faint)] hover:text-[var(--t-text)]'
            )}
          >
            {day} dic
          </button>
        ))}
      </div>

      {/* 17 dic: solo llegada, no hay sede de campo */}
      {activeDay === 17 && (
        <div className="sticker bg-ecopil-leaf text-ink rounded-3xl p-5 flex items-center gap-3">
          <div className="flex-1">
            <p className="font-display text-xl font-semibold leading-tight">Día de llegada</p>
            <p className="text-sm mt-1">Bienvenida oficial a las 19:30 en el Hotel City Express Tula, nuestra base hasta el 20. Las sedes de campo empiezan el 18.</p>
          </div>
          <Mixtli pose="asoma" height={90} className="shrink-0" />
        </div>
      )}

      {/* Sedes for active day */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {sedesForDay.map((sede, idx) => (
          <SedeCard key={sede.name} sede={sede} isActive={true} />
        ))}
      </div>

      <footer className="mt-8 py-6 text-center border-t-2 border-[var(--t-border)]">
        <p className="text-xs text-[var(--t-text-faint)]">
          © 2026 Ecopil México A.C. · Información geográfica y biológica para educación ambiental
        </p>
      </footer>
    </div>
  );
}
