// Programa para agentes: lo que vivirán cada día, contado de forma general,
// con solo las horas que necesitan para organizarse. El cronograma detallado vive en /gestion.
// Cambios de último momento: publíquenlos como aviso desde /gestion.

export type Bloque = { momento: 'Mañana' | 'Tarde' | 'Noche'; texto: string };
export type HoraClave = { hora: string; que: string; aprox?: boolean };
export type DiaPrograma = { dia: string; titulo: string; sedes: string[]; bloques: Bloque[]; horas: HoraClave[]; tip?: string };

export const PROGRAMA: DiaPrograma[] = [
    {
        dia: '2026-12-17', titulo: 'Llegada a Tula', sedes: ['hotel'],
        bloques: [
            { momento: 'Noche', texto: 'Te damos la bienvenida en el hotel: conoces a los demás nodos, te contamos cómo serán estos días, formamos los grupos A y B y te presentamos Ecopil Go.' },
        ],
        horas: [{ hora: '19:30', que: 'Bienvenida en el hotel' }],
    },
    {
        dia: '2026-12-18', titulo: 'Tula y Grutas de Xoxafi', sedes: ['tula', 'xoxafi'],
        bloques: [
            { momento: 'Mañana', texto: 'Arrancamos en el Parque Nacional Tula registrando heno motita y huellas de fauna con la app, y ahí mismo inauguramos el Encuentro. Luego viajamos a las Grutas de Xoxafi.' },
            { momento: 'Tarde', texto: 'Recorremos las grutas, comemos juntos, pintamos un mural colectivo y participamos en la feria ambiental, los talleres y una reforestación con maguey.' },
            { momento: 'Noche', texto: 'De vuelta en el hotel te contamos lo que viene mañana y tenemos una capacitación en mapas (SIG).' },
        ],
        horas: [
            { hora: '06:00', que: 'Desayuno grupo A' }, { hora: '06:30', que: 'Desayuno grupo B' },
            { hora: '07:10', que: 'Salida del hotel' }, { hora: '20:00', que: 'Regreso al hotel', aprox: true },
        ],
        tip: 'Lleva efectivo para propinas y compras en las grutas.',
    },
    {
        dia: '2026-12-19', titulo: 'Villa de Tezontepec y El Huixmi', sedes: ['tezontepec', 'invictus'],
        bloques: [
            { momento: 'Mañana', texto: 'En Villa de Tezontepec aprendemos a usar el kit de bombas de semillas, hacemos cajeteo y después llevamos la feria ambiental y los talleres al centro del municipio.' },
            { momento: 'Tarde', texto: 'Visitamos ENOMEX y la Fundación Invictus en El Huixmi, inauguramos un mural en una escuela y tenemos una capacitación en tecnologías con COESBIOH.' },
            { momento: 'Noche', texto: 'Cerramos el día rompiendo piñatas Ecopil y regresamos al hotel a cenar.' },
        ],
        horas: [
            { hora: '06:00', que: 'Desayuno grupo B' }, { hora: '06:30', que: 'Desayuno grupo A' },
            { hora: '07:00', que: 'Salida del hotel' }, { hora: '21:30', que: 'Regreso al hotel', aprox: true },
        ],
        tip: 'Trae una identificación oficial para la visita a ENOMEX.',
    },
    {
        dia: '2026-12-20', titulo: 'Acaxochitlán y Ajolotequio', sedes: ['acaxochitlan', 'ajolotequio'],
        bloques: [
            { momento: 'Mañana', texto: 'Nos tomamos la foto oficial y viajamos a Acaxochitlán: caminamos al manantial de Cascadas Dos Mundos (Huetziatl) y analizamos la calidad de su agua.' },
            { momento: 'Tarde', texto: 'Comida, clausura y sorteo. Después vamos a Ajolotequio, en Tulancingo, a construir una biopiscina, reforestar con maguey y limpiar el jagüey.' },
            { momento: 'Noche', texto: 'Temazcal y noche de campamento.' },
        ],
        horas: [
            { hora: '07:00', que: 'Desayuno grupo A' }, { hora: '07:30', que: 'Desayuno grupo B' },
            { hora: '08:00', que: 'Foto oficial en el hotel' }, { hora: '08:30', que: 'Salida del hotel' },
        ],
        tip: 'Hoy dormimos en Ajolotequio: lleva lo necesario para acampar.',
    },
    {
        dia: '2026-12-21', titulo: 'Cierre en Ajolotequio', sedes: ['ajolotequio'],
        bloques: [
            { momento: 'Mañana', texto: 'Temazcal, desayuno y un cierre de integración para despedirnos y llevarnos los acuerdos a cada nodo.' },
        ],
        horas: [{ hora: '09:30', que: 'Desayuno' }, { hora: '12:00', que: 'Salida a las terminales' }],
    },
];
