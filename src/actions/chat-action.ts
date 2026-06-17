'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin for Server context (or use regular client with forwarded session if preferred, but for now Admin/Service role or standard client is fine if we just need data)
// Ideally we should use createServerComponentClient from @supabase/auth-helpers-nextjs but let's stick to the existing lib structure if possible, 
// OR simpler: just use the public url/anon key if RLS allows, or process.env vars for admin.
// For this 'Secure' implementation, we'll use standard process.env vars.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// Note: In a real app, use Service Role Key for Admin actions, but here we simulate User actions so Anon is safer unless we bypass RLS.
const supabase = createClient(supabaseUrl, supabaseKey);

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ CRITICAL: Supabase Vars missing in Server Action");
}

const ALLOWED_ORIGINS = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function processChatMessage(userMessage: string, userId: string) {
    console.log("--- Server Action: Processing Chat ---");


    // 0. Developer Override for Testing DB (Bypasses AI)
    if (userMessage.startsWith('/test-agenda')) {
        const testDate = new Date().toISOString().split('T')[0];
        const payload = {
            title: "Reunión de Prueba DB",
            description: "Test generado con /test-agenda",
            date: `${testDate}T10:00:00`,
            location: "Oficina Virtual",
            status: 'green',
            project_id: (await getProjectId())
        };
        const { error } = await supabase.from('agenda_activities').insert(payload);
        if (error) return { success: true, text: `❌ DB Test Failed: ${error.message}` };
        return { success: true, text: `✅ DB Test Exitoso: Actividad creada correcamente en la tabla.` };
    }

    // 1. Secure API Key Check (Server Side Only)
    // We strictly use GOOGLE_GENERATIVE_AI_API_KEY as primary, falling back to GEMINI_API_KEY
    const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;

    console.log('[DEBUG IA] Llave detectada: ', !!API_KEY); // User requested debug

    if (!API_KEY || API_KEY.includes('placeholder')) {
        console.error("Server: Missing GOOGLE_GENERATIVE_AI_API_KEY");
        return {
            success: false,
            text: "🚨 Error de Configuración del Servidor: No se encontró la variable `GOOGLE_GENERATIVE_AI_API_KEY` en el archivo .env. Por favor agrégala para usar el modo Real."
        };
    }

    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // 2. Fetch Context (Server Side - Fast & Secure)
        const [projectsRes, financesRes, activitiesRes] = await Promise.all([
            supabase.from('projects').select('id, title').limit(5),
            supabase.from('finances').select('amount, description').limit(5),
            supabase.from('agenda_activities').select('title, date, location').limit(5)
        ]);

        const contextSummary = `
        Proyectos: ${JSON.stringify(projectsRes.data)}
        Finanzas Recientes: ${JSON.stringify(financesRes.data)}
        Actividades Agendadas: ${JSON.stringify(activitiesRes.data)}
        `;

        // 3. Prompt Engineering
        const now = new Date();
        const systemPrompt = `
        Eres ECO-BOT, el asistente ejecutivo de Ecopil.
        Tu misión es ayudar al organizador con información precisa.

        FECHA Y HORA ACTUAL: ${now.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. Hora: ${now.toLocaleTimeString('es-MX')}.
        
        Contexto en Tiempo Real:
        ${contextSummary}

        Usuario: ${userMessage}
        
        Instrucciones:
        1. Interpreta FECHAS RELATIVAS (hoy, mañana, el viernes) y conviértelas a formato YYYY-MM-DD.
        2. Si faltan datos, IMPROVISA valores lógicos (ej. hora default 09:00 AM, ubicación "Por definir").
        3. Si te piden agendar o gastar, RESPONDE SOLO CON UN JSON ESTRUCTURADO.
        4. Formato JSON: { "action": "addActivity" | "addExpense", "data": { "title": "...", "date": "YYYY-MM-DD", "time": "HH:MM", "location": "...", "description": "..." } }
        5. Si es solo charla, responde texto normal amigable y profesional.
        `;

        const result = await model.generateContent(systemPrompt);
        const response = result.response;
        const text = response.text();

        // 4. Action Execution Logic (Agentic Bridge)
        const actionBlock = ExtractActionJSON(text);

        if (actionBlock) {
            console.log("🤖 AI Action Detected:", actionBlock);
            const { action, data } = actionBlock;

            if (action === 'addActivity') {
                const { title, date, time, location, description } = data;

                // Smart Defaults
                const finalTitle = title || "Nueva Reunión Ecopil";
                const finalDate = date || new Date().toISOString().split('T')[0];
                const finalTime = time || "09:00";
                const finalLocation = location || "Por definir";

                const payload = {
                    title: finalTitle,
                    description: description || `Agendado por IA para Luis (${new Date().toLocaleDateString()})`,
                    date: `${finalDate}T${finalTime}:00`,
                    location: finalLocation,
                    status: 'yellow',
                    project_id: (await getProjectId()) || '00000000-0000-0000-0000-000000000000'
                };

                const { error } = await supabase.from('agenda_activities').insert(payload);

                if (error) {
                    console.error("DB Error:", error);
                    return { success: true, text: `😅 Ups Luis, falló la conexión con la agenda. Error técnico: ${error.message}` };
                }

                return { success: true, text: `¡Listo Luis! 🗓️ He agendado "${finalTitle}" para el ${finalDate} a las ${finalTime} hrs en ${finalLocation}. Semáforo iniciado en Amarillo 🟡.` };
            }

            if (action === 'addExpense') {
                const { description, amount } = data;
                const finalDesc = description || "Gasto general";
                const finalAmount = Number(amount) || 0;

                const payload = {
                    amount: finalAmount,
                    description: finalDesc,
                    type: 'expense',
                    date: new Date().toISOString(),
                    project_id: (await getProjectId())
                };

                const { error } = await supabase.from('finances').insert(payload);
                if (error) return { success: true, text: `No pude registrar el gasto: ${error.message}` };

                return { success: true, text: `¡Entendido! 💸 Gasto de $${finalAmount} registrado bajo concepto "${finalDesc}". Tu balance se actualizó.` };
            }
        }

        // If no JSON detected, return the raw conversational text
        return { success: true, text: text };

    } catch (error: any) {
        // Handle Rate Limits (User Feedback)
        if (error.message?.includes('429') || error.toString().includes('Quota')) {
            console.warn("⚠️ API Quota Exceeded (handled gracefully)"); // Warn instead of Error to avoid "Issue" badge
            return { success: false, text: "⚠️ Límite de Cuota Excedido (429): La API Key gratuita ha alcanzado su límite. Intenta usar `/test-agenda` para probar la BD sin IA." };
        }

        console.error("Server Action Error:", error);
        return { success: false, text: `Error del Servidor: ${error.message}` };
    }
}

// --- Helpers ---

function ExtractActionJSON(text: string): any | null {
    try {
        // 1. Try finding a markdown block
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
            return JSON.parse(jsonMatch[1]);
        }
        // 2. Try finding a raw JSON object start/end
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            const potentialJson = text.substring(firstBrace, lastBrace + 1);
            return JSON.parse(potentialJson);
        }
    } catch (e) {
        console.error("JSON Parse Error:", e);
    }
    return null;
}

async function getProjectId() {
    // Quick helper to get a default project ID for context
    const { data } = await supabase.from('projects').select('id').limit(1).single();

    if (data?.id) return data.id;

    // If no project exists, create a default one to avoid FK errors
    const { data: newProject, error } = await supabase.from('projects').insert({
        title: 'Gestión General 2026',
        year: 2026,
        status: 'green',
        description: 'Proyecto creado automáticamente por el Asistente IA'
    }).select('id').single();

    if (error) {
        console.error("Failed to create default project:", error);
        return null;
    }

    return newProject?.id;
}
