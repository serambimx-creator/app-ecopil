// Comprobante PDF de la carta compromiso. Se genera en el navegador con los datos que guardó el servidor.
// Se importa con import() para no cargar @react-pdf en el resto de la app.
import { Document, Page, Text, View, Image, StyleSheet, Font, pdf } from '@react-pdf/renderer';

// Sin cortar palabras con guiones.
Font.registerHyphenationCallback((w) => [w]);

export interface Comprobante {
    folio: number;
    registro: string;
    version: string;
    carta_hash: string;
    texto: string;
    documento_hash: string;
    nombre_escrito: string;
    acepta_deslinde: boolean;
    acepta_imagen: boolean;
    acepta_privacidad?: boolean;
    es_menor: boolean;
    tutor_nombre: string | null;
    tutor_parentesco: string | null;
    firma_png: string | null;
    firma_hash: string | null;
    ip: string | null;
    user_agent: string | null;
    aceptada_en: string;
    fecha_texto: string;
    hash_anterior: string | null;
    evidencia_hash: string;
}

const s = StyleSheet.create({
    page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#22301B', lineHeight: 1.45 },
    h1: { fontSize: 15, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
    sub: { fontSize: 9, color: '#5F6A52', marginBottom: 14 },
    p: { marginBottom: 7, textAlign: 'justify' },
    caja: { marginTop: 10, padding: 10, borderWidth: 1, borderColor: '#CFE3AE', borderRadius: 4, backgroundColor: '#F6FAEF' },
    fila: { flexDirection: 'row', marginBottom: 3 },
    k: { width: 130, fontFamily: 'Helvetica-Bold', fontSize: 8.5 },
    v: { flex: 1, fontSize: 8.5 },
    mono: { fontFamily: 'Courier', fontSize: 7.5 },
    firma: { height: 60, objectFit: 'contain', marginTop: 4, alignSelf: 'flex-start' },
    pie: { position: 'absolute', bottom: 24, left: 40, right: 40, fontSize: 7, color: '#7A8070', textAlign: 'center' },
});

function Fila({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
    return <View style={s.fila}><Text style={s.k}>{k}</Text><Text style={mono ? [s.v, s.mono] : s.v}>{v}</Text></View>;
}

function Doc({ c }: { c: Comprobante }) {
    return (
        <Document title={`Carta compromiso - folio ${c.folio}`} author="Ecopil MX">
            <Page size="LETTER" style={s.page}>
                <Text style={s.h1}>Carta compromiso · 7º Encuentro Nacional de Innovación Social y Liderazgo Ambiental 2026</Text>
                <Text style={s.sub}>Comprobante de aceptación electrónica · Folio {c.folio} · Versión {c.version}</Text>
                {c.texto.split('\n\n').map((p, i) => (
                    <Text key={i} style={/^\d\. /.test(p) ? [s.p, { fontFamily: 'Helvetica-Bold' }] : s.p}>{p}</Text>
                ))}
                <View style={s.caja} wrap={false}>
                    <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 6 }}>Firma electrónica y evidencia</Text>
                    <Fila k="Nombre escrito" v={c.nombre_escrito} />
                    {c.es_menor && <Fila k="Acepta por la persona menor" v={`${c.tutor_nombre} (${c.tutor_parentesco})`} />}
                    <Fila k="Casillas marcadas" v={`Aviso de privacidad: ${c.acepta_privacidad ? 'leído' : 'no'} · Reglamento y riesgos: ${c.acepta_deslinde ? 'acepto' : 'no'} · Uso de imagen: ${c.acepta_imagen ? 'sí autorizo' : 'no autorizo'}`} />
                    <Fila k="Fecha y hora (servidor)" v={`${c.fecha_texto} · ${c.aceptada_en}`} />
                    <Fila k="Dirección IP" v={c.ip ?? 'no disponible'} />
                    <Fila k="Navegador (user agent)" v={c.user_agent ?? 'no disponible'} />
                    <Fila k="SHA-256 versión de la carta" v={c.carta_hash} mono />
                    <Fila k="SHA-256 texto aceptado" v={c.documento_hash} mono />
                    {c.firma_hash && <Fila k="SHA-256 firma dibujada" v={c.firma_hash} mono />}
                    <Fila k="SHA-256 evidencia" v={c.evidencia_hash} mono />
                    <Fila k="SHA-256 registro anterior" v={c.hash_anterior ?? '(primero)'} mono />
                    {c.firma_png && (
                        // eslint-disable-next-line jsx-a11y/alt-text
                        <Image src={c.firma_png} style={s.firma} />
                    )}
                </View>
                <Text style={s.pie} fixed>
                    Aceptación por medios electrónicos (CCF arts. 1803 y 1834 bis; Código de Comercio arts. 89 a 93). La evidencia original está guardada sin posibilidad de modificación en la base de datos del Encuentro; este PDF es una copia para la persona firmante.
                </Text>
            </Page>
        </Document>
    );
}

export async function descargarComprobante(c: Comprobante) {
    const blob = await pdf(<Doc c={c} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carta-compromiso-folio-${c.folio}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
}
