-- Ejecuta este script directamente en el SQL Editor de tu panel de Supabase
-- Esto creará los usuarios saltándose la confirmación de correo y asignará las contraseñas reales.

DO $$
DECLARE
    uid_chepe UUID := gen_random_uuid();
    uid_ale UUID := gen_random_uuid();
    uid_karla UUID := gen_random_uuid();
    uid_wendy UUID := gen_random_uuid();
    uid_luis UUID := gen_random_uuid();
    uid_marcos UUID := gen_random_uuid();
BEGIN
    -- 1. Insertar usuarios en auth.users (Autenticación nativa de Supabase)
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud)
    VALUES
    (uid_chepe, 'chepe@serambi.mx', crypt('serambi', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Chepe"}', now(), now(), 'authenticated', 'authenticated'),
    (uid_ale, 'ale@serambi.mx', crypt('serambi', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ale"}', now(), now(), 'authenticated', 'authenticated'),
    (uid_karla, 'karla@serambi.mx', crypt('serambi', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Karla"}', now(), now(), 'authenticated', 'authenticated'),
    (uid_wendy, 'wendy@serambi.mx', crypt('serambi', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Wendy"}', now(), now(), 'authenticated', 'authenticated'),
    (uid_luis, 'luis@serambi.mx', crypt('serambi', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Luis"}', now(), now(), 'authenticated', 'authenticated'),
    (uid_marcos, 'marcos@serambi.mx', crypt('serambi', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Marcos"}', now(), now(), 'authenticated', 'authenticated');

    -- 2. Insertar los mismos perfiles en public.profiles para vincularlos con la app
    INSERT INTO public.profiles (id, email, full_name, node, role)
    VALUES
    (uid_chepe, 'chepe@serambi.mx', 'Chepe', 'Hidalgo', 'admin'),
    (uid_ale, 'ale@serambi.mx', 'Ale', 'Hidalgo', 'coordinator'),
    (uid_karla, 'karla@serambi.mx', 'Karla', 'Hidalgo', 'coordinator'),
    (uid_wendy, 'wendy@serambi.mx', 'Wendy', 'Hidalgo', 'coordinator'),
    (uid_luis, 'luis@serambi.mx', 'Luis', 'Hidalgo', 'admin'),
    (uid_marcos, 'marcos@serambi.mx', 'Marcos', 'Hidalgo', 'coordinator');

END $$;
