-- Carta compromiso con aceptación electrónica (firma electrónica simple).
-- Base: Código de Comercio arts. 89–93 (mensaje de datos, firma electrónica, atribución) y
-- Código Civil Federal arts. 1803 y 1834 bis (consentimiento y forma escrita por medios electrónicos).
-- Evidencia: versión y hash de la carta mostrada, casillas explícitas, nombre escrito (+ firma dibujada opcional),
-- fecha y hora del servidor, IP y user agent tomados de los encabezados HTTP (no los manda el navegador).
-- La evidencia no se puede modificar ni borrar (triggers) y queda encadenada por hash.
-- Aprobar un registro exige que exista la carta aceptada.
-- Correr en el SQL Editor de "Ecopil 2026" el mismo día que se publique el front.

create extension if not exists pgcrypto with schema extensions;

-- ---------- Versiones de la carta ----------
create table if not exists public.encuentro_cartas (
  version text primary key,
  titulo text not null,
  texto text not null,               -- plantilla; {{NOMBRE}} y {{FECHA}} se llenan al aceptar
  hash text not null,                -- sha256 de texto
  activa boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.encuentro_cartas enable row level security;
revoke all on public.encuentro_cartas from anon, authenticated;
create unique index if not exists encuentro_cartas_una_activa on public.encuentro_cartas (activa) where activa;

create or replace function public.encuentro_cartas_hash() returns trigger
language plpgsql set search_path = public, extensions as $$
begin
  if tg_op = 'UPDATE' and (new.texto is distinct from old.texto or new.version is distinct from old.version) then
    raise exception 'El texto de una versión publicada no se cambia: crea una versión nueva.';
  end if;
  new.hash := encode(extensions.digest(convert_to(new.texto, 'UTF8'), 'sha256'), 'hex');
  return new;
end $$;
drop trigger if exists encuentro_cartas_hash on public.encuentro_cartas;
create trigger encuentro_cartas_hash before insert or update on public.encuentro_cartas
  for each row execute function public.encuentro_cartas_hash();

insert into public.encuentro_cartas (version, titulo, texto, hash, activa) values (
'2026-v1',
'Carta compromiso del Encuentro 2026',
$carta$1. CARTA DE AUTORIZACIÓN DE USO DE DERECHOS DE IMAGEN

Apaxco, Estado de México, a {{FECHA}}.

Yo, {{NOMBRE}}, autorizo a Ecopil MX, así como a todas las marcas comerciales relacionadas con esta organización, a utilizar mi imagen y voz en cualquier material audiovisual o fotográfico como parte del contenido para redes sociales del evento denominado "Encuentro Nacional de Innovación Social y Liderazgo Ambiental 2026".

Esta autorización es por tiempo indefinido para las plataformas físicas y digitales que son parte de la Organización y sus aliados.

2. CARTA DE CONFIRMACIÓN DE ASISTENCIA Y DESLINDE PARA VOLUNTARIADO

Apaxco, Estado de México, a {{FECHA}}.

Yo, {{NOMBRE}}, reconozco que mi participación en el Encuentro Nacional de Innovación Social y Liderazgo Ambiental es completamente voluntaria, sin remuneración económica. Entiendo que las actividades a realizar pueden llevar ciertos riesgos inherentes y libero de toda responsabilidad legal, administrativa, de seguridad social o contable a la organización, sus directivos, empleados u otros colaboradores, voluntarios y marcas aliadas.

Soy consciente de la colaboración de diferentes patrocinadores y me comprometo a acatar las reglas, normas de seguridad y prohibiciones que se me den a conocer para dicho evento y mi alojamiento.

Mediante la aceptación de este documento, asumo plena y total responsabilidad de mis actos y de mi persona durante el Encuentro Nacional de Innovación Social y Liderazgo Ambiental 2026 de Ecopil MX en el estado de Hidalgo, del 17 al 21 de diciembre.

3. ACEPTACIÓN ELECTRÓNICA

Acepto este documento por medios electrónicos, con fundamento en los artículos 1803 y 1834 bis del Código Civil Federal y 89 a 93 del Código de Comercio. Mi nombre escrito y, en su caso, mi firma dibujada constituyen mi firma electrónica, con el mismo efecto que mi firma autógrafa en esta carta.$carta$,
'', true)
on conflict (version) do nothing;

-- ---------- Evidencia de aceptación (solo se inserta) ----------
create table if not exists public.encuentro_aceptaciones (
  folio bigint generated always as identity primary key,
  registro_id uuid not null references public.encuentro_registros(id) on delete restrict,
  carta_version text not null references public.encuentro_cartas(version),
  carta_hash text not null,          -- hash de la plantilla que vio la persona
  texto_mostrado text not null,      -- texto final con nombre y fecha
  documento_hash text not null,      -- sha256 de texto_mostrado
  nombre_escrito text not null check (length(trim(nombre_escrito)) >= 5),
  acepta_deslinde boolean not null check (acepta_deslinde),
  acepta_imagen boolean not null,
  es_menor boolean not null default false,
  tutor_nombre text,
  tutor_parentesco text,
  firma_png text check (firma_png is null or (firma_png like 'data:image/png;base64,%' and length(firma_png) < 300000)),
  firma_hash text,
  ip text,
  ip_cadena text,                    -- x-forwarded-for completo
  user_agent text,
  aceptada_en timestamptz not null default now(),
  hash_anterior text,
  evidencia_hash text not null,      -- sha256 de todos los campos + hash_anterior (cadena)
  unique (registro_id, carta_version),
  check (not es_menor or (length(trim(coalesce(tutor_nombre, ''))) >= 5 and length(trim(coalesce(tutor_parentesco, ''))) >= 3))
);
alter table public.encuentro_aceptaciones enable row level security; -- sin políticas: solo vía funciones
revoke all on public.encuentro_aceptaciones from anon, authenticated;

create or replace function public.encuentro_aceptaciones_inmutable() returns trigger
language plpgsql as $$
begin
  raise exception 'La evidencia de aceptación de la carta no se puede modificar ni borrar.';
end $$;
drop trigger if exists encuentro_aceptaciones_inmutable on public.encuentro_aceptaciones;
create trigger encuentro_aceptaciones_inmutable before update or delete on public.encuentro_aceptaciones
  for each row execute function public.encuentro_aceptaciones_inmutable();
drop trigger if exists encuentro_aceptaciones_no_truncate on public.encuentro_aceptaciones;
create trigger encuentro_aceptaciones_no_truncate before truncate on public.encuentro_aceptaciones
  for each statement execute function public.encuentro_aceptaciones_inmutable();

-- ---------- Bloqueo: no se aprueba sin carta ----------
create or replace function public.encuentro_exigir_carta() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.estado = 'aprobado' and old.estado is distinct from 'aprobado'
     and not exists (select 1 from encuentro_aceptaciones a where a.registro_id = new.id) then
    raise exception 'Falta que la persona acepte la carta compromiso en su enlace personal.';
  end if;
  return new;
end $$;
drop trigger if exists encuentro_exigir_carta on public.encuentro_registros;
create trigger encuentro_exigir_carta before update of estado on public.encuentro_registros
  for each row execute function public.encuentro_exigir_carta();

-- ---------- Funciones ----------
create or replace function public.encuentro_fecha_mx(t timestamptz) returns text
language sql stable as $$
  select to_char(t at time zone 'America/Mexico_City', 'DD') || ' de ' ||
    (array['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'])
      [extract(month from t at time zone 'America/Mexico_City')::int] ||
    ' de ' || to_char(t at time zone 'America/Mexico_City', 'YYYY') ||
    ', ' || to_char(t at time zone 'America/Mexico_City', 'HH24:MI:SS') || ' h (hora del centro de México)';
$$;

-- Carta vigente para mostrarla
create or replace function public.encuentro_carta()
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('version', version, 'titulo', titulo, 'texto', texto, 'hash', hash)
  from encuentro_cartas where activa;
$$;

create or replace function public.encuentro_carta_json(a public.encuentro_aceptaciones, p_nombre text)
returns jsonb language sql stable as $$
  select jsonb_build_object('folio', a.folio, 'registro', p_nombre, 'version', a.carta_version, 'carta_hash', a.carta_hash,
    'texto', a.texto_mostrado, 'documento_hash', a.documento_hash, 'nombre_escrito', a.nombre_escrito,
    'acepta_deslinde', a.acepta_deslinde, 'acepta_imagen', a.acepta_imagen, 'es_menor', a.es_menor,
    'tutor_nombre', a.tutor_nombre, 'tutor_parentesco', a.tutor_parentesco, 'firma_png', a.firma_png, 'firma_hash', a.firma_hash,
    'ip', a.ip, 'user_agent', a.user_agent, 'aceptada_en', a.aceptada_en, 'fecha_texto', encuentro_fecha_mx(a.aceptada_en),
    'hash_anterior', a.hash_anterior, 'evidencia_hash', a.evidencia_hash);
$$;

create or replace function public.encuentro_firmar_carta(
  p_token text, p_version text, p_hash text, p_nombre text,
  p_acepta_deslinde boolean, p_acepta_imagen boolean,
  p_menor boolean, p_tutor_nombre text, p_tutor_parentesco text, p_firma_png text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare
  r encuentro_registros; c encuentro_cartas; a encuentro_aceptaciones;
  h jsonb; v_ip_cadena text; v_ip text; v_ua text; v_ahora timestamptz := now();
  v_texto text; v_firmante text; v_prev text; v_firma_hash text; v_canon text;
begin
  select * into r from encuentro_registros where token = p_token;
  if r.id is null then raise exception 'Enlace no válido.'; end if;
  if r.estado = 'rechazado' then raise exception 'Este registro no fue aprobado.'; end if;

  select * into a from encuentro_aceptaciones where registro_id = r.id order by folio desc limit 1;
  if a.folio is not null then return encuentro_carta_json(a, r.nombre); end if;

  select * into c from encuentro_cartas where version = p_version and activa;
  if c.version is null then raise exception 'La carta cambió. Recarga la página para ver la versión vigente.'; end if;
  if p_hash is distinct from c.hash then raise exception 'El texto de la carta no coincide con la versión vigente. Recarga la página.'; end if;
  if not coalesce(p_acepta_deslinde, false) then raise exception 'Marca la casilla de aceptación de la carta.'; end if;
  if not coalesce(p_acepta_imagen, false) then raise exception 'Marca la casilla de autorización de imagen.'; end if;
  if length(trim(coalesce(p_nombre, ''))) < 5 then raise exception 'Escribe tu nombre completo.'; end if;
  if coalesce(p_menor, false) and (length(trim(coalesce(p_tutor_nombre, ''))) < 5 or length(trim(coalesce(p_tutor_parentesco, ''))) < 3) then
    raise exception 'Si eres menor de edad, la carta la acepta tu madre, padre o tutor: escribe su nombre y parentesco.';
  end if;

  h := coalesce(nullif(current_setting('request.headers', true), '')::jsonb, '{}'::jsonb);
  v_ip_cadena := h->>'x-forwarded-for';
  v_ip := coalesce(h->>'cf-connecting-ip', nullif(trim(split_part(coalesce(v_ip_cadena, ''), ',', 1)), ''), h->>'x-real-ip');
  v_ua := left(h->>'user-agent', 500);

  v_firmante := case when coalesce(p_menor, false)
    then trim(p_tutor_nombre) || ' (' || trim(p_tutor_parentesco) || '), en representación de ' || trim(p_nombre)
    else trim(p_nombre) end;
  v_texto := replace(replace(c.texto, '{{NOMBRE}}', v_firmante), '{{FECHA}}', encuentro_fecha_mx(v_ahora));
  v_firma_hash := case when p_firma_png is null then null else encode(digest(convert_to(p_firma_png, 'UTF8'), 'sha256'), 'hex') end;

  perform pg_advisory_xact_lock(hashtext('encuentro_aceptaciones'));
  select evidencia_hash into v_prev from encuentro_aceptaciones order by folio desc limit 1;

  v_canon := concat_ws('|', r.id::text, c.version, c.hash,
    encode(digest(convert_to(v_texto, 'UTF8'), 'sha256'), 'hex'), trim(p_nombre),
    'deslinde=true', 'imagen=true', 'menor=' || coalesce(p_menor, false)::text,
    coalesce(trim(p_tutor_nombre), ''), coalesce(trim(p_tutor_parentesco), ''), coalesce(v_firma_hash, ''),
    coalesce(v_ip, ''), coalesce(v_ua, ''), to_char(v_ahora at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'), coalesce(v_prev, ''));

  insert into encuentro_aceptaciones (registro_id, carta_version, carta_hash, texto_mostrado, documento_hash, nombre_escrito,
    acepta_deslinde, acepta_imagen, es_menor, tutor_nombre, tutor_parentesco, firma_png, firma_hash,
    ip, ip_cadena, user_agent, aceptada_en, hash_anterior, evidencia_hash)
  values (r.id, c.version, c.hash, v_texto, encode(digest(convert_to(v_texto, 'UTF8'), 'sha256'), 'hex'), trim(p_nombre),
    true, true, coalesce(p_menor, false), nullif(trim(p_tutor_nombre), ''), nullif(trim(p_tutor_parentesco), ''), p_firma_png, v_firma_hash,
    v_ip, v_ip_cadena, v_ua, v_ahora, v_prev, encode(digest(convert_to(v_canon, 'UTF8'), 'sha256'), 'hex'))
  returning * into a;
  return encuentro_carta_json(a, r.nombre);
end $$;

-- Comprobante del propio agente
create or replace function public.encuentro_mi_carta(p_token text)
returns jsonb language sql stable security definer set search_path = public as $$
  select encuentro_carta_json(a, r.nombre)
  from encuentro_registros r join encuentro_aceptaciones a on a.registro_id = r.id
  where r.token = p_token order by a.folio desc limit 1;
$$;

-- Staff: quién ya aceptó, y comprobante completo de una persona
create or replace function public.gestor_cartas(p_token text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if gestor_de_token(p_token) is null then raise exception 'Sesión vencida. Vuelve a entrar.'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('registro_id', registro_id, 'folio', folio, 'aceptada_en', aceptada_en, 'es_menor', es_menor))
    from encuentro_aceptaciones), '[]'::jsonb);
end $$;

create or replace function public.gestor_carta_comprobante(p_token text, p_registro uuid)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if gestor_de_token(p_token) is null then raise exception 'Sesión vencida. Vuelve a entrar.'; end if;
  return (select encuentro_carta_json(a, r.nombre) from encuentro_aceptaciones a join encuentro_registros r on r.id = a.registro_id
          where a.registro_id = p_registro order by a.folio desc limit 1);
end $$;

-- Verificar que la cadena de hashes no se rompió (para auditoría; correr en el SQL Editor).
create or replace function public.encuentro_verificar_cadena()
returns table (folio bigint, ok boolean) language sql stable set search_path = public as $$
  select a.folio, a.hash_anterior is not distinct from lag(a.evidencia_hash) over (order by a.folio)
  from encuentro_aceptaciones a order by a.folio;
$$;

revoke execute on function public.encuentro_verificar_cadena() from public, anon, authenticated;
revoke execute on function public.encuentro_carta_json(public.encuentro_aceptaciones, text) from public, anon, authenticated;
grant execute on function public.encuentro_carta(), public.encuentro_mi_carta(text),
  public.encuentro_firmar_carta(text, text, text, text, boolean, boolean, boolean, text, text, text),
  public.gestor_cartas(text), public.gestor_carta_comprobante(text, uuid) to anon, authenticated;
