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
  actividades: ActividadDetalle[];
}

export const ITINERARIO: BloqueDia[] = [
  {
    dia: '18 DIC',
    sede: 'Parque Nacional Tula → Grutas Xoxafi  ·  Base: Hotel City Express Tula',
    actividades: [
      { hora: '06:00–07:00', titulo: 'Desayuno en 2 equipos', detalle: 'Hotel Tula' },
      { hora: '07:30–08:30', titulo: 'App de Heno Motita y Huellas de Fauna' },
      { hora: '08:30–09:30', titulo: 'Inauguración del encuentro', detalle: 'Parque Nacional Tula' },
      { hora: '09:30–11:30', titulo: 'Traslado a Grutas de Xoxafi', esTraslado: true },
      { hora: '11:30–13:00', titulo: 'Recorrido en Grutas de Xoxafi' },
      { hora: '13:00–14:00', titulo: 'Comida e inauguración del mural', detalle: 'Mural en Xoxafi' },
      { hora: '14:00–16:30', titulo: 'Reforestación con Maguey en Xoxafi' },
      { hora: '16:30–18:00', titulo: 'Feria ambiental' },
      { hora: '18:30–20:30', titulo: 'Traslado a hotel y cena', esTraslado: true },
      { hora: '', titulo: 'Capacitación SIGs Defensa del Territorio', detalle: 'Posible, pendiente confirmar', pendiente: true },
    ],
  },
  {
    dia: '19 DIC',
    sede: 'Villa de Tezontepec → Mineral del Chico  ·  Base: Hotel City Express Tula',
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
