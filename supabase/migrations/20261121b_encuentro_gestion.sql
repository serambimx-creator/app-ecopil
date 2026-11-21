-- Gestión del Encuentro: cronograma, responsables, contactos, bitácora, avisos y gestores.
-- Base "Ecopil 2026". Todo se lee y escribe por funciones: las tablas no tienen políticas
-- (RLS activo, sin acceso directo para anon/authenticated).

create table if not exists public.gestores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  telefono text,
  pin_hash text,
  rol text not null default 'gestor' check (rol in ('gestor', 'admin')),
  activo boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.gestores enable row level security;

create table if not exists public.gestor_sesiones (
  token text primary key default encode(extensions.gen_random_bytes(24), 'hex'),
  gestor_id uuid not null references public.gestores(id) on delete cascade,
  expira timestamptz not null default now() + interval '30 days'
);
alter table public.gestor_sesiones enable row level security;

create table if not exists public.gestor_intentos (nombre text, at timestamptz not null default now());
alter table public.gestor_intentos enable row level security;

create table if not exists public.actividades (
  id uuid primary key default gen_random_uuid(),
  dia date not null,
  inicio time,
  fin time,
  titulo text not null,
  tipo text not null default 'actividad' check (tipo in ('actividad', 'comida', 'traslado', 'taller', 'logistica', 'preparacion')),
  publica boolean not null default true,
  descripcion text,            -- lo que ven los asistentes
  notas text,                  -- solo gestores
  sede text,                   -- slug de la sede de la guía (tula, xoxafi, tezontepec, chico, acaxochitlan, ajolotequio, hotel)
  grupo text check (grupo in ('A', 'B')),
  origen_url text,
  destino_url text,
  pendientes text,
  reconocimientos text,
  presupuesto numeric,
  prioridad text,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'en_proceso', 'listo', 'en_curso', 'hecho', 'cancelado')),
  orden int not null default 0,
  actualizado_por uuid references public.gestores(id),
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.actividades enable row level security;
create index if not exists actividades_dia_idx on public.actividades (dia, inicio, orden);

create table if not exists public.actividad_responsables (
  id uuid primary key default gen_random_uuid(),
  actividad_id uuid not null references public.actividades(id) on delete cascade,
  persona text not null,
  detalle text,                -- p. ej. "Grupo 2"
  material text,
  material_listo boolean not null default false,
  equipo text,
  orden int not null default 0
);
alter table public.actividad_responsables enable row level security;

create table if not exists public.contactos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  organizacion text,
  rol text,
  tipo text not null default 'aliado' check (tipo in ('staff', 'anfitrion', 'aliado', 'patrocinador', 'proveedor', 'emergencia', 'otro')),
  telefono text,
  sede text,
  notas text,
  actualizado_por uuid references public.gestores(id),
  updated_at timestamptz not null default now()
);
alter table public.contactos enable row level security;

create table if not exists public.bitacora (
  id uuid primary key default gen_random_uuid(),
  actividad_id uuid references public.actividades(id) on delete set null,
  tipo text not null default 'nota' check (tipo in ('nota', 'observacion', 'problema', 'incidente', 'accidente')),
  gravedad text check (gravedad in ('baja', 'media', 'alta')),
  texto text not null,
  foto_url text,
  resuelto boolean not null default false,
  autor_id uuid references public.gestores(id),
  created_at timestamptz not null default now()
);
alter table public.bitacora enable row level security;

create table if not exists public.avisos (
  id uuid primary key default gen_random_uuid(),
  texto text not null,
  nivel text not null default 'info' check (nivel in ('info', 'importante', 'urgente')),
  visible_hasta timestamptz,
  autor_id uuid references public.gestores(id),
  created_at timestamptz not null default now()
);
alter table public.avisos enable row level security;

-- Historial de cambios para poder ver quién cambió qué y deshacer.
create table if not exists public.cambios (
  id bigserial primary key,
  tabla text not null,
  fila_id uuid not null,
  accion text not null,
  antes jsonb,
  despues jsonb,
  gestor_id uuid references public.gestores(id),
  at timestamptz not null default now()
);
alter table public.cambios enable row level security;

