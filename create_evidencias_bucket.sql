-- Ejecuta esto en el SQL Editor de Supabase para habilitar la subida de fotos de la Agenda

-- 1. Crear el bucket publico "evidencias" si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('evidencias', 'evidencias', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Permitir que cualquier usuario pueda ver las evidencias (Publico)
CREATE POLICY "Evidencias son publicas" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'evidencias');

-- 3. Permitir que usuarios autenticados puedan subir archivos
CREATE POLICY "Usuarios autenticados pueden subir evidencias" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'evidencias' AND auth.role() = 'authenticated');

-- 4. Permitir que los dueños borren o modifiquen sus propios archivos (opcional)
CREATE POLICY "Usuarios pueden actualizar sus propias evidencias"
ON storage.objects FOR UPDATE
USING (bucket_id = 'evidencias' AND auth.uid() = owner);

CREATE POLICY "Usuarios pueden borrar sus propias evidencias"
ON storage.objects FOR DELETE
USING (bucket_id = 'evidencias' AND auth.uid() = owner);
