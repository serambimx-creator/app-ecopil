export interface ActividadDetalle {
  hora: string;
  titulo: string;
  detalle?: string;
  pendiente?: boolean;
  esTraslado?: boolean;
}

export interface BloqueDia {
  dia: string;
  sede: string;
  teaser: string;
  actividades: ActividadDetalle[];
}

export const ITINERARIO: BloqueDia[] = [
  {
    dia: '17 DIC',
    sede: 'Llegada y bienvenida  ·  Hotel City Express Tula',
    teaser: 'El punto de partida: conoce a tu equipo y arranca la energía del encuentro.',
    actividades: [
      {
        hora: '19:30',
        titulo: 'Bienvenida oficial',
        detalle: 'Hotel Tula · Pormenores del encuentro, asignación de Grupo A y Grupo B, explicación de la actividad de Heno Motita y Huellitas. Se recomienda llevar efectivo.',
      },
    ],
  },
  {
    dia: '18 DIC',
    sede: 'Parque Nacional Tula → Grutas Xoxafi  ·  Base: Hotel City Express Tula',
    teaser: 'Inauguración, cuevas, murales y una tarde de manos en la tierra.',
    actividades: [
      { hora: '06:00–07:00', titulo: 'Desayuno en 2 equipos', detalle: 'Grupo A 6:00–6:30 · Grupo B 6:30–7:00 · Hotel Tula' },
      { hora: '07:10–07:25', titulo: 'Traslado al Parque Nacional Tula', esTraslado: true },
      { hora: '07:30–08:30', titulo: 'App de Heno Motita y Huellas de Fauna' },
      { hora: '08:30–09:30', titulo: 'Inauguración del encuentro', detalle: 'Parque Nacional Tula' },
      { hora: '09:30–11:30', titulo: 'Traslado a Grutas de Xoxafi', esTraslado: true },
      { hora: '11:30–12:45', titulo: 'Recorrido en Grutas de Xoxafi', detalle: 'Lleva efectivo para propinas y compras personales' },
      { hora: '12:50–14:00', titulo: 'Comida e inauguración del mural', detalle: 'Mural Alejandro Nahual · Xoxafi' },
      { hora: '14:00–16:10', titulo: 'Feria ambiental' },
      { hora: '16:30–18:00', titulo: 'Reforestación con Maguey en Xoxafi' },
      { hora: '18:30–20:30', titulo: 'Traslado a hotel y cena', esTraslado: true },
      { hora: '19:40', titulo: 'Información de Villa de Tezontepec y Mineral del Chico', detalle: 'Charla informativa sobre las sedes del día siguiente' },
      { hora: '20:30–22:00', titulo: 'Capacitación SIGs Defensa del Territorio' },
    ],
  },
  {
    dia: '19 DIC',
    sede: 'Villa de Tezontepec → Mineral del Chico  ·  Base: Hotel City Express Tula',
    teaser: 'De la sierra a la montaña: naturaleza, altura y sorpresas nocturnas.',
    actividades: [
      { hora: '', titulo: 'Desayuno', detalle: 'Hotel Tula' },
      { hora: '', titulo: 'Hotel Tula → Villa de Tezontepec', detalle: '~45–55 min', esTraslado: true },
      { hora: '07:00–08:00', titulo: 'Mantenimiento área reforestada' },
      { hora: '08:00–08:30', titulo: 'Al centro de Tezontepec', detalle: 'Traslado interno', esTraslado: true },
      { hora: '09:00', titulo: 'Inauguración' },
      { hora: '09:20–11:00', titulo: 'Feria ambiental' },
      { hora: '11:30–12:30', titulo: 'Recorrido ENOMEX' },
      { hora: '13:00–14:00', titulo: 'Comida' },
      { hora: '14:00–16:00', titulo: 'Tezontepec → Mineral del Chico', detalle: '~70–90 min — por la sierra', esTraslado: true },
      { hora: '16:00–17:00', titulo: 'Lombricomposteros' },
      { hora: '17:00–17:30', titulo: 'Comida' },
      { hora: '17:00–19:00', titulo: 'Encuentro de escalada', detalle: 'Posible, pendiente confirmar', pendiente: true },
      { hora: '19:00–21:00', titulo: 'Feria ambiental nocturna' },
      { hora: '', titulo: 'Mineral del Chico → Hotel Tula', detalle: '~90–110 min', esTraslado: true },
    ],
  },
  {
    dia: '20 DIC',
    sede: 'Tulancingo (Ajolotequio) → Acaxochitlán  ·  Hospedaje final en Acaxochitlán',
    teaser: 'Ajolotes, cascadas y un cierre que se celebra por todo lo alto.',
    actividades: [
      { hora: '', titulo: 'Desayuno y checkout', detalle: 'Hotel Tula' },
      { hora: '', titulo: 'Tula → Tulancingo', detalle: '~80–100 min', esTraslado: true },
      {
        hora: '09:00–12:00',
        titulo: 'Jornada de tequio',
        detalle: 'Biopiscina, reforestación con maguey, desazolve de jagüey, creación de humedales para conservación del ajolote',
      },
      { hora: '', titulo: 'Tulancingo → Acaxochitlán', detalle: '~30–40 min', esTraslado: true },
      { hora: '', titulo: 'Comida', detalle: 'Acaxochitlán' },
      { hora: '14:00–16:00', titulo: 'Taller de calidad de agua, ciencia participativa y recolección de RSU', detalle: 'Manantiales' },
      { hora: '16:00–19:00', titulo: 'Feria ambiental, talleres y pláticas' },
      { hora: '19:00', titulo: 'Taller de movimiento "Symbiosis Afectiva"' },
      { hora: '20:00', titulo: 'Cena, mural y despedida' },
      { hora: '21:00+', titulo: 'Fiestohongo' },
      { hora: '', titulo: 'Hospedaje en Acaxochitlán — no se regresa a Tula este día', detalle: 'Nota informativa' },
    ],
  },
];

export const ACTIVIDAD_EXTRA = {
  titulo: 'Recorrido en 10 cascadas',
  descripcion:
    'Para quien desee quedarse después del encuentro. Actividad opcional fuera del itinerario oficial de los 3 días.',
};