alter table public.encuentro_registros add column if not exists confirmado_en timestamptz;

-- ---------- Acceso de gestores ----------

create or replace function public.gestor_de_token(p_token text)
returns uuid language sql stable security definer set search_path = public as $$
  select s.gestor_id from gestor_sesiones s join gestores g on g.id = s.gestor_id
  where s.token = p_token and s.expira > now() and g.activo;
$$;

-- Entrar con nombre y PIN personal. Devuelve token de sesión (30 días) o null.
create or replace function public.gestor_entrar(p_nombre text, p_pin text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare g gestores; t text;
begin
  if (select count(*) from gestor_intentos where lower(nombre) = lower(p_nombre) and at > now() - interval '15 minutes') >= 8 then
    return jsonb_build_object('error', 'Demasiados intentos. Espera 15 minutos.');
  end if;
  select * into g from gestores where lower(nombre) = lower(trim(p_nombre)) and activo and pin_hash is not null;
  if g.id is null or g.pin_hash <> crypt(p_pin, g.pin_hash) then
    insert into gestor_intentos (nombre) values (p_nombre);
    return jsonb_build_object('error', 'Nombre o PIN incorrecto.');
  end if;
  insert into gestor_sesiones (gestor_id) values (g.id) returning token into t;
  return jsonb_build_object('token', t, 'gestor', jsonb_build_object('id', g.id, 'nombre', g.nombre, 'rol', g.rol));
end $$;

create or replace function public.gestor_salir(p_token text)
returns void language sql security definer set search_path = public as $$
  delete from gestor_sesiones where token = p_token;
$$;

-- Nombres de gestores activos para el selector de entrada.
create or replace function public.gestores_nombres()
returns setof text language sql stable security definer set search_path = public as $$
  select nombre from gestores where activo and pin_hash is not null order by nombre;
$$;

-- ---------- Lecturas ----------

-- Todo lo público: programa (sin notas internas), avisos vigentes.
create or replace function public.encuentro_publico()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'actividades', coalesce((select jsonb_agg(jsonb_build_object(
        'id', a.id, 'dia', a.dia, 'inicio', a.inicio, 'fin', a.fin, 'titulo', a.titulo, 'tipo', a.tipo,
        'descripcion', a.descripcion, 'sede', a.sede, 'grupo', a.grupo, 'destino_url', a.destino_url, 'estado', a.estado)
        order by a.dia, a.inicio nulls first, a.orden)
      from actividades a where a.publica and a.estado <> 'cancelado'), '[]'::jsonb),
    'avisos', coalesce((select jsonb_agg(jsonb_build_object('id', v.id, 'texto', v.texto, 'nivel', v.nivel, 'created_at', v.created_at)
        order by v.created_at desc)
      from avisos v where v.visible_hasta is null or v.visible_hasta > now()), '[]'::jsonb),
    'generado', now());
$$;

-- Todo lo de gestores.
create or replace function public.gestor_datos(p_token text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare gid uuid := gestor_de_token(p_token);
begin
  if gid is null then return null; end if;
  return jsonb_build_object(
    'yo', (select jsonb_build_object('id', id, 'nombre', nombre, 'rol', rol) from gestores where id = gid),
    'actividades', coalesce((select jsonb_agg(to_jsonb(a) || jsonb_build_object(
        'responsables', coalesce((select jsonb_agg(to_jsonb(r) order by r.orden) from actividad_responsables r where r.actividad_id = a.id), '[]'::jsonb),
        'actualizado_por_nombre', (select nombre from gestores where id = a.actualizado_por))
        order by a.dia, a.inicio nulls first, a.orden) from actividades a), '[]'::jsonb),
    'contactos', coalesce((select jsonb_agg(to_jsonb(c) order by c.tipo, c.nombre) from contactos c), '[]'::jsonb),
    'bitacora', coalesce((select jsonb_agg(to_jsonb(b) || jsonb_build_object('autor', (select nombre from gestores where id = b.autor_id)) order by b.created_at desc) from bitacora b), '[]'::jsonb),
    'avisos', coalesce((select jsonb_agg(to_jsonb(v) order by v.created_at desc) from avisos v), '[]'::jsonb),
    'gestores', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'nombre', nombre, 'telefono', telefono, 'rol', rol) order by nombre) from gestores where activo), '[]'::jsonb),
    'registros', coalesce((select jsonb_agg(jsonb_build_object('id', r.id, 'nombre', r.nombre, 'nodo', n.nombre, 'telefono', r.telefono, 'email', r.email,
        'foto_url', r.foto_url, 'ciudad', r.ciudad, 'emergencia_nombre', r.emergencia_nombre, 'emergencia_telefono', r.emergencia_telefono,
        'estado', r.estado, 'grupo', r.grupo, 'confirmado_en', r.confirmado_en, 'created_at', r.created_at) order by r.created_at)
      from encuentro_registros r join encuentro_nodos_lista n on n.id = r.nodo_id), '[]'::jsonb),
    'generado', now());
