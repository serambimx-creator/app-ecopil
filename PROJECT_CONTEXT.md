 PROTOCOLO DE DESARROLLO: ECOPIL MX 2026
1. MISIÓN Y ALCANCE
Este proyecto es una App Web Progresiva (PWA) para la gestión integral del Encuentro Nacional Ecopil MX 2026 en Pachuca.
Objetivo: Gestión de proyectos anuales, logística del evento y portal interactivo de participantes.
Roles: Staff Core (6 personas), Organizadores Nacionales (Veedores), Participantes (Usuarios finales).
2. REGLAS DE ORO DE CODIFICACIÓN (ANTI-ALUCINACIÓN)
🚫 PROHIBIDO: Reescribir archivos completos para cambios menores. Las ediciones deben ser quirúrgicas.
🚫 PROHIBIDO: Eliminar comentarios de lógica o documentación existente.
🚫 PROHIBIDO: Cambiar la estructura de archivos sin aprobación previa del usuario.
🚫 PROHIBIDO: Usar estilos genéricos tipo Notion o librerías de componentes sin estilizar.
✅ OBLIGATORIO: Mantener la modularidad. Si un componente crece más de 150 líneas, debe dividirse.
✅ OBLIGATORIO: Respetar los "Design Tokens" definidos en tailwind.config.ts.
✅ OBLIGATORIO: Validar tipos con TypeScript estrictamente.
3. IDENTIDAD VISUAL (ADN SOCIAL MEDIA)
Estilo: Inspirado en TikTok/Instagram/BeReal. No Notion-style.
UX: Mobile-first (Navegación inferior), tarjetas con rounded-3xl, Glassmorphism, tipografía contrastada.
Interactividad: Los cambios de estado (semáforos) deben ser visualmente inmediatos y atractivos.
Ergonomía: Todo lo importante debe estar al alcance del pulgar en móvil.
4. ARQUITECTURA TÉCNICA
Frontend: Next.js (App Router).
Estilos: Tailwind CSS (Uso estricto de clases del config).
Backend: Supabase (PostgreSQL + Auth + Storage).
Integraciones: Google Calendar API (Bidireccional), Google Drive (Evidencias).
Costo de Infraestructura: Debe mantenerse en $0 (Free Tiers).
5. LÓGICA DE DATOS Y JERARQUÍA
PROYECTOS (Gestión Anual): Planificación, reuniones, costos previos, scoutings.
ACTIVIDADES (Encuentro): Bloques de tiempo vinculados a Proyectos ya validados.
SUB-BLOQUES: Desglose operativo interno de cada actividad (Traslados, ejecución, cierres).
USUARIOS: Perfiles con etiquetas de roles específicos (Talleristas, Voluntarios, Staff).
6. INSTRUCCIÓN PARA LA IA
"Antes de proponer cualquier cambio, lee este archivo. Asegúrate de que tu propuesta no rompa la consistencia visual ni la jerarquía de roles. Si detectas una posible alucinación o contradicción, detente y pregunta.