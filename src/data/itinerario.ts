export interface ActividadDetalle {
  hora: string;
  titulo: string;
  detalle?: string;
  pendiente?: boolean;
}

export interface BloqueDia {
  dia: string;
  sede: string;
  actividades: ActividadDetalle[];
}

export const ITINERARIO: BloqueDia[] = [
  {
    dia: '18 DIC',
    sede: 'Parque Nacional Tula → Grutas Xoxafi',
    actividades: [
      { hora: '', titulo: 'Desayuno en hotel' },
      { hora: '', titulo: 'Inauguración', detalle: 'Parque Nacional Tula' },
      {
        hora: '',
        titulo: 'Sendero con huellas',
        detalle: 'Pendiente: definir proceso, sitio y materiales',
        pendiente: true,
      },
      {
        hora: '',
        titulo: 'SIGs Henomotita',
        detalle: 'Pendiente: reunión presencial y capacitación virtual con desarrollador',
        pendiente: true,
      },
      { hora: '', titulo: 'Comida', detalle: 'Gestión con presidente municipal — Grutas Xoxafi' },
      { hora: '', titulo: 'Reforestación' },
      { hora: '', titulo: 'Recorrido' },
      { hora: '', titulo: 'Mural', detalle: 'Propuesta: realizar antes del evento' },
      { hora: '', titulo: 'Feria ambiental' },
      { hora: '', titulo: 'Capacitación de maguey' },
      { hora: '', titulo: 'Cena en hotel' },
      {
        hora: '',
        titulo: 'Capacitación SIGs Defensa del Territorio',
        detalle: 'Posible, pendiente confirmar',
        pendiente: true,
      },
    ],
  },
  {
    dia: '19 DIC',
    sede: 'Villa de Tezontepec → Mineral del Chico',
    actividades: [
      { hora: '07:00–08:00', titulo: 'Jornada de mantenimiento en área reforestada' },
      { hora: '08:00–08:30', titulo: 'Traslado al centro' },
      { hora: '09:00', titulo: 'Inauguración' },
      { hora: '09:20–11:00', titulo: 'Feria ambiental' },
      { hora: '11:30–12:30', titulo: 'Recorrido ENOMEX' },
      { hora: '13:00–14:00', titulo: 'Comida' },
      { hora: '14:00–16:00', titulo: 'Traslado a Mineral del Chico', detalle: '2 horas' },
      { hora: '16:00–17:00', titulo: 'Lombricomposteros' },
      { hora: '17:00–17:30', titulo: 'Comida' },
      {
        hora: '17:00–19:00',
        titulo: 'Encuentro de escalada',
        detalle: 'Posible, pendiente confirmar',
        pendiente: true,
      },
      { hora: '19:00–21:00', titulo: 'Feria ambiental nocturna' },
    ],
  },
  {
    dia: '20 DIC',
    sede: 'Tulancingo (Ajolotequio) → Acaxochitlán',
    actividades: [
      {
        hora: '09:00–12:00',
        titulo: 'Jornada de tequio',
        detalle: 'Biopiscina, reforestación con maguey, desazolve de jagüey, creación de humedales para conservación del ajolote',
      },
      { hora: '', titulo: 'Comida y traslado a Acaxochitlán', detalle: '1h 20 min' },
      {
        hora: '14:00–16:00',
        titulo: 'Taller de calidad de agua, ciencia participativa y recolección de RSU en manantiales',
      },
      { hora: '16:00–19:00', titulo: 'Feria ambiental, talleres y pláticas' },
      { hora: '19:00', titulo: 'Taller de movimiento "Symbiosis Afectiva"' },
      { hora: '20:00', titulo: 'Cena, mural y despedida' },
      { hora: '21:00+', titulo: 'Fiestohongo' },
    ],
  },
];

export const ACTIVIDAD_EXTRA = {
  titulo: 'Recorrido en 10 cascadas',
  descripcion:
    'Para quien desee quedarse después del encuentro. Actividad opcional fuera del itinerario oficial de los 3 días.',
};