end $$;

-- ---------- Escrituras ----------

-- Guardar (crear o actualizar) una fila. Solo tablas y columnas permitidas; deja historial.
create or replace function public.gestor_guardar(p_token text, p_tabla text, p_datos jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  gid uuid := gestor_de_token(p_token);
  permitidas jsonb := '{
    "actividades": ["dia","inicio","fin","titulo","tipo","publica","descripcion","notas","sede","grupo","origen_url","destino_url","pendientes","reconocimientos","presupuesto","prioridad","estado","orden"],
    "actividad_responsables": ["actividad_id","persona","detalle","material","material_listo","equipo","orden"],
    "contactos": ["nombre","organizacion","rol","tipo","telefono","sede","notas"],
    "bitacora": ["actividad_id","tipo","gravedad","texto","foto_url","resuelto"],
    "avisos": ["texto","nivel","visible_hasta"]
  }';
  cols text[]; k text; v_id uuid; antes jsonb; despues jsonb; sets text := ''; ins_cols text := ''; ins_vals text := '';
begin
  if gid is null then raise exception 'Sesión vencida. Vuelve a entrar.'; end if;
  if not permitidas ? p_tabla then raise exception 'Tabla no permitida'; end if;
  select array_agg(x) into cols from jsonb_array_elements_text(permitidas -> p_tabla) x;
  v_id := nullif(p_datos ->> 'id', '')::uuid;

  for k in select jsonb_object_keys(p_datos) loop
    if k = any(cols) then
      sets := sets || format('%I = r.%I, ', k, k);
      ins_cols := ins_cols || format('%I, ', k);
      ins_vals := ins_vals || format('r.%I, ', k);
    end if;
  end loop;

  if v_id is not null then
    execute format('select to_jsonb(t) from %I t where id = $1', p_tabla) into antes using v_id;
  end if;

  if antes is null then
    if p_tabla in ('actividades', 'contactos') then ins_cols := ins_cols || 'actualizado_por, '; ins_vals := ins_vals || quote_literal(gid) || '::uuid, '; end if;
    if p_tabla in ('bitacora', 'avisos') then ins_cols := ins_cols || 'autor_id, '; ins_vals := ins_vals || quote_literal(gid) || '::uuid, '; end if;
    execute format('insert into %I (%s id) select %s coalesce($2, gen_random_uuid()) from jsonb_populate_record(null::%I, $1) r returning to_jsonb(%I.*)',
      p_tabla, ins_cols, ins_vals, p_tabla, p_tabla) into despues using p_datos, v_id;
  else
    if sets = '' then return antes; end if;
    if p_tabla in ('actividades', 'contactos') then sets := sets || format('actualizado_por = %L::uuid, updated_at = now(), ', gid); end if;
    execute format('update %I t set %s id = t.id from jsonb_populate_record(null::%I, $1) r where t.id = $2 returning to_jsonb(t.*)',
      p_tabla, sets, p_tabla) into despues using p_datos, v_id;
  end if;

  insert into cambios (tabla, fila_id, accion, antes, despues, gestor_id)
  values (p_tabla, (despues ->> 'id')::uuid, case when antes is null then 'crear' else 'editar' end, antes, despues, gid);
  return despues;
