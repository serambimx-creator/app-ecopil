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
        titulo: 'Bienvenida oficial y Ecopil Go',
        detalle: 'Hotel Tula · Pormenores del encuentro, asignación de Grupo A y Grupo B, explicación de la actividad de Heno Motita y Huellitas. Se recomienda llevar efectivo. Dennis y #NodoPachuca (Luis y Dani).',
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
      { hora: '07:30–08:30', titulo: 'App de Heno Motita y Huellas de Fauna', detalle: 'Heno Motita: Luis Balderas y Marcos Espinosa · Huellas de Fauna: Nadia Burgos, Wendy Balderas e Isaac Ramos' },
      { hora: '08:30–09:30', titulo: 'Inauguración del encuentro', detalle: 'Parque Nacional Tula · Preparación: Dennis Rios, Karla Uribe y Alexia Cano · Fandango Huasteco: Moises Cuenca' },
      { hora: '09:30–11:30', titulo: 'Traslado a Grutas de Xoxafi', detalle: 'En el camino: información de la app, grutas, mural y actividad', esTraslado: true },
      { hora: '11:30–12:45', titulo: 'Recorrido en Grutas de Xoxafi', detalle: '3 grupos (Marcos, Luis y Chepe) · Lleva efectivo para propinas y compras personales' },
      { hora: '12:50–14:00', titulo: 'Comida e inauguración del mural', detalle: 'Mural Alejandro Nahual · Xoxafi' },
      { hora: '14:00–16:10', titulo: 'Feria ambiental', detalle: '5 talleres · Alexia Cano y Moises Cuenca' },
      { hora: '16:30–18:00', titulo: 'Reforestación con maguey', detalle: 'Wendy Balderas, Isaac Ramos y Mahely Vidal' },
      { hora: '18:30–20:30', titulo: 'Traslado al hotel y cena', esTraslado: true },
      { hora: '19:40', titulo: 'Información de Villa de Tezontepec y Mineral del Chico', detalle: 'Charla sobre las sedes del día siguiente · Mahely Vidal y Luis Balderas' },
      { hora: '20:30–22:00', titulo: 'Capacitación SIG', detalle: 'Luis Balderas y Marcos Espinosa', pendiente: true },
    ],
  },
  {
    dia: '19 DIC',
    sede: 'Villa de Tezontepec → ENOMEX → Mineral del Chico  ·  Base: Hotel City Express Tula',
    teaser: 'Restauración, feria en la plaza, murales y piñatas al caer la noche.',
    actividades: [
      { hora: '06:00–07:00', titulo: 'Desayuno en 2 equipos', detalle: 'Grupo B 6:00–6:30 · Grupo A 6:30–7:00 · Hotel Tula' },
      { hora: '07:00–08:15', titulo: 'Traslado a Villa de Tezontepec', detalle: 'En el camino: capacitación del kit de bombas de semillas', esTraslado: true },
      { hora: '08:20–09:20', titulo: 'Mantenimiento de la reforestación', detalle: 'Riego de arbolado y cajeteo · Marcos y Mahely, con Dirección de Ecología (Citlaly)' },
      { hora: '09:20–09:50', titulo: 'Traslado al centro de Villa de Tezontepec', esTraslado: true },
      { hora: '10:00–11:30', titulo: 'Feria ambiental en el centro', detalle: '5 talleres · Karla, Alexia y Luis' },
      { hora: '11:30–12:00', titulo: 'Limpieza del sitio y caminata al autobús', detalle: 'Mahely y Wendy' },
      { hora: '12:00–12:20', titulo: 'Traslado a ENOMEX', esTraslado: true },
      { hora: '12:20–13:30', titulo: 'Recorrido ENOMEX', detalle: 'Luis y Moi · Requisitos (INE, EPP, ropa) por confirmar', pendiente: true },
      { hora: '13:45–16:00', titulo: 'Comida y traslado', detalle: 'Por confirmar', esTraslado: true },
      { hora: '16:00–16:20', titulo: 'Inauguración de mural en escuela', detalle: 'Moi y Alexia', pendiente: true },
      { hora: '16:20–16:50', titulo: 'Traslado al museo', esTraslado: true },
      { hora: '16:50–17:50', titulo: 'Capacitación TICs', detalle: 'Museo COESBIOH, oficinas CONANP · Isaac y Wendy' },
      { hora: '18:00–19:30', titulo: '3 piñatas Ecopil MX', detalle: 'Karla, Luis, Alexia y Naye' },
      { hora: '19:40–21:40', titulo: 'Traslado al hotel y cena', detalle: 'Cena: tamales, punto de entrega por confirmar', esTraslado: true },
    ],
  },
  {
    dia: '20 DIC',
    sede: 'Acaxochitlán → Tulancingo (Ajolotequio)  ·  Noche de campamento en Ajolotequio',
    teaser: 'Foto oficial, manantiales, cierre con sorteo y una noche de temazcal.',
    actividades: [
      { hora: '07:00–08:00', titulo: 'Desayuno en 2 equipos', detalle: 'Grupo A 7:00–7:30 · Grupo B 7:30–8:00 · Hotel Tula' },
      { hora: '08:00–08:30', titulo: 'Foto oficial', detalle: 'Hotel City Express Tula' },
      { hora: '08:30–10:30', titulo: 'Traslado a Acaxochitlán', detalle: 'En el camino: información de Cascadas Dos Mundos (Huetziatl) y muestreo de agua · Alexia', esTraslado: true },
      { hora: '10:30–10:50', titulo: 'Caminata al manantial', detalle: 'Polígono de iNaturalist · Entrada $30 por persona · Mahely' },
      { hora: '10:50–12:00', titulo: 'Taller de análisis de calidad de agua', detalle: 'Manantial' },
      { hora: '12:00–12:20', titulo: 'Regreso', esTraslado: true },
      { hora: '12:30–14:30', titulo: 'Comida, clausura y sorteo', detalle: 'Con la comunidad de Cascadas Dos Mundos' },
      { hora: '14:40–15:40', titulo: 'Traslado a Tulancingo', detalle: 'Parada en la terminal para quien se despide · Información de Ajolotequio: Wendy', esTraslado: true },
      {
        hora: '16:00–18:00',
        titulo: 'Tequio en Ajolotequio',
        detalle: 'Creación de biopiscina (Isaac), reforestación con maguey (Mahely), desazolve de jagüey (Alexia) y organización de herramientas (Marcos y Chepe)',
      },
      { hora: '', titulo: 'Temazcal y campamento', detalle: 'Previo registro · Lleva tus insumos' },
    ],
  },
  {
    dia: '21 DIC',
    sede: 'Ajolotequio, Tulancingo  ·  Cierre de integración',
    teaser: 'Temazcal al amanecer y despedida antes de volver a casa.',
    actividades: [
      { hora: '08:00–09:30', titulo: 'Temazcal' },
      { hora: '09:30–10:30', titulo: 'Desayuno' },
      { hora: '10:30–12:00', titulo: 'Cierre de integración' },
      { hora: '12:00', titulo: 'Salida a terminales', esTraslado: true },
    ],
  },
];

export const ACTIVIDAD_EXTRA = {
  titulo: 'Recorrido en 10 cascadas',
  descripcion:
    'Para quien desee quedarse después del encuentro. Actividad opcional fuera del itinerario oficial.',
};
