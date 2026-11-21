-- Indicadores para el reporte del Encuentro: asistencia por actividad (QR o lista),
-- resultados de campo, comidas servidas, evidencias fotográficas y encuesta final.
-- Todo con RLS sin políticas: solo se accede por las funciones (security definer).

create table if not exists public.asistencias (
  id uuid primary key default gen_random_uuid(),
  actividad_id uuid not null references public.actividades(id) on delete cascade,
  registro_id uuid not null references public.encuentro_registros(id) on delete cascade,
  marcado_por uuid references public.gestores(id),
  created_at timestamptz not null default now(),
  unique (actividad_id, registro_id)
);

create table if not exists public.indicadores (
  id uuid primary key default gen_random_uuid(),
  actividad_id uuid references public.actividades(id) on delete set null,
  dia date,
  clave text not null,
  valor numeric not null,
  unidad text,
  nota text,
  autor_id uuid references public.gestores(id),
  created_at timestamptz not null default now()
);

create table if not exists public.evidencias (
  id uuid primary key default gen_random_uuid(),
  actividad_id uuid references public.actividades(id) on delete cascade,
  foto_url text not null,
  nota text,
  autor_id uuid references public.gestores(id),
  created_at timestamptz not null default now()
);

create table if not exists public.encuesta_respuestas (
  registro_id uuid primary key references public.encuentro_registros(id) on delete cascade,
  calificacion int check (calificacion between 1 and 5),
  lo_mejor text,
  mejorar text,
  compromiso text,
  volveria boolean,
  created_at timestamptz not null default now()
);

alter table public.asistencias enable row level security;
alter table public.indicadores enable row level security;
alter table public.evidencias enable row level security;
alter table public.encuesta_respuestas enable row level security;
revoke all on public.asistencias, public.indicadores, public.evidencias, public.encuesta_respuestas from anon, authenticated;

-- Fotos de evidencia: mismo bucket, carpeta evidencias/
drop policy if exists "encuentro-fotos: subir evidencia" on storage.objects;
create policy "encuentro-fotos: subir evidencia" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'encuentro-fotos' and (storage.foldername(name))[1] = 'evidencias');

create or replace function public.gestor_guardar(p_token text, p_tabla text, p_datos jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  gid uuid := gestor_de_token(p_token);
  permitidas jsonb := '{
    "actividades": ["dia","inicio","fin","titulo","tipo","publica","descripcion","notas","sede","grupo","origen_url","destino_url","pendientes","reconocimientos","presupuesto","prioridad","estado","orden"],
    "actividad_responsables": ["actividad_id","persona","detalle","material","material_listo","equipo","orden"],
    "contactos": ["nombre","organizacion","rol","tipo","telefono","sede","notas"],
    "bitacora": ["actividad_id","tipo","gravedad","texto","foto_url","resuelto"],
    "avisos": ["texto","nivel","visible_hasta"],
    "indicadores": ["actividad_id","dia","clave","valor","unidad","nota"],
    "evidencias": ["actividad_id","foto_url","nota"]
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
    if p_tabla in ('bitacora', 'avisos', 'indicadores', 'evidencias') then ins_cols := ins_cols || 'autor_id, '; ins_vals := ins_vals || quote_literal(gid) || '::uuid, '; end if;
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
  if p_tabla not in ('actividades', 'actividad_responsables', 'contactos', 'bitacora', 'avisos', 'indicadores', 'evidencias') then raise exception 'Tabla no permitida'; end if;
  execute format('delete from %I where id = $1 returning to_jsonb(%I.*)', p_tabla, p_tabla) into antes using p_id;
  if antes is not null then
    insert into cambios (tabla, fila_id, accion, antes, gestor_id) values (p_tabla, p_id, 'borrar', antes, gid);
  end if;
end $$;

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
    'asistencias', coalesce((select jsonb_agg(jsonb_build_object('actividad_id', actividad_id, 'registro_id', registro_id)) from asistencias), '[]'::jsonb),
    'indicadores', coalesce((select jsonb_agg(to_jsonb(i) || jsonb_build_object('autor', (select nombre from gestores where id = i.autor_id)) order by i.created_at) from indicadores i), '[]'::jsonb),
    'evidencias', coalesce((select jsonb_agg(to_jsonb(e) order by e.created_at) from evidencias e), '[]'::jsonb),
    'encuesta', coalesce((select jsonb_agg(to_jsonb(q) - 'registro_id' order by q.created_at) from encuesta_respuestas q), '[]'::jsonb),
    'generado', now());
end $$;

-- Marcar o desmarcar asistencia de una persona en una actividad. Devuelve el total de la actividad.
create or replace function public.gestor_asistencia(p_token text, p_actividad uuid, p_registro uuid, p_presente boolean)
returns int language plpgsql security definer set search_path = public as $$
declare gid uuid := gestor_de_token(p_token);
begin
  if gid is null then raise exception 'Sesión vencida. Vuelve a entrar.'; end if;
  if p_presente then
    insert into asistencias (actividad_id, registro_id, marcado_por) values (p_actividad, p_registro, gid)
    on conflict (actividad_id, registro_id) do nothing;
  else
    delete from asistencias where actividad_id = p_actividad and registro_id = p_registro;
  end if;
  return (select count(*) from asistencias where actividad_id = p_actividad);
end $$;

-- Encuesta final (una por persona registrada; se puede corregir).
create or replace function public.encuentro_encuesta(p_token text, p_calificacion int, p_lo_mejor text, p_mejorar text, p_compromiso text, p_volveria boolean)
returns boolean language plpgsql security definer set search_path = public as $$
declare rid uuid;
begin
  select id into rid from encuentro_registros where token = p_token and estado = 'aprobado';
  if rid is null then return false; end if;
  insert into encuesta_respuestas (registro_id, calificacion, lo_mejor, mejorar, compromiso, volveria)
  values (rid, p_calificacion, left(p_lo_mejor, 1000), left(p_mejorar, 1000), left(p_compromiso, 1000), p_volveria)
  on conflict (registro_id) do update set calificacion = excluded.calificacion, lo_mejor = excluded.lo_mejor,
    mejorar = excluded.mejorar, compromiso = excluded.compromiso, volveria = excluded.volveria, created_at = now();
  return true;
end $$;

-- Mi registro, versión con actividades asistidas y encuesta.
create or replace function public.encuentro_mi_registro3(p_token text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('nombre', r.nombre, 'email', r.email, 'nodo', n.nombre, 'ciudad', r.ciudad, 'foto_url', r.foto_url,
    'estado', r.estado, 'grupo', r.grupo, 'confirmado_en', r.confirmado_en,
    'asistencias', coalesce((select jsonb_agg(jsonb_build_object('titulo', a.titulo, 'dia', a.dia) order by a.dia, a.inicio)
        from asistencias s join actividades a on a.id = s.actividad_id where s.registro_id = r.id), '[]'::jsonb),
    'encuesta', (select to_jsonb(q) - 'registro_id' from encuesta_respuestas q where q.registro_id = r.id))
  from encuentro_registros r join encuentro_nodos_lista n on n.id = r.nodo_id
  where r.token = p_token;
$$;

grant execute on function public.gestor_asistencia(text, uuid, uuid, boolean),
  public.encuentro_encuesta(text, int, text, text, text, boolean), public.encuentro_mi_registro3(text) to anon, authenticated;
