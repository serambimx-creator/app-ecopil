-- Registro simple sin cuenta: el agente llena el formulario; el staff revisa con un PIN.
-- Reemplaza el esquema con login por correo (la tabla estaba vacía).

drop trigger if exists encuentro_registros_guard on public.encuentro_registros;
drop function if exists public.encuentro_registros_guard();
drop function if exists public.encuentro_mi_rol();
drop function if exists public.encuentro_es_staff();
drop function if exists public.encuentro_perfil_previo();
drop table if exists public.encuentro_registros;
drop table if exists public.encuentro_staff;
drop policy if exists "encuentro-fotos: subir la propia" on storage.objects;
drop policy if exists "encuentro-fotos: reemplazar la propia" on storage.objects;

create extension if not exists pgcrypto;

create table public.encuentro_registros (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (length(trim(nombre)) > 1),
  email text not null unique check (email = lower(email)),
  telefono text not null,
  nodo_id uuid not null references public.nodos(id),
  ciudad text,
  foto_url text not null,
  emergencia_nombre text not null,
  emergencia_telefono text not null,
  agente_catalogo_id uuid references public.agentes_catalogo(id) on delete set null,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobado', 'rechazado')),
  grupo text check (grupo in ('A', 'B')),
  revisado_en timestamptz,
  -- Llave del enlace personal del agente (/mi-registro?t=...), su forma de volver a su perfil.
  token text not null unique default encode(extensions.gen_random_bytes(16), 'hex'),
  created_at timestamptz not null default now()
);
alter table public.encuentro_registros enable row level security; -- sin políticas: solo vía funciones

-- PIN del staff (hash bcrypt). Se cambia con: update encuentro_config set staff_pin_hash = crypt('NUEVO', gen_salt('bf'));
create table public.encuentro_config (
  id boolean primary key default true check (id),
  staff_pin_hash text not null
);
alter table public.encuentro_config enable row level security;

create table public.encuentro_pin_intentos (at timestamptz not null default now());
alter table public.encuentro_pin_intentos enable row level security;

-- Verifica el PIN; después de 10 fallos en 15 minutos rechaza todo PIN hasta que pase la ventana.
create or replace function public.encuentro_pin_ok(p_pin text)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
begin
  if (select count(*) from encuentro_pin_intentos where at > now() - interval '15 minutes') >= 10 then
    return false;
  end if;
  if exists (select 1 from encuentro_config where staff_pin_hash = crypt(p_pin, staff_pin_hash)) then
    return true;
  end if;
  insert into encuentro_pin_intentos default values;
  return false;
end $$;

-- Registro público. Si el correo ya existe y sigue pendiente, actualiza los datos.
create or replace function public.encuentro_registrar(
  p_nombre text, p_email text, p_telefono text, p_nodo_id uuid, p_ciudad text,
  p_foto_url text, p_emergencia_nombre text, p_emergencia_telefono text)
returns text language plpgsql security definer set search_path = public as $$
declare v_email text := lower(trim(p_email)); v_estado text; v_token text;
begin
  if p_foto_url not like '%/storage/v1/object/public/encuentro-fotos/%' then
    raise exception 'foto inválida';
  end if;
  select estado into v_estado from encuentro_registros where email = v_email;
  if v_estado is not null and v_estado <> 'pendiente' then
    raise exception 'Este correo ya tiene un registro revisado. Usa tu enlace personal o escribe al staff.';
  end if;
  insert into encuentro_registros (nombre, email, telefono, nodo_id, ciudad, foto_url, emergencia_nombre, emergencia_telefono, agente_catalogo_id)
  values (trim(p_nombre), v_email, trim(p_telefono), p_nodo_id, nullif(trim(p_ciudad), ''), p_foto_url,
          trim(p_emergencia_nombre), trim(p_emergencia_telefono),
          (select id from agentes_catalogo where lower(email) = v_email limit 1))
  on conflict (email) do update set nombre = excluded.nombre, telefono = excluded.telefono, nodo_id = excluded.nodo_id,
    ciudad = excluded.ciudad, foto_url = excluded.foto_url, emergencia_nombre = excluded.emergencia_nombre,
    emergencia_telefono = excluded.emergencia_telefono
  returning token into v_token;
  return v_token;
end $$;

-- Perfil del agente con su enlace personal.
create or replace function public.encuentro_mi_registro(p_token text)
returns table (nombre text, email text, nodo text, ciudad text, foto_url text, estado text, grupo text)
language sql stable security definer set search_path = public as $$
  select r.nombre, r.email, n.nombre, r.ciudad, r.foto_url, r.estado, r.grupo
  from encuentro_registros r join nodos n on n.id = r.nodo_id
  where r.token = p_token;
$$;

create or replace function public.encuentro_listar(p_pin text)
returns setof public.encuentro_registros language plpgsql security definer set search_path = public as $$
begin
  -- Sin raise: un fallo debe quedar guardado en encuentro_pin_intentos.
  if not encuentro_pin_ok(p_pin) then return; end if;
  return query select * from encuentro_registros order by created_at;
end $$;

create or replace function public.encuentro_revisar(p_pin text, p_id uuid, p_estado text, p_grupo text)
returns public.encuentro_registros language plpgsql security definer set search_path = public as $$
declare r encuentro_registros;
begin
  if not encuentro_pin_ok(p_pin) then return null; end if;
  update encuentro_registros
     set estado = coalesce(p_estado, estado),
         grupo = case when p_estado = 'rechazado' then null else coalesce(p_grupo, grupo) end,
         revisado_en = now()
   where id = p_id returning * into r;
  return r;
end $$;

grant execute on function public.encuentro_registrar(text, text, text, uuid, text, text, text, text) to anon, authenticated;
grant execute on function public.encuentro_mi_registro(text) to anon, authenticated;
grant execute on function public.encuentro_pin_ok(text) to anon, authenticated;
grant execute on function public.encuentro_listar(text) to anon, authenticated;
grant execute on function public.encuentro_revisar(text, uuid, text, text) to anon, authenticated;
grant execute on function public.encuentro_nodos() to anon, authenticated;

-- Fotos: cualquiera puede subir a registros/ (máx. 5 MB, solo imágenes, definido en el bucket).
create policy "encuentro-fotos: subir registro" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'encuentro-fotos' and (storage.foldername(name))[1] = 'registros');


-- PIN del staff: cambia TU-PIN-AQUI por uno de al menos 8 caracteres y compártelo solo con el staff.
insert into public.encuentro_config (staff_pin_hash) values (extensions.crypt('TU-PIN-AQUI', extensions.gen_salt('bf')))
on conflict (id) do update set staff_pin_hash = excluded.staff_pin_hash;
