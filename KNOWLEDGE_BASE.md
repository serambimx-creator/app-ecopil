MEMORIA TÉCNICA Y OPERATIVA: ECOPIL MX 2026
1. RESUMEN DEL PROYECTO
Plataforma integral para la gestión del Encuentro Nacional Ecopil MX 2026 en Pachuca/Mineral del Chico. Cubre desde la gestión anual previa hasta la operación de los 3 días del evento (18-21 Dic 2026).
2. ESTADO ACTUAL (VERSIÓN 1.0)
Identidad Visual: "Social Media Style" (inspirado en Instagram/TikTok). Glassmorphism, bordes rounded-3xl, paleta Dark Mode con brand-green (#00DF81).
Core: Next.js (App Router) + Tailwind CSS + Supabase (PostgreSQL/Auth).
Módulos Operativos:
War Room (Dashboard): Widgets financieros, salud del evento e indicadores.
Agenda Inteligente: CRUD de actividades con semáforos (Rojo/Amarillo/Verde).
Mapa Dual: Visor Mapbox con rutas cronológicas para el evento y pins de gestión para el resto del año.
Perfil Multinivel: Dashboards personalizados para Staff (Luis, Karla, Wendy, Marcos, Alexia, Jose Manuel) y Directores Nacionales (Zúñiga, Ríos).
Asistente IA: Integración real con Gemini usando Function Calling para agendar y consultar datos.
Team Chat: Chat en tiempo real con Supabase Realtime para coordinación interna.
3. REGLAS DE ORO (MANTENER SIEMPRE)
Edición Quirúrgica: Nunca reescribir archivos completos. Cambios específicos línea por línea.
Single Source of Truth: Consultar siempre DATABASE_SCHEMA.md antes de proponer cambios en datos.
Mobile-First: Navegación inferior (BottomNav) optimizada para pulgar.
Identidad: Logos de Ecopil y Serambi siempre visibles en el Header bicolor (izq oscuro / der claro).
4. LÓGICA DE DATOS CRÍTICA
Roles: admin (Luis), coordinator (Staff Hidalgo), nacional (Supervisores).
Autenticación: Password temporal serambi. Sincronización entre auth.users y public.profiles.
Auditoría: Cada acción de la IA o el Staff se registra en audit_logs con capacidad de rollback.
5. PENDIENTES PARA EL PRÓXIMO SPRINT (FUTURO)
Portal de Participantes Completo: Habilitar el registro masivo y las fichas de contexto de lugar.
Gamificación: Pulir el módulo de Sorteo con efectos visuales.
Multimedia: Terminar de conectar el almacenamiento de evidencias (fotos/audios) con Google Drive.
Reportes PDF: Estilizar el generador de reportes institucional para que sea 100% fiel al branding de Ecopil.
6. NOTA PARA LA IA QUE RETOME EL PROYECTO:
"No intentes 'mejorar' el diseño cambiando el sistema de diseño a uno estándar (tipo Notion o Admin Dashboard). El usuario requiere una experiencia ágil y visual. Respeta los tokens de tailwind.config.ts. Antes de cualquier cambio masivo, valida con el usuario basándote en la historia del Encuentro en Chiapas 2025."
