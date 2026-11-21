// Niveles y preguntas del juego "Mixtli cruza Hidalgo".
// La respuesta correcta es siempre la primera opción (el juego las revuelve).
// Equipo: revisen y ajusten las preguntas a lo que se verá en el Encuentro.

export type Obstaculo = 'cactus' | 'maguey' | 'paste' | 'pico' | 'roca' | 'pino' | 'atomo' | 'gota';
export type Pregunta = { p: string; o: [string, string, string]; dato?: string };
export type Nivel = { nombre: string; lugar: string; cielo: string; obstaculos: Obstaculo[]; preguntas: Pregunta[] };

export const NIVELES: Nivel[] = [
    {
        nombre: 'Nivel 1', lugar: 'Valle del Mezquital', cielo: '#F9BC3A', obstaculos: ['cactus', 'maguey', 'paste'],
        preguntas: [
            { p: '¿Qué representan los Atlantes de Tula?', o: ['Guerreros toltecas', 'Reyes mexicas', 'Dioses mayas'] },
            { p: '¿Qué pueblo originario habita el Valle del Mezquital?', o: ['Hñähñu (otomí)', 'Maya', 'Rarámuri'] },
            { p: '¿Cómo se formaron las Grutas de Xoxafi?', o: ['El agua disolvió la roca caliza', 'Un volcán las abrió', 'Las excavaron mineros'] },
            { p: 'Las estalactitas…', o: ['Cuelgan del techo', 'Crecen desde el suelo', 'Flotan en el agua'] },
            { p: '¿Qué bebida tradicional sale del maguey?', o: ['Pulque', 'Tequila', 'Atole'] },
        ],
    },
    {
        nombre: 'Nivel 2', lugar: 'Comarca Minera', cielo: '#EE8139', obstaculos: ['pico', 'paste', 'atomo'],
        preguntas: [
            { p: '¿Qué metal hizo famosa a la minería de Pachuca y Real del Monte?', o: ['Plata', 'Cobre', 'Hierro'] },
            { p: '¿De dónde llegaron los pastes a Hidalgo?', o: ['De Cornualles, Inglaterra, con mineros', 'De Italia', 'De Argentina'] },
            { p: '¿Qué deporte trajeron a Pachuca los mineros ingleses?', o: ['Fútbol', 'Béisbol', 'Básquetbol'] },
            { p: '¿Qué reconocimiento de la UNESCO tiene la Comarca Minera?', o: ['Geoparque Mundial', 'Patrimonio Inmaterial', 'Reserva de la Biosfera'] },
            { p: '¿Cómo se formaron los Prismas Basálticos?', o: ['Lava que se enfrió y se fracturó', 'Corales fosilizados', 'Cristales de sal'] },
        ],
    },
    {
        nombre: 'Nivel 3', lugar: 'Bosque de El Chico', cielo: '#6BB32E', obstaculos: ['pino', 'roca', 'cactus'],
        preguntas: [
            { p: '¿Qué árbol domina los bosques altos de El Chico?', o: ['Oyamel', 'Ceiba', 'Mezquite'] },
            { p: 'El Chico es de las áreas protegidas más antiguas de México. ¿Desde cuándo?', o: ['1898', '1990', '2015'] },
            { p: '¿De qué origen son las Peñas de El Chico?', o: ['Volcánico', 'Coralino', 'Glaciar'] },
            { p: 'El cacomixtle, como Mixtli, es pariente del…', o: ['Mapache', 'Gato', 'Zorro'] },
            { p: '¿Qué animal poliniza las flores del agave de noche?', o: ['El murciélago', 'La lechuza', 'El tlacuache'] },
        ],
    },
    {
        nombre: 'Nivel 4', lugar: 'Agua y ciencia', cielo: '#7FB7D9', obstaculos: ['atomo', 'gota', 'roca'],
        preguntas: [
            { p: '¿Qué es el ajolote?', o: ['Un anfibio', 'Un pez', 'Un reptil'] },
            { p: '¿Qué habilidad hace famoso al ajolote?', o: ['Regenerar partes de su cuerpo', 'Volar', 'Cambiar de color como camaleón'] },
            { p: '¿Con qué agua se riega gran parte del Valle del Mezquital?', o: ['Aguas residuales de la Ciudad de México', 'Agua de mar', 'Solo agua de lluvia'] },
            { p: '¿Qué partícula del átomo tiene carga negativa?', o: ['Electrón', 'Protón', 'Neutrón'] },
            { p: '¿Por qué a Pachuca le dicen "La Bella Airosa"?', o: ['Por sus fuertes vientos', 'Por sus globos', 'Por sus aves'] },
        ],
    },
];
