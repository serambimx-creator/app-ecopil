import { processChatMessage } from "@/actions/chat-action";
import { supabase } from "./supabase";

export interface ChatResponse {
    text: string;
    actionPerformed?: boolean;
}

// --- Tool Handlers (Client Side Execution for now, triggered by Server Intent) ---
// Just keeping these available if we want to expand later.
async function handleAddActivity(args: any) {
    const { data, error } = await supabase.from('agenda_activities').insert(args).select().single();
    if (error) return { error: error.message };
    return { success: true, message: "Actividad creada exitosamente." };
}

// --- Main Function ---

export async function sendMessageToGemini(userMessage: string, userId?: string): Promise<ChatResponse> {
    if (!userId) {
        return { text: "Inicia sesión para usar el asistente." };
    }

    try {
        console.log("[Chatbot] Sending to Server Action (Secure Flow)...");

        // Call the Server Action
        const response = await processChatMessage(userMessage, userId);

        if (!response.success) {
            console.error("Server Action Failed:", response.text);
            return { text: response.text };
        }

        // Check if response contains a JSON action (Simple Heuristic for the "Real" request)
        // The server currently returns text.

        return { text: response.text };

    } catch (error: any) {
        console.error("Client Chatbot Error:", error);
        return { text: "Error de comunicación con el servidor. Verifica tu conexión." };
    }
}

export async function rollbackLastAction() {
    return "La función de deshacer no está disponible en este modo.";
}
