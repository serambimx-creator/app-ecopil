// Niveles y preguntas del juego "Mixtli cruza Hidalgo".
// La respuesta correcta es siempre la primera opción (el juego las revuelve).
// Cada nivel tiene un banco; en cada partida salen 5 al azar, priorizando las que no se han visto.
// Equipo: revisen y ajusten las preguntas a lo que se verá en el Encuentro.

export type Obstaculo = 'cactus' | 'maguey' | 'paste' | 'pico' | 'roca' | 'pino' | 'atomo' | 'gota' | 'serpiente';
export type Pregunta = { p: string; o: [string, string, string]; dato?: string };
export type Nivel = { nombre: string; lugar: string; cielo: string; obstaculos: Obstaculo[]; preguntas: Pregunta[] };

export const NIVELES: Nivel[] = [
    {
        nombre: 'Nivel 1', lugar: 'Valle del Mezquital', cielo: '#F9BC3A', obstaculos: ['cactus', 'maguey', 'paste', 'serpiente'],
        preguntas: [
            { p: '¿Qué representan los Atlantes de Tula?', o: ['Guerreros toltecas', 'Reyes mexicas', 'Dioses mayas'] },
            { p: '¿Qué pueblo originario habita el Valle del Mezquital?', o: ['Hñähñu (otomí)', 'Maya', 'Rarámuri'] },
            { p: '¿Cómo se formaron las Grutas de Xoxafi?', o: ['El agua disolvió la roca caliza', 'Un volcán las abrió', 'Las excavaron mineros'] },
            { p: 'Las estalactitas…', o: ['Cuelgan del techo', 'Crecen desde el suelo', 'Flotan en el agua'] },
            { p: '¿Qué bebida tradicional sale del maguey?', o: ['Pulque', 'Tequila', 'Atole'] },
            { p: '¿Cómo se llama el líquido dulce que se extrae del maguey?', o: ['Aguamiel', 'Miel de abeja', 'Agua de coco'] },
            { p: '¿Qué fruto da el nopal?', o: ['La tuna', 'El dátil', 'La guayaba'] },
            { p: '¿Cuál era la capital de los toltecas?', o: ['Tollan (Tula)', 'Tenochtitlan', 'Chichén Itzá'] },
            { p: '¿Qué es el mezquite?', o: ['Un árbol de zonas secas', 'Un pez de río', 'Un tipo de roca'] },
            { p: 'El correcaminos es…', o: ['Un ave', 'Un roedor', 'Un reptil'] },
            { p: 'En la barbacoa hidalguense, ¿con qué se envuelve la carne?', o: ['Pencas de maguey', 'Hojas de plátano', 'Papel aluminio'] },
            { p: '¿Cuánto tarda un maguey pulquero en madurar?', o: ['Varios años', 'Un mes', 'Una semana'] },
            { p: 'Los murciélagos que viven en las grutas ayudan a…', o: ['Controlar insectos', 'Hacer las estalactitas', 'Calentar la cueva'] },
            { p: 'Ixmiquilpan es famoso por sus…', o: ['Balnearios de aguas termales', 'Playas', 'Volcanes activos'] },
            { p: '¿Qué se forma cuando una estalactita y una estalagmita se unen?', o: ['Una columna', 'Un río', 'Un volcán'] },
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
            { p: '¿En qué municipio están los Prismas Basálticos?', o: ['Huasca de Ocampo', 'Tula', 'Ixmiquilpan'] },
            { p: '¿Qué título recibió Huasca de Ocampo en 2001, el primero en México?', o: ['Pueblo Mágico', 'Capital Cultural', 'Ciudad Patrimonio'] },
            { p: '¿Cuál es el relleno tradicional del paste?', o: ['Papa con carne', 'Chocolate', 'Pescado'] },
            { p: 'Además de plata, ¿qué otro metal precioso se extrajo en la Comarca Minera?', o: ['Oro', 'Platino', 'Uranio'] },
            { p: '¿Para qué servía un malacate en las minas?', o: ['Subir y bajar personas y mineral', 'Moler maíz', 'Bombear petróleo'] },
            { p: 'El Parque Nacional El Chico, decretado en 1898, es…', o: ['Uno de los más antiguos de México', 'El más nuevo de México', 'Una playa protegida'] },
            { p: '¿Qué tipo de roca se forma cuando se enfría la lava?', o: ['Ígnea', 'Sedimentaria', 'Coral'] },
            { p: '¿Qué es un geoparque?', o: ['Un territorio que cuida su patrimonio geológico con la comunidad', 'Un parque de diversiones', 'Una mina abierta al público'] },
            { p: '¿Qué es el tezontle?', o: ['Una roca volcánica porosa', 'Un árbol', 'Un platillo'] },
            { p: '¿Por qué los mineros usaban casco con lámpara?', o: ['Para ver bajo tierra', 'Por moda', 'Para calentarse'] },
        ],
    },
    {
        nombre: 'Nivel 3', lugar: 'Bosques de Hidalgo', cielo: '#6BB32E', obstaculos: ['pino', 'roca', 'serpiente', 'cactus'],
        preguntas: [
            { p: '¿Qué árbol domina los bosques altos de la Sierra de Pachuca?', o: ['Oyamel', 'Ceiba', 'Mezquite'] },
            { p: '¿Qué es un área natural protegida?', o: ['Un territorio con reglas para conservar su naturaleza', 'Un parque de diversiones', 'Una zona solo para construir'] },
            { p: '¿Qué servicio ambiental dan los bosques a las ciudades cercanas?', o: ['Captan agua que recarga los mantos', 'Producen petróleo', 'Generan sal'] },
            { p: 'El cacomixtle, como Mixtli, es pariente del…', o: ['Mapache', 'Gato', 'Zorro'] },
            { p: '¿Qué animal poliniza las flores del agave de noche?', o: ['El murciélago', 'La lechuza', 'El tlacuache'] },
            { p: '¿Qué gas toman los árboles del aire para crecer?', o: ['Dióxido de carbono', 'Oxígeno puro', 'Helio'] },
            { p: '¿Para qué sirve el cajete alrededor de un árbol recién plantado?', o: ['Para captar y guardar agua', 'Para que no lo vean', 'Para decorar'] },
            { p: '¿Qué es una bomba de semillas?', o: ['Una bolita de tierra con semillas para sembrar', 'Un explosivo', 'Un tipo de fruta'] },
            { p: '¿Por qué conviene reforestar con especies nativas?', o: ['Están adaptadas al clima y suelo de la región', 'Crecen en un día', 'Son más baratas siempre'] },
            { p: 'El tlacuache es…', o: ['Un marsupial, como el canguro', 'Un roedor', 'Un felino'] },
            { p: '¿Qué es la composta?', o: ['Abono hecho con restos orgánicos', 'Basura plástica', 'Un tipo de roca'] },
            { p: 'El heno motita que crece sobre los árboles es…', o: ['Una planta', 'Un hongo', 'Una telaraña'] },
            { p: '¿Para qué sirve la app iNaturalist?', o: ['Registrar observaciones de seres vivos', 'Pedir comida', 'Escuchar música'] },
            { p: 'Mixtli, la mascota de Ecopil, es un…', o: ['Cacomixtle', 'Mapache', 'Gato montés'] },
            { p: '¿Cómo se llaman los grupos locales de Ecopil en cada lugar?', o: ['Nodos', 'Clubes', 'Brigadas'] },
            { p: '¿Qué es la polinización?', o: ['Llevar polen de flor en flor para que haya frutos', 'Regar las plantas', 'Podar árboles'] },
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
            { p: '¿Dónde vive el ajolote mexicano en estado silvestre?', o: ['En los canales de Xochimilco', 'En el mar', 'En el desierto'] },
            { p: '¿Cómo respira el ajolote?', o: ['Con branquias, pulmones y piel', 'Solo con pulmones', 'No respira'] },
            { p: '¿Qué es un jagüey?', o: ['Un depósito que guarda agua de lluvia', 'Un tipo de árbol', 'Un baile'] },
            { p: '¿Qué es una biopiscina?', o: ['Una alberca que se limpia con plantas, sin cloro', 'Una alberca con peces de colores', 'Un acuario'] },
            { p: '¿Qué mide el pH del agua?', o: ['Qué tan ácida o básica es', 'Su temperatura', 'Su color'] },
            { p: '¿Qué es un manantial?', o: ['Un lugar donde brota agua subterránea', 'Una presa', 'Un pozo artificial'] },
            { p: '¿Qué parte del agua del planeta es dulce?', o: ['Alrededor del 3%', 'La mitad', 'Casi toda'] },
            { p: '¿Cuánto tarda una botella de plástico en degradarse?', o: ['Cientos de años', 'Un mes', 'Un año'] },
            { p: '¿Qué residuo sí va a la composta?', o: ['Cáscaras de fruta', 'Pilas', 'Unicel'] },
            { p: '¿Qué es un temazcal?', o: ['Un baño de vapor tradicional', 'Una tienda de campaña', 'Una cascada'] },
        ],
    },
];
