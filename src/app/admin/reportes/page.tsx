'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image as PDFImage } from '@react-pdf/renderer';
import { supabase } from '@/lib/supabase';
import { calculateImpact, calculateFinances } from '@/lib/reports';
import { FileDown, Loader2 } from 'lucide-react';

// Styles for PDF
const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },
    header: { marginBottom: 20, borderBottomWidth: 2, borderBottomColor: '#00DF81', paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#111' },
    subtitle: { fontSize: 12, color: '#666', marginTop: 4 },
    section: { marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#00DF81' },
    metricRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    metricLabel: { fontSize: 12, color: '#444' },
    metricValue: { fontSize: 12, fontWeight: 'bold', color: '#111' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    card: { width: '48%', backgroundColor: '#f5f5f5', padding: 10, borderRadius: 5, marginBottom: 10 },
    cardTitle: { fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
    cardText: { fontSize: 8, color: '#444' },
    footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, textAlign: 'center', color: '#999' }
});

// PDF Document Component
const ReportDocument = ({ impact, finances, activities }: { impact: any, finances: any, activities: any[] }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Reporte Ejecutivo 2026</Text>
                    <Text style={styles.subtitle}>Ecopil · Serambi · Encuentro Nacional</Text>
                </View>
                {/* Logo Placeholder - In real app, allow local/hosted image */}
                <View style={{ width: 40, height: 40, backgroundColor: '#00DF81', borderRadius: 20 }} />
            </View>

            {/* Impact Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Impacto General</Text>
                <View style={{ flexDirection: 'row', gap: 20 }}>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Actividades Totales</Text>
                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{impact.totalActivities}</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Lugares Validados</Text>
                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{impact.validatedPlaces}</Text>
                    </View>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Voluntarios</Text>
                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{impact.totalVolunteers}</Text>
                    </View>
                </View>
            </View>

            {/* Finance Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Resumen Financiero</Text>
                <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>TOTAL Presupuesto Estimado:</Text>
                    <Text style={styles.metricValue}>${finances.totalEstimated?.toLocaleString()}</Text>
                </View>
                <View style={styles.metricRow}>
                    <Text style={styles.metricLabel}>TOTAL Ejecutado:</Text>
                    <Text style={styles.metricValue}>${finances.totalSpent?.toLocaleString()}</Text>
                </View>
                <View style={{ marginTop: 5, height: 2, backgroundColor: '#eee', width: '100%' }} />
            </View>

            {/* Agreements Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Compromisos & Acuerdos</Text>
                {activities.filter(a => a.agreements).slice(0, 10).map((act, i) => (
                    <View key={i} style={{ marginBottom: 8 }}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold' }}>• {act.title}</Text>
                        <Text style={{ fontSize: 9, color: '#555', marginLeft: 10 }}>{act.agreements}</Text>
                    </View>
                ))}
            </View>

            <Text style={styles.footer}>
                Generado automáticamente por Ecopil Intelligence System - {new Date().toLocaleDateString()}
            </Text>
        </Page>
    </Document>
);

// We need to use dynamic import with ssr false for PDF Viewer, or just render the Download Link
// React-pdf renderer can run on client. 

export default function ReportesPage() {
    const [impact, setImpact] = useState<any>(null);
    const [finances, setFinances] = useState<any>(null);
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const imp = await calculateImpact();
            const fin = await calculateFinances();
            const { data: acts } = await supabase.from('agenda_activities').select('*');

            setImpact(imp);
            setFinances(fin);
            setActivities(acts || []);
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Generando datos...</div>;

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-10 pt-24 max-w-4xl mx-auto flex flex-col items-center justify-center text-center">

            <div className="bg-gradient-to-br from-brand-green/20 to-transparent p-1 rounded-3xl mb-8 animate-in fade-in zoom-in duration-700">
                <div className="bg-dark-surface rounded-[20px] p-10 border border-white/10">
                    <h1 className="text-4xl font-black mb-4">Reporte de Impacto 2026</h1>
                    <p className="text-gray-400 max-w-md mx-auto mb-8">
                        Descarga el documento oficial con el resumen de métricas, finanzas y acuerdos estratégicos del Encuentro Nacional.
                    </p>

                    <PDFDownloadLink
                        document={<ReportDocument impact={impact} finances={finances} activities={activities} />}
                        fileName="Ecopil_Reporte_2026.pdf"
                        className="inline-flex items-center gap-2 bg-brand-green text-dark-surface font-bold text-lg px-8 py-4 rounded-full hover:bg-white hover:scale-105 transition-all shadow-[0_0_30px_rgba(0,223,129,0.3)]"
                    >
                        {({ blob, url, loading, error }) =>
                            loading ? (
                                <>
                                    <Loader2 className="animate-spin" /> Preparando PDF...
                                </>
                            ) : (
                                <>
                                    <FileDown /> Descargar PDF Oficial
                                </>
                            )
                        }
                    </PDFDownloadLink>
                </div>
            </div>

            <p className="text-gray-600 text-xs uppercase tracking-widest">
                Sistema Operativo Ecopil v1.0
            </p>
        </div>
    );
}
