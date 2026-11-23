// Guía de sedes para agentes. Lo marcado como pendiente en `servicios` no se muestra
// hasta que el staff lo confirme (no publicar datos inventados).

export type Trivia = { p: string; o: [string, string, string]; dato: string }; // la primera opción es la correcta
export type Servicios = { banos?: string; senal?: string; comida?: string; acceso?: string };
export type SedeGuia = {
    slug: string; nombre: string; dias: number[]; foto?: string; logo?: string;
    coords: [number, number]; altitud: string; temp: string; clima: string;
    resumen: string; haremos: string[];
    historia?: string; geologia?: string; biologia?: string;
    llevar: string[]; ojo?: string; servicios: Servicios; trivia: Trivia[];
};

export const GUIA: SedeGuia[] = [
    {
        slug: 'tula', nombre: 'Parque Nacional Tula', dias: [18], foto: '/guia/optimized/tula.webp',
        coords: [20.0664861, -99.3358673], altitud: '2,020 msnm', temp: '5–18 °C', clima: 'Semiseco templado',
        resumen: 'La antigua Tollan-Xicocotitlan, capital tolteca, hoy Parque Nacional. Aquí están los Atlantes, guerreros de basalto que miran el valle desde hace casi mil años.',
        haremos: ['Inauguración del 7º Encuentro y actividades'],
        historia: 'Capital tolteca entre 700 y 1150 d.C., con unos 85,000 habitantes en su apogeo. Los Atlantes miden 4.6 m y son únicos en Mesoamérica. Parque Nacional desde 1981.',
        geologia: 'Valle del Mezquital sobre calizas y lutitas del Cretácico con intrusiones volcánicas; el río Tula corre sobre depósitos aluviales recientes.',
        biologia: 'Matorral xerófilo y mezquital: mezquite, maguey pulquero, nopales, yuca. Fauna: conejos, ardillas, correcaminos, coyotes y tlacuaches.',
        llevar: ['Ropa en capas (mañana fría, tarde cálida)', 'Protector solar y gorra: casi no hay sombra', 'Zapatos cerrados cómodos', 'Agua: mínimo 1.5 L', 'Celular cargado con la app lista'],
        servicios: {},
        trivia: [
            { p: '¿Cuánto miden los Atlantes de Tula?', o: ['4.6 metros', '1.8 metros', '12 metros'], dato: 'Cada Atlante está hecho de varios bloques de basalto ensamblados; en su espalda llevan un disco solar.' },
            { p: '¿Qué pueblo construyó Tollan-Xicocotitlan?', o: ['Los toltecas', 'Los mayas', 'Los olmecas'], dato: 'Para los mexicas, "tolteca" llegó a significar artista o gran artesano.' },
            { p: '¿De qué roca están hechos los Atlantes?', o: ['Basalto', 'Mármol', 'Granito rosa'], dato: 'El basalto es una roca volcánica dura y oscura, común en el centro de México.' },
            { p: '¿Qué planta se usa para hacer pulque y abunda en el valle?', o: ['Maguey', 'Nopal', 'Sábila'], dato: 'Del maguey también se aprovechan las pencas para la barbacoa y las fibras para hacer ayate.' },
        ],
    },
    {
        slug: 'xoxafi', nombre: 'Grutas de Xoxafi', dias: [18], foto: '/guia/optimized/xoxafi.webp',
        coords: [20.388324, -99.027607], altitud: '1,900 msnm', temp: '4–17 °C', clima: 'Semiseco',
        resumen: 'Ecoparque del Valle del Mezquital, en territorio hñähñu, con grutas naturales que se pueden recorrer por dentro.',
        haremos: ['Recorrido por las grutas', 'Comida e inauguración de un mural', 'Feria ambiental', 'Reforestación con maguey'],
        historia: 'Punto de educación ambiental en la región otomí-hñähñu; además de las grutas ofrece espeleología y tirolesas.',
        geologia: 'Formaciones kársticas: el agua de lluvia, ligeramente ácida, disolvió la roca caliza del Cretácico durante miles de años y formó cavernas, estalactitas y estalagmitas.',
        biologia: 'Afuera, matorral con cardones y biznagas. Dentro de las grutas viven murciélagos y fauna adaptada a la oscuridad: no los toques ni los alumbres directo.',
        llevar: ['Lámpara de mano o de cabeza', 'Chamarra: dentro de la gruta hace frío', 'Ropa que se pueda ensuciar', 'Calzado con buen agarre', 'Efectivo para propinas y compras'],
        ojo: 'Dentro de las grutas la temperatura es baja y constante, aunque afuera haga calor.',
        servicios: {},
        trivia: [
            { p: 'Las estalactitas…', o: ['Cuelgan del techo', 'Crecen desde el suelo', 'Flotan en el agua'], dato: 'Una estalactita crece apenas milímetros por siglo: cada gota deja un poquito de carbonato de calcio.' },
            { p: 'Las estalagmitas…', o: ['Crecen desde el suelo', 'Cuelgan del techo', 'Se mueven con el viento'], dato: 'Cuando una estalactita y una estalagmita se juntan forman una columna.' },
            { p: '¿Qué roca disolvió el agua para formar las grutas?', o: ['Caliza', 'Basalto', 'Granito'], dato: 'La caliza está hecha de carbonato de calcio, que el agua ligeramente ácida disuelve poco a poco.' },
            { p: '¿Qué hacen los murciélagos por nosotros?', o: ['Controlan insectos y polinizan plantas', 'Nada, solo asustan', 'Ensucian el agua'], dato: 'Algunos murciélagos polinizan el agave: sin ellos habría menos magueyes.' },
        ],
    },
    {
        slug: 'tezontepec', nombre: 'Villa de Tezontepec', dias: [19], foto: '/guia/optimized/tezontepec.webp',
        coords: [19.8798145, -98.8192859], altitud: '1,800 msnm', temp: '4–18 °C', clima: 'Templado seco',
        resumen: 'Municipio agrícola y ganadero del sur de Hidalgo. Su nombre viene del náhuatl: "cerro de tezontle", la roca volcánica roja.',
        haremos: ['Aprender a usar el kit de bombas de semillas', 'Mantenimiento a una reforestación', 'Feria ambiental'],
        geologia: 'Planicie con suelos volcánicos derivados del tezontle, una roca porosa y ligera que se forma cuando la lava se enfría con muchos gases atrapados.',
        biologia: 'Agricultura de temporal, pastizales y matorral; la reforestación usa especies nativas de la zona semiárida.',
        llevar: ['Ropa cómoda para trabajar en campo', 'Guantes', 'Calzado resistente', 'Protector solar'],
        servicios: {},
        trivia: [
            { p: '¿Qué significa "Tezontepec"?', o: ['Cerro de tezontle', 'Lugar de magueyes', 'Agua que brota'], dato: 'El tezontle es tan poroso que flota en agua por un rato y se usa para jardines porque guarda humedad.' },
            { p: '¿Para qué sirve el cajete alrededor de un árbol?', o: ['Para captar y guardar agua', 'Para decorar', 'Para que no crezca'], dato: 'Un buen cajete puede ser la diferencia entre que un arbolito sobreviva o no su primera temporada seca.' },
            { p: '¿Qué es una bomba de semillas?', o: ['Una bolita de tierra con semillas', 'Un explosivo', 'Una fruta'], dato: 'La tierra protege las semillas de pájaros y del sol hasta que llega la lluvia.' },
        ],
    },
    {
        slug: 'invictus', nombre: 'Fundación Invictus · El Huixmi', dias: [19], logo: '/logos/invictus.png',
        coords: [20.07344, -98.81919], altitud: '~2,400 msnm', temp: '3–17 °C', clima: 'Templado con viento',
        resumen: 'La Fundación Invictus, aliada del Encuentro, tiene en El Huixmi, junto a Pachuca, un hospital de fauna silvestre. Ahí hacemos voluntariado en colaboración con COESBIOH y cerramos el día con cena y piñatas.',
        haremos: ['Voluntariado en el hospital de fauna silvestre, con COESBIOH', 'Cena', 'Piñatas Ecopil'],
        llevar: ['Chamarra o rompevientos: en la tarde enfría y hace viento', 'Ropa cómoda que se pueda ensuciar para el voluntariado'],
        ojo: 'Con los animales del hospital sigue siempre las indicaciones del personal.',
        servicios: {},
        trivia: [
            { p: '¿Por qué a Pachuca le dicen "La Bella Airosa"?', o: ['Por sus fuertes vientos', 'Por sus globos aerostáticos', 'Por su aeropuerto'], dato: 'El viento es parte de la identidad de Pachuca; por eso conviene llevar rompevientos a esta zona.' },
            { p: '¿Qué hace un hospital de fauna silvestre?', o: ['Atiende animales silvestres heridos para regresarlos a su hábitat', 'Vende mascotas', 'Es un zoológico'], dato: 'Lo ideal es que el animal tenga el menor contacto posible con personas para que pueda volver a la vida silvestre.' },
            { p: 'Si encuentras un animal silvestre herido, lo mejor es…', o: ['Avisar a especialistas', 'Llevártelo a casa como mascota', 'Darle de comer pan'], dato: 'Darle comida equivocada o tocarlo sin protección puede lastimarlo más.' },
        ],
    },
    {
        slug: 'acaxochitlan', nombre: 'Acaxochitlán · Cascadas Dos Mundos', dias: [20], foto: '/guia/optimized/acaxochitlan.webp',
        coords: [20.1409452, -98.1056043], altitud: '2,260 msnm', temp: '5–16 °C', clima: 'Templado húmedo',
        resumen: 'Bosque de niebla en la frontera con Puebla. Las Cascadas Dos Mundos (Huetziatl) las cuida la comunidad, y ahí está el manantial que vamos a estudiar.',
        haremos: ['Caminata al manantial', 'Taller de calidad del agua', 'Nadar en el manantial (10 min, si te animas)', 'Comida, clausura y sorteo'],
        historia: 'Su nombre náhuatl se refiere al acaxóchitl, una planta de flor roja. Habitan comunidades nahuas y otomíes.',
        geologia: 'Transición entre el Eje Neovolcánico y la Sierra Madre Oriental; el agua subterránea sale por fracturas de roca volcánica y forma manantiales y cascadas.',
        biologia: 'Bosque mesófilo de montaña, de los ecosistemas más diversos de México: helechos arborescentes, bromelias, orquídeas y musgos. En diciembre pasan aves migratorias.',
        llevar: ['Botas impermeables: el sendero tiene lodo', 'Impermeable ligero (hay neblina)', 'Bolsa para proteger el celular de la humedad', 'Ropa en capas', 'Efectivo: $30 por persona para la entrada al manantial', 'Traje de baño y toalla si quieres nadar'],
        ojo: 'Hace frío, pero el manantial se puede nadar: habrá 10 minutos para quien se anime.',
        servicios: {},
        trivia: [
            { p: '¿Qué ecosistema rodea las cascadas?', o: ['Bosque mesófilo de montaña', 'Selva seca', 'Desierto'], dato: 'El bosque mesófilo ocupa menos del 1% de México pero guarda cerca del 10% de sus especies de plantas.' },
            { p: '¿Qué es un manantial?', o: ['Un lugar donde brota agua subterránea', 'Una presa', 'Un pozo artificial'], dato: 'El agua de un manantial pudo tardar años filtrándose entre las rocas antes de salir.' },
            { p: '¿Qué mide el pH del agua?', o: ['Qué tan ácida o básica es', 'Su temperatura', 'Su profundidad'], dato: 'El agua pura tiene pH 7; muchos seres vivos acuáticos necesitan valores cercanos a ese.' },
        ],
    },
    {
        slug: 'ajolotequio', nombre: 'Los Romeros, Tulancingo · Ajolotequio', dias: [20, 21], foto: '/guia/optimized/ajolote.webp',
        coords: [20.0843785, -98.3692634], altitud: '2,100 msnm', temp: '6–20 °C', clima: 'Templado',
        resumen: 'Espacio de conservación del ajolote en Los Romeros, Tulancingo. Aquí hacemos tequio, aprendemos de los ajolotes, nos damos un temazcal, acampamos y cerramos el Encuentro.',
        haremos: ['Construir una biopiscina', 'Reforestar y aprender de los ajolotes', 'Temazcal (20 lugares, apártalo) y campamento', 'Cierre de integración el 21'],
        historia: '"Tulancingo" viene del náhuatl: "lugar de pequeños tules". Es la segunda ciudad más grande de Hidalgo.',
        geologia: 'Cuenca rodeada de serranías volcánicas con suelos fértiles y manantiales.',
        biologia: 'El ajolote es un anfibio que conserva su forma de larva toda la vida y puede regenerar extremidades, partes del corazón y del cerebro.',
        llevar: ['Ropa de trabajo que se pueda ensuciar', 'Lo necesario para acampar', 'Ropa abrigadora para la noche', 'Respeto: observa a los animales sin sacarlos del agua'],
        ojo: 'La noche del 20 dormimos en Ajolotequio; el temazcal tiene 20 lugares: apártalo en Mi registro o en el Programa. El 21 no hay desayuno: si te quedas, buscamos juntos dónde desayunar.',
        servicios: {},
        trivia: [
            { p: '¿Qué puede regenerar un ajolote?', o: ['Patas, partes del corazón y del cerebro', 'Solo la cola', 'Nada, como nosotros'], dato: 'Por eso el ajolote se estudia en laboratorios de todo el mundo, aunque en vida silvestre está en peligro crítico.' },
            { p: '¿Qué es una biopiscina?', o: ['Una alberca que se limpia con plantas', 'Una alberca con cloro', 'Un acuario'], dato: 'Las plantas y microorganismos filtran el agua, así que no hacen falta químicos.' },
            { p: '¿Qué es un jagüey?', o: ['Un depósito que guarda agua de lluvia', 'Un tipo de árbol', 'Un platillo'], dato: 'Limpiarlo (desazolvarlo) le devuelve capacidad para guardar más agua.' },
            { p: '¿Dónde vive el ajolote mexicano en estado silvestre?', o: ['En los canales de Xochimilco', 'En el mar', 'En ríos de la selva'], dato: 'La contaminación y las especies invasoras son sus principales amenazas.' },
        ],
    },
];
