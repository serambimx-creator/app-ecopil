'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Landmark, Mountain, Trees, TreePine, Waves, Fish, MapPin, Thermometer, Mountain as AltIcon } from 'lucide-react';
import { clsx } from 'clsx';

type TabType = 'historia' | 'geologia' | 'biologia' | 'llevar';

const SEDES_DATA = [
  {
    day: 18,
    name: 'Parque Nacional Tula',
    icon: Landmark,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Zona_arqueol%C3%B3gica_de_Tula%2C_Hidalgo_%288%29.jpg/800px-Zona_arqueol%C3%B3gica_de_Tula%2C_Hidalgo_%288%29.jpg',
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
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Grotte_de_Clamouse_-_20.jpg/800px-Grotte_de_Clamouse_-_20.jpg',
    altText: 'Grutas Xoxafi con formaciones kársticas',
    altitud: '1,900 msnm',
    clima: '4–17°C',
    climaTipo: 'Semiseco',
    historia: 'Ecoparque en Valle del Mezquital con grutas naturales de más de 500m explorable. Punto estratégico para educación ambiental en zona otomí-hñähñú. Ofrece espeleología, tirolesas y feria ambiental.',
    geologia: 'Formaciones kársticas en calizas del Cretácico formadas por disolución de carbonato de calcio. Valle del Mezquital es depresión tectónica entre serranías del Eje Neovolcánico.',
    biologia: 'Interior: 3 especies de murciélagos (Tadarida brasiliensis, Myotis sp.), microfauna especializada. Exterior: matorral crassicaule con cardones, biznagas y fauna de zona árida.',
    llevar: {
      items: ['Linterna o headlamp (obligatorio en grutas)', 'Ropa que pueda ensuciarse', 'Botas con agarre'],
      alerta: 'Interior de grutas ~10°C constante — llevar chamarra aunque afuera haga calor.',
    },
  },
  {
    day: 19,
    name: 'Villa de Tezontepec',
    icon: Trees,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Hidalgo_Tezontepec_de_Aldama.jpg/800px-Hidalgo_Tezontepec_de_Aldama.jpg',
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
    day: 19,
    name: 'Mineral del Chico · Rocabosque',
    icon: TreePine,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Bosque_de_oyamel.jpg/800px-Bosque_de_oyamel.jpg',
    altText: 'Parque Nacional El Chico con formaciones rocosas',
    altitud: '2,360 msnm',
    clima: '2–14°C',
    climaTipo: 'Templado subhúmedo',
    historia: 'Pueblo Mágico desde 2011, fundado en 1569 como real minero de plata. Geoparque Mundial UNESCO (Comarca Minera, 2017). El Parque Nacional El Chico tiene 1,420+ especies, 52 en categoría de riesgo NOM-059.',
    geologia: 'Formaciones de peñas, calderas y domos volcánicos del Eje Neovolcánico. Prismas basálticos entre los más altos del mundo en Santa María Regla (cercano). La Peña del Cuervo: 2,770 msnm. Entre s.XVI-XX se extrajo el 6% de toda la plata mundial.',
    biologia: 'Bosque de oyamel (Abies religiosa), pino, encino y madroño. Especie notable: Taxus globosa (tejo mexicano, en riesgo). Fauna: salamandras, aves endémicas de bosque mesófilo, murciélagos y mamíferos de montaña.',
    llevar: {
      items: ['Chamarra gruesa impermeable', 'Botas impermeables (suelo húmedo de bosque)', 'Hidratación activa'],
      alerta: 'En diciembre puede haber heladas (-5°C registrado en 2008). Posible niebla matutina densa.',
    },
  },
  {
    day: 20,
    name: 'Acaxochitlán · Cascadas Dos Mundos',
    icon: Waves,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Cascada_en_M%C3%A9xico.jpg/800px-Cascada_en_M%C3%A9xico.jpg',
    altText: 'Cascadas Dos Mundos en Acaxochitlán',
    altitud: '2,260 msnm',
    clima: '5–16°C',
    climaTipo: 'Templado húmedo',
    historia: 'Nombre náhuatl "lugar donde abunda el Acaxochitl" (carrizo de flor roja). Comunidades otomíes y tepehuas. Las Cascadas Dos Mundos son gestionadas ecoturísticamente por la comunidad de San Fernando. Municipio con ríos Tecolutla y Cazones.',
    geologia: 'Transición entre Eje Neovolcánico y Sierra Madre Oriental. Afloramientos de rocas ígneas extrusivas con depósitos fluviales en cañadas. Cascadas formadas por fracturas volcánicas que canalizan agua subterránea a la superficie.',
    biologia: 'Bosque mesófilo de montaña — uno de los ecosistemas más biodiversos de México. Flora: helechos arborescentes, bromelias, orquídeas, musgos. Corredor de aves migratorias en diciembre. Colinda con Puebla, alta conectividad biológica.',
    llevar: {
      items: ['Botas impermeables (sendero con lodo y agua)', 'Impermeable ligero (neblina constante)', 'Proteger equipo electrónico de humedad', 'Botiquín básico', 'Ropa de capas'],
      alerta: null,
    },
  },
  {
    day: 20,
    name: 'Tulancingo · Ajolotequio',
    icon: Fish,
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Ambystoma_mexicanum_1.jpg/800px-Ambystoma_mexicanum_1.jpg',
    altText: 'Axolote mexicano (Ambystoma mexicanum)',
    altitud: '2,100 msnm',
    clima: '6–20°C',
    climaTipo: 'Templado',
    historia: '"Tulancingo" del náhuatl "lugar de pequeños tules". Segunda ciudad más importante de Hidalgo. El ajolotequio es un centro de conservación del axolote (Ambystoma mexicanum), anfibio endémico de México en peligro crítico de extinción.',
    geologia: 'Cuenca de Tulancingo, depresión volcánica rodeada de serranías. Suelos volcánicos fértiles del Eje Neovolcánico. Zona hidrológica importante con manantiales y corrientes que alimentan el sistema Tula-Moctezuma.',
    biologia: 'El axolote (Ambystoma mexicanum) es un anfibio neoténico — retiene características larvales toda su vida. Capaz de regenerar extremidades, corazón y partes del cerebro. Especie clave para investigación biomédica mundial.',
    llevar: {
      items: ['Ropa casual', 'Actitud de observación y respeto con los animales'],
      alerta: 'Visita tentativa — confirmar disponibilidad.',
    },
    tentative: true,
  },
];

