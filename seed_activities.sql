-- Ejecuta este script en el SQL Editor de Supabase
-- Inserta las actividades del 7mo Encuentro Nacional Ecopil MX 2026 - Pachuca

DO $$
DECLARE
    pid_general UUID;
BEGIN
    -- 1. Obtener o crear proyecto "Gestión General 2026"
    SELECT id INTO pid_general FROM projects WHERE title = 'Gestión General 2026' LIMIT 1;

    IF pid_general IS NULL THEN
        INSERT INTO projects (title, description, year, status)
        VALUES ('Gestión General 2026', '7mo Encuentro Nacional de Nodos Ecopil - Pachuca', 2026, 'yellow')
        RETURNING id INTO pid_general;
    END IF;

    -- 2. Insertar Actividades del Encuentro (Diciembre 2026)

    -- 18 dic - Parque Nacional Tula
    INSERT INTO agenda_activities (project_id, title, description, date, location, status)
    VALUES
    (pid_general, 'Inauguración - Parque Nacional Tula', 'Acto inaugural del 7mo Encuentro Nacional. Bienvenida y presentación de agenda oficial.', '2026-12-18T09:00:00-06:00', 'Parque Nacional Tula', 'yellow'),
    (pid_general, 'Taller de Henopoita - Parque Nacional Tula', 'Taller especializado sobre conservación de especies endémicas de la región. Moderado por expertos ambientales.', '2026-12-18T11:30:00-06:00', 'Parque Nacional Tula', 'yellow'),

    -- 18 dic - Grutas de Xoxafi
    (pid_general, 'Feria Ambiental - Grutas de Xoxafi', 'Exhibición de proyectos ambientales y alianzas corporativas. Stands de organizaciones participantes.', '2026-12-18T14:00:00-06:00', 'Grutas de Xoxafi', 'yellow'),
    (pid_general, 'Recorrido - Grutas de Xoxafi', 'Recorrido guiado por las formaciones geológicas y ecosistema subterráneo de las grutas. Duración: 90 minutos.', '2026-12-18T16:00:00-06:00', 'Grutas de Xoxafi', 'yellow'),

    -- 19 dic - Villa de Tezontepec
    (pid_general, 'Reforestación y Mantenimiento - Villa de Tezontepec', 'Jornada de reforestación participativa con enfoque en especies nativas y mantenimiento de áreas verdes.', '2026-12-19T08:00:00-06:00', 'Villa de Tezontepec', 'yellow'),
    (pid_general, 'Feria Ambiental - Villa de Tezontepec', 'Segunda etapa: Feria ambiental con talleres, conferencias y networking entre participantes.', '2026-12-19T14:00:00-06:00', 'Villa de Tezontepec', 'yellow'),

    -- 19 dic - Mineral del Chico
    (pid_general, 'Recorrido y Capacitación - Mineral del Chico', 'Recorrido por la zona de Mineral del Chico con capacitación sobre conservación de manantiales y ecosistemas acuáticos.', '2026-12-19T10:00:00-06:00', 'Mineral del Chico', 'yellow'),

    -- 20 dic - Acaxochitlan
    (pid_general, 'Recorrido en los Manantiales - Acaxochitlan', 'Visita a los manantiales locales con énfasis en importancia hidrológica y biodiversidad acuática.', '2026-12-20T08:00:00-06:00', 'Acaxochitlan', 'yellow'),
    (pid_general, 'Capacitación - Acaxochitlan', 'Sesión de capacitación sobre monitoreo de recursos hídricos y restauración de ecosistemas acuáticos.', '2026-12-20T10:30:00-06:00', 'Acaxochitlan', 'yellow'),
    (pid_general, 'Feria Ambiental - Acaxochitlan', 'Tercera etapa de la feria ambiental con enfoque en agua y sostenibilidad hídrica regional.', '2026-12-20T14:00:00-06:00', 'Acaxochitlan', 'yellow'),

    -- 20 dic - Tulancingo / Ajolotequio (tentativo)
    (pid_general, 'Visita al Ajolotequio - Tulancingo', 'TENTATIVO - Fecha por confirmar. Visita explorativa al ajolotequio. Observación de especies endémicas y educación ambiental.', '2026-12-20T16:00:00-06:00', 'Tulancingo / Ajolotequio', 'yellow');

    RAISE NOTICE 'Actividades cargadas exitosamente para el 7mo Encuentro Nacional Ecopil MX 2026';

END $$;