end $$;

create or replace function public.gestor_borrar(p_token text, p_tabla text, p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare gid uuid := gestor_de_token(p_token); antes jsonb;
begin
  if gid is null then raise exception 'Sesión vencida. Vuelve a entrar.'; end if;
  if p_tabla not in ('actividades', 'actividad_responsables', 'contactos', 'bitacora', 'avisos') then raise exception 'Tabla no permitida'; end if;
  execute format('delete from %I where id = $1 returning to_jsonb(%I.*)', p_tabla, p_tabla) into antes using p_id;
  if antes is not null then
    insert into cambios (tabla, fila_id, accion, antes, gestor_id) values (p_tabla, p_id, 'borrar', antes, gid);
  end if;
end $$;

-- Registros: aprobar/grupo con sesión de gestor (reemplaza al PIN compartido).
create or replace function public.gestor_revisar_registro(p_token text, p_id uuid, p_estado text, p_grupo text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r encuentro_registros;
begin
  if gestor_de_token(p_token) is null then raise exception 'Sesión vencida. Vuelve a entrar.'; end if;
  update encuentro_registros
     set estado = coalesce(p_estado, estado),
         grupo = case when p_estado = 'rechazado' then null else coalesce(p_grupo, grupo) end,
         revisado_en = now()
   where id = p_id returning * into r;
  return to_jsonb(r) - 'token';
end $$;

-- El agente confirma su asistencia con su enlace personal.
create or replace function public.encuentro_confirmar(p_token text)
returns boolean language sql security definer set search_path = public as $$
  update encuentro_registros set confirmado_en = coalesce(confirmado_en, now())
  where token = p_token and estado = 'aprobado' returning true;
$$;

-- encuentro_mi_registro con confirmación (versión nueva; la anterior se deja para no romper enlaces).
create or replace function public.encuentro_mi_registro2(p_token text)
returns table (nombre text, email text, nodo text, ciudad text, foto_url text, estado text, grupo text, confirmado_en timestamptz)
language sql stable security definer set search_path = public as $$
  select r.nombre, r.email, n.nombre, r.ciudad, r.foto_url, r.estado, r.grupo, r.confirmado_en
  from encuentro_registros r join encuentro_nodos_lista n on n.id = r.nodo_id
  where r.token = p_token;
$$;

grant execute on function public.gestor_entrar(text, text), public.gestor_salir(text), public.gestores_nombres(),
  public.encuentro_publico(), public.gestor_datos(text), public.gestor_guardar(text, text, jsonb),
  public.gestor_borrar(text, text, uuid), public.gestor_revisar_registro(text, uuid, text, text),
  public.encuentro_confirmar(text), public.encuentro_mi_registro2(text) to anon, authenticated;
revoke execute on function public.gestor_de_token(text) from public, anon, authenticated;

-- Admin: dar de alta un gestor o cambiarle el PIN.
create or replace function public.gestor_admin_guardar(p_token text, p_nombre text, p_telefono text, p_rol text, p_pin text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare g gestores;
begin
  if not exists (select 1 from gestores where id = gestor_de_token(p_token) and rol = 'admin') then
    raise exception 'Solo un admin puede hacer esto.';
  end if;
  if p_pin is not null and length(p_pin) < 6 then raise exception 'El PIN debe tener al menos 6 caracteres.'; end if;
  insert into gestores (nombre, telefono, rol, pin_hash)
  values (trim(p_nombre), nullif(trim(p_telefono), ''), coalesce(p_rol, 'gestor'), case when p_pin is null then null else crypt(p_pin, gen_salt('bf')) end)
  on conflict (nombre) do update set
    telefono = coalesce(excluded.telefono, gestores.telefono),
    rol = coalesce(p_rol, gestores.rol),
    pin_hash = coalesce(excluded.pin_hash, gestores.pin_hash),
    activo = true
  returning * into g;
  return jsonb_build_object('id', g.id, 'nombre', g.nombre, 'rol', g.rol, 'tiene_pin', g.pin_hash is not null);
end $$;
grant execute on function public.gestor_admin_guardar(text, text, text, text, text) to anon, authenticated;
