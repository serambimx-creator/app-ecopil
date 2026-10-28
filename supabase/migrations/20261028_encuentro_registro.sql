-- Registro de asistentes al Encuentro de Nodos 2026.
-- Vive en la base compartida de Ecopil (la de jornadas); solo agrega objetos con prefijo encuentro_.

create table if not exists public.encuentro_staff (
  email text primary key check (email = lower(email)),
  rol text not null default 'staff' check (rol in ('staff', 'admin')),
  created_at timestamptz not null default now()
);
alter table public.encuentro_staff enable row level security;

create table if not exists public.encuentro_registros (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  agente_catalogo_id uuid references public.agentes_catalogo(id) on delete set null,
  nombre text not null check (length(trim(nombre)) > 1),
  email text not null,
  telefono text not null,
  nodo_id uuid not null references public.nodos(id),
  ciudad text,
  foto_url text not null,
  emergencia_nombre text not null,
  emergencia_telefono text not null,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aprobado', 'rechazado')),
  grupo text check (grupo in ('A', 'B')),
  revisado_por uuid references auth.users(id),
  revisado_en timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.encuentro_registros enable row level security;

-- ¿El usuario actual es staff del Encuentro?
create or replace function public.encuentro_es_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from encuentro_staff where email = lower(auth.jwt() ->> 'email'));
$$;

-- Rol del usuario actual: admin, staff, agente o null (sin registro).
create or replace function public.encuentro_mi_rol()
returns text language sql stable security definer set search_path = public as $$
  select coalesce(
    (select rol from encuentro_staff where email = lower(auth.jwt() ->> 'email')),
    (select 'agente' from encuentro_registros where auth_user_id = auth.uid())
  );
$$;

-- Datos que ya tenemos del agente (cuenta de jornadas) para precargar el formulario.
create or replace function public.encuentro_perfil_previo()
returns table (agente_catalogo_id uuid, nombre text, telefono text, ciudad text, foto_url text, nodo_id uuid)
language sql stable security definer set search_path = public as $$
  select a.id, a.nombre, a.telefono, a.ciudad, a.foto_url,
         coalesce(
           (select m.nodo_id from nodo_miembros m where m.agente_catalogo_id = a.id order by m.principal desc nulls last limit 1),
           (select n.id from nodos n where lower(n.nombre) = lower(a.nodo) limit 1)
         )
  from agentes_catalogo a
  where a.auth_user_id = auth.uid()
     or (a.email is not null and lower(a.email) = lower(auth.jwt() ->> 'email'))
  order by (a.auth_user_id = auth.uid()) desc nulls last
  limit 1;
$$;

-- Nodos activos para el selector (la tabla nodos no tiene políticas públicas).
create or replace function public.encuentro_nodos()
returns table (id uuid, nombre text)
language sql stable security definer set search_path = public as $$
  select id, nombre from nodos where activo order by nombre;
$$;

-- El agente no puede aprobarse ni cambiar su grupo; el correo sale de la sesión.
create or replace function public.encuentro_registros_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();
  if tg_op = 'INSERT' then
    new.email := lower(auth.jwt() ->> 'email');
    new.agente_catalogo_id := (select p.agente_catalogo_id from encuentro_perfil_previo() p);
  end if;
  if not encuentro_es_staff() then
    if tg_op = 'INSERT' then
      new.estado := 'pendiente'; new.grupo := null; new.revisado_por := null; new.revisado_en := null;
    else
      new.estado := old.estado; new.grupo := old.grupo; new.revisado_por := old.revisado_por;
      new.revisado_en := old.revisado_en; new.email := old.email; new.auth_user_id := old.auth_user_id;
      new.agente_catalogo_id := old.agente_catalogo_id;
    end if;
  elsif tg_op = 'UPDATE' and new.estado is distinct from old.estado then
    new.revisado_por := auth.uid(); new.revisado_en := now();
  end if;
  return new;
end $$;

drop trigger if exists encuentro_registros_guard on public.encuentro_registros;
create trigger encuentro_registros_guard before insert or update on public.encuentro_registros
  for each row execute function public.encuentro_registros_guard();

create policy "encuentro_registros: ver el propio o staff" on public.encuentro_registros
  for select to authenticated using (auth_user_id = auth.uid() or public.encuentro_es_staff());
create policy "encuentro_registros: crear el propio" on public.encuentro_registros
  for insert to authenticated with check (auth_user_id = auth.uid());
create policy "encuentro_registros: editar el propio o staff" on public.encuentro_registros
  for update to authenticated using (auth_user_id = auth.uid() or public.encuentro_es_staff());

create policy "encuentro_staff: staff ve la lista" on public.encuentro_staff
  for select to authenticated using (public.encuentro_es_staff());

-- Fotos de perfil: lectura pública, cada quien sube a su carpeta <auth.uid()>/.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('encuentro-fotos', 'encuentro-fotos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "encuentro-fotos: subir la propia" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'encuentro-fotos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "encuentro-fotos: reemplazar la propia" on storage.objects
  for update to authenticated
  using (bucket_id = 'encuentro-fotos' and (storage.foldername(name))[1] = auth.uid()::text);

revoke execute on function public.encuentro_perfil_previo() from public, anon;
revoke execute on function public.encuentro_mi_rol() from public, anon;
grant execute on function public.encuentro_perfil_previo() to authenticated;
grant execute on function public.encuentro_mi_rol() to authenticated;

insert into public.encuentro_staff (email, rol) values ('jorgeluis55245@gmail.com', 'admin')
on conflict (email) do nothing;