const DAYS = [18, 19, 20];

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
      <div className="w-full h-36 bg-[#1a2a1a] rounded-t-2xl flex items-center justify-center">
        <IconComponent size={48} className="text-gray-600" />
      </div>
    );
  }

  return (
    <Image
      src={url}
      alt={alt}
      width={400}
      height={144}
      unoptimized={true}
      onError={() => setError(true)}
      className="w-full h-36 object-cover rounded-t-2xl"
    />
  );
}

function InfoCard({ label, value, type }: { label: string; value: string; type: 'clima' | 'temp' | 'alt' }) {
  const styles = {
    clima: 'bg-[#1a1f2a] border-blue-900 text-blue-400',
    temp: 'bg-[#1a2a1a] border-[#2a3a2a] text-brand-green',
    alt: 'bg-[#2a1a2a] border-purple-900 text-purple-400',
  };

  return (
    <div className={clsx('border rounded-xl px-3 py-2', styles[type])}>
      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold mt-0.5">{value}</p>
    </div>
  );
}

function SedeCard({ sede, isActive }: { sede: (typeof SEDES_DATA)[0]; isActive: boolean }) {
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
      'bg-[#1a1a1a] border border-[#252525] rounded-2xl overflow-hidden transition-all',
      isActive ? 'opacity-100' : 'hidden'
    )}>
      <ImageWithFallback url={sede.imageUrl} alt={sede.altText} icon={IconComponent} />

      <div className="p-5 space-y-4">
        <div className="flex items-start gap-3">
        <IconComponent size={24} className="text-brand-green shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">{sede.name}</h3>
          {sede.tentative && (
            <span className="inline-block mt-1 bg-[#2a2a1a] text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
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

      <div className="flex gap-1 border-b border-[#252525]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              'text-[10px] font-bold uppercase tracking-wider px-3 py-2 transition-colors',
              activeTab === tab.key
                ? 'text-brand-green border-b-2 border-brand-green'
                : 'text-gray-500 hover:text-gray-400'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {activeTab === 'historia' && (
          <p className="text-sm text-gray-300 leading-relaxed">{sede.historia}</p>
        )}
        {activeTab === 'geologia' && (
          <p className="text-sm text-gray-300 leading-relaxed">{sede.geologia}</p>
        )}
        {activeTab === 'biologia' && (
          <p className="text-sm text-gray-300 leading-relaxed">{sede.biologia}</p>
        )}
        {activeTab === 'llevar' && (
          <div className="space-y-2">
            <div className="bg-[#1a2a1a] border border-[#2a3a2a] rounded-xl p-3 space-y-2">
              {sede.llevar.items.map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <span className="text-brand-green text-xs mt-1">✓</span>
                  <span className="text-sm text-gray-300">{item}</span>
                </div>
              ))}
            </div>
            {sede.llevar.alerta && (
              <div className="bg-[#2a1a00] border border-amber-500/20 rounded-xl p-3">
                <p className="text-xs text-amber-400 font-bold uppercase mb-1">⚠️ Alerta</p>
                <p className="text-sm text-amber-300">{sede.llevar.alerta}</p>
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
  const [activeDay, setActiveDay] = useState(18);

  const sedesForDay = SEDES_DATA.filter((s) => s.day === activeDay);

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans pb-32 px-4 pt-6 max-w-md mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-black mb-2">Guía de Sedes</h1>
        <p className="text-gray-400 text-sm">7mo Encuentro Nacional Ecopil MX 2026</p>
      </header>

      {/* Day Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto snap-x snap-mandatory">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={clsx(
              'flex-shrink-0 px-6 py-3 rounded-full font-bold text-sm uppercase tracking-wider transition-all border',
              activeDay === day
                ? 'bg-brand-green text-black border-brand-green'
                : 'bg-[#1a1a1a] border-[#252525] text-gray-400 hover:text-white'
            )}
          >
            {day} dic
          </button>
        ))}
      </div>

      {/* Sedes for active day */}
      <div className="space-y-4">
        {sedesForDay.map((sede, idx) => (
          <SedeCard key={sede.name} sede={sede} isActive={true} />
        ))}
      </div>

      <footer className="mt-8 py-6 text-center border-t border-[#252525]">
        <p className="text-xs text-gray-500">
          © 2026 Ecopil México A.C. · Información geográfica y biológica para educación ambiental
        </p>
      </footer>
    </div>
  );
}
