-- Ejecuta esto en el SQL Editor de Supabase para crear el checklist
-- compartido de "Tareas de Staff" que se ve en el War Room.

-- 1. Tabla
CREATE TABLE IF NOT EXISTS staff_tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    responsible TEXT,
    detail TEXT,
    task_date TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Seed de las tareas del 10-dic (hoja de logistica)
INSERT INTO staff_tasks (id, title, responsible, detail, task_date, sort_order) VALUES
    ('video-encuentro', 'Video del Encuentro', 'Serambi', NULL, '10 dic', 1),
    ('inventario-pintura', 'Inventario de pintura', 'Wendy', NULL, '10 dic', 2),
    ('mural-jasso', 'Mural Jasso · materiales', NULL, '2 L blanco · 1 L amarillo · 1 L azul · 1 L negro', '10 dic', 3),
    ('mural-alejandro', 'Mural Alejandro', NULL, NULL, '10 dic', 4)
ON CONFLICT (id) DO NOTHING;

-- 3. Row Level Security
ALTER TABLE staff_tasks ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede ver el checklist
CREATE POLICY "Authenticated users can view staff tasks"
ON staff_tasks FOR SELECT
USING (auth.role() = 'authenticated');

-- Cualquier usuario autenticado puede marcar/desmarcar tareas
CREATE POLICY "Authenticated users can update staff tasks"
ON staff_tasks FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Solo para agregar nuevas tareas desde la app en el futuro (opcional)
CREATE POLICY "Authenticated users can insert staff tasks"
ON staff_tasks FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
