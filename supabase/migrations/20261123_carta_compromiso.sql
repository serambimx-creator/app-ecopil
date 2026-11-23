-- Carta compromiso (aviso de privacidad, reglamento, riesgos, imagen opcional, menores) con aceptación electrónica
-- (firma electrónica simple) y ficha médica.
-- Correo de privacidad: ecopilgo@gmail.com
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
  texto text not null,               -- plantilla; {{NOMBRE}}, {{FECHA}} e {{IMAGEN}} se llenan al aceptar
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
  if new.texto like '%{{CORREO_' || 'PRIVACIDAD}}%' then
    raise exception 'Falta poner el correo de privacidad en el texto de la carta (busca CORREO_PRIVACIDAD).';
  end if;
  new.hash := encode(extensions.digest(convert_to(new.texto, 'UTF8'), 'sha256'), 'hex');
  return new;
end $$;
drop trigger if exists encuentro_cartas_hash on public.encuentro_cartas;
create trigger encuentro_cartas_hash before insert or update on public.encuentro_cartas
  for each row execute function public.encuentro_cartas_hash();

insert into public.encuentro_cartas (version, titulo, texto, hash, activa) values (
'2026-v1',
'Carta compromiso, reglamento y aviso de privacidad · Encuentro 2026',
$carta$1. AVISO DE PRIVACIDAD SIMPLIFICADO

Ecopil Arte Crea Conciencia A.C. ("Ecopil MX"), con domicilio en Apaxco de Ocampo, Estado de México, es responsable de los datos personales que proporcionas para el Encuentro Nacional de Innovación Social y Liderazgo Ambiental 2026.

Datos que tratamos: nombre, correo, teléfono, nodo y ciudad, fotografía de perfil, contacto de emergencia, la evidencia de esta aceptación (fecha y hora, dirección IP y navegador) y, si los compartes, datos de salud (alergias, padecimientos, medicamentos, tipo de sangre y seguro médico), que son datos sensibles.

Finalidades necesarias: registrar y validar tu participación, organizar grupos, comidas, hospedaje y traslados, pasar lista, avisar a tu contacto de emergencia y darte atención en caso de una emergencia médica, y conservar la evidencia de esta carta. Finalidad opcional: difundir el Encuentro con tu imagen y voz, solo si lo autorizas en el punto 4.

Tus datos de salud solo los consulta el staff del nodo anfitrión y, en una emergencia, el personal médico que te atienda. No vendemos tus datos ni los transferimos a terceros, salvo a servicios médicos o autoridades cuando sea necesario para protegerte o lo exija la ley.

Conservamos los datos de logística y salud hasta 6 meses después del Encuentro y la evidencia de esta carta mientras pueda servir para aclarar cualquier controversia. Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición, o revocar tu consentimiento, escribiendo a ecopilgo@gmail.com.

2. REGLAMENTO DE PARTICIPACIÓN

Me comprometo a: respetar los horarios, sedes y grupos asignados; seguir las indicaciones del staff, de guías y de anfitriones; no separarme de mi grupo sin avisar; tratar con respeto a todas las personas, sin discriminación ni acoso de ningún tipo; no consumir bebidas alcohólicas ni sustancias ilícitas durante las actividades y traslados; cuidar los espacios naturales, no dejar residuos y no extraer flora ni fauna; y cuidar las instalaciones y el equipo que se me presten.

Entiendo que, si incumplo este reglamento de forma grave, la organización puede retirarme de las actividades, y que en ese caso mi regreso corre por mi cuenta.

3. CONFIRMACIÓN DE ASISTENCIA Y ACEPTACIÓN DE RIESGOS

Yo, {{NOMBRE}}, confirmo que participo de forma voluntaria y sin remuneración en el Encuentro Nacional de Innovación Social y Liderazgo Ambiental 2026, que Ecopil MX realiza en el estado de Hidalgo del 17 al 21 de diciembre de 2026.

Conozco que el programa incluye actividades al aire libre, como caminatas en terreno irregular, visitas a cascadas y cuerpos de agua, actividades de restauración con herramientas y traslados en vehículo, además de actividades extra opcionales (acampada y observación de aves), y que estas tienen riesgos propios: caídas, golpes, cortaduras, picaduras, exposición al sol, al frío o a la lluvia, y contacto con fauna y flora silvestre. Acepto esos riesgos inherentes y me comprometo a usar el equipo y la ropa recomendados.

Declaro que mi estado de salud me permite participar y que informé en la ficha médica cualquier condición relevante. En caso de emergencia, autorizo al staff a llamar a mi contacto de emergencia y a solicitar atención médica para mí. Los gastos médicos que no cubra un seguro corren por mi cuenta.

Respondo por mis actos y por los daños que cause por no seguir el reglamento o las indicaciones de seguridad. Esta aceptación no libera a la organización de la responsabilidad que le corresponda por dolo o negligencia, ni limita los derechos que la ley no permite renunciar.

4. AUTORIZACIÓN DE USO DE IMAGEN Y VOZ (OPCIONAL)

{{IMAGEN}} a Ecopil MX a usar, sin pago, fotografías, videos y audio en los que aparezca, tomados durante el Encuentro, para difundir y documentar el Encuentro y el trabajo de Ecopil MX en sus redes sociales, sitio web, informes y materiales impresos, y para que los aliados y patrocinadores del Encuentro los publiquen en sus propios canales con la misma finalidad, siempre citando el Encuentro. No se usarán para anunciar productos o servicios de terceros.

La autorización dura 5 años a partir de la fecha de aceptación. Puedo revocarla en cualquier momento escribiendo a ecopilgo@gmail.com; la revocación aplica a usos nuevos y no obliga a retirar materiales impresos o publicaciones anteriores a ella. Si no autorizo, el staff procurará no publicar imágenes en las que se me identifique.

5. PERSONAS MENORES DE EDAD

Si quien participa es menor de 18 años, quien acepta esta carta es su madre, padre o tutor, que declara tener la patria potestad o tutela, autoriza su participación en todas las actividades descritas, asume las obligaciones de esta carta en su representación y se compromete a entregar la carta firmada en papel al llegar al Encuentro.

6. ACEPTACIÓN ELECTRÓNICA

Acepto este documento por medios electrónicos, con fundamento en los artículos 1803 y 1834 bis del Código Civil Federal y 89 a 93 del Código de Comercio. Mi nombre escrito y, en su caso, mi firma dibujada constituyen mi firma electrónica, con el mismo efecto que mi firma autógrafa. Fecha y hora de aceptación: {{FECHA}}.$carta$,
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
  acepta_imagen boolean not null,     -- opcional: puede ser false
  acepta_privacidad boolean not null check (acepta_privacidad),
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
    'acepta_deslinde', a.acepta_deslinde, 'acepta_imagen', a.acepta_imagen, 'acepta_privacidad', a.acepta_privacidad, 'es_menor', a.es_menor,
    'tutor_nombre', a.tutor_nombre, 'tutor_parentesco', a.tutor_parentesco, 'firma_png', a.firma_png, 'firma_hash', a.firma_hash,
    'ip', a.ip, 'user_agent', a.user_agent, 'aceptada_en', a.aceptada_en, 'fecha_texto', encuentro_fecha_mx(a.aceptada_en),
    'hash_anterior', a.hash_anterior, 'evidencia_hash', a.evidencia_hash);
$$;

create or replace function public.encuentro_firmar_carta(
  p_token text, p_version text, p_hash text, p_nombre text,
  p_acepta_deslinde boolean, p_acepta_imagen boolean, p_acepta_privacidad boolean,
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
  if not coalesce(p_acepta_privacidad, false) then raise exception 'Marca la casilla del aviso de privacidad.'; end if;
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
  v_texto := replace(replace(replace(c.texto, '{{NOMBRE}}', v_firmante), '{{FECHA}}', encuentro_fecha_mx(v_ahora)),
    '{{IMAGEN}}', case when coalesce(p_acepta_imagen, false) then 'SÍ AUTORIZO' else 'NO AUTORIZO' end);
  v_firma_hash := case when p_firma_png is null then null else encode(digest(convert_to(p_firma_png, 'UTF8'), 'sha256'), 'hex') end;

  perform pg_advisory_xact_lock(hashtext('encuentro_aceptaciones'));
  select evidencia_hash into v_prev from encuentro_aceptaciones order by folio desc limit 1;

  v_canon := concat_ws('|', r.id::text, c.version, c.hash,
    encode(digest(convert_to(v_texto, 'UTF8'), 'sha256'), 'hex'), trim(p_nombre),
    'deslinde=true', 'privacidad=true', 'imagen=' || coalesce(p_acepta_imagen, false)::text, 'menor=' || coalesce(p_menor, false)::text,
    coalesce(trim(p_tutor_nombre), ''), coalesce(trim(p_tutor_parentesco), ''), coalesce(v_firma_hash, ''),
    coalesce(v_ip, ''), coalesce(v_ua, ''), to_char(v_ahora at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'), coalesce(v_prev, ''));

  insert into encuentro_aceptaciones (registro_id, carta_version, carta_hash, texto_mostrado, documento_hash, nombre_escrito,
    acepta_deslinde, acepta_imagen, acepta_privacidad, es_menor, tutor_nombre, tutor_parentesco, firma_png, firma_hash,
    ip, ip_cadena, user_agent, aceptada_en, hash_anterior, evidencia_hash)
  values (r.id, c.version, c.hash, v_texto, encode(digest(convert_to(v_texto, 'UTF8'), 'sha256'), 'hex'), trim(p_nombre),
    true, coalesce(p_acepta_imagen, false), true, coalesce(p_menor, false), nullif(trim(p_tutor_nombre), ''), nullif(trim(p_tutor_parentesco), ''), p_firma_png, v_firma_hash,
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

-- ---------- Ficha médica (datos sensibles; se puede actualizar) ----------
create table if not exists public.encuentro_fichas_medicas (
  registro_id uuid primary key references public.encuentro_registros(id) on delete cascade,
  alergias text, padecimientos text, medicamentos text, tipo_sangre text, seguro text, notas text,
  consentimiento_en timestamptz not null default now(),   -- consentimiento expreso para datos de salud
  updated_at timestamptz not null default now()
);
alter table public.encuentro_fichas_medicas enable row level security;
revoke all on public.encuentro_fichas_medicas from anon, authenticated;

create or replace function public.encuentro_guardar_ficha(p_token text, p_consiento boolean,
  p_alergias text, p_padecimientos text, p_medicamentos text, p_tipo_sangre text, p_seguro text, p_notas text)
returns boolean language plpgsql security definer set search_path = public as $$
declare rid uuid;
begin
  select id into rid from encuentro_registros where token = p_token;
  if rid is null then raise exception 'Enlace no válido.'; end if;
  if not coalesce(p_consiento, false) then raise exception 'Para guardar datos de salud necesitamos tu consentimiento expreso.'; end if;
  insert into encuentro_fichas_medicas as f (registro_id, alergias, padecimientos, medicamentos, tipo_sangre, seguro, notas)
  values (rid, left(nullif(trim(p_alergias), ''), 500), left(nullif(trim(p_padecimientos), ''), 500), left(nullif(trim(p_medicamentos), ''), 500),
          left(nullif(trim(p_tipo_sangre), ''), 10), left(nullif(trim(p_seguro), ''), 200), left(nullif(trim(p_notas), ''), 500))
  on conflict (registro_id) do update set alergias = excluded.alergias, padecimientos = excluded.padecimientos, medicamentos = excluded.medicamentos,
    tipo_sangre = excluded.tipo_sangre, seguro = excluded.seguro, notas = excluded.notas, updated_at = now();
  return true;
end $$;

create or replace function public.encuentro_mi_ficha(p_token text)
returns jsonb language sql stable security definer set search_path = public as $$
  select to_jsonb(f) - 'registro_id' from encuentro_fichas_medicas f join encuentro_registros r on r.id = f.registro_id where r.token = p_token;
$$;

-- ---------- Actividades extra opcionales: temazcal, acampada y pajareada ----------
create table if not exists public.encuentro_extras (
  registro_id uuid primary key references public.encuentro_registros(id) on delete cascade,
  temazcal boolean not null,
  acampada boolean not null,
  pajareada boolean not null,
  updated_at timestamptz not null default now()
);
alter table public.encuentro_extras enable row level security;
revoke all on public.encuentro_extras from anon, authenticated;

-- Quien dijo que sí al temazcal entra a la lista (cupo 20) en cuanto está aprobado, por orden de llegada.
create or replace function public.encuentro_sync_temazcal(p_registro uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform pg_advisory_xact_lock(hashtext('temazcal_lista'));
  if exists (select 1 from encuentro_registros r join encuentro_extras e on e.registro_id = r.id
             where r.id = p_registro and r.estado = 'aprobado' and e.temazcal)
     and (select count(*) from temazcal_lista) < 20 then
    insert into temazcal_lista (registro_id) values (p_registro) on conflict do nothing;
  end if;
end $$;
revoke execute on function public.encuentro_sync_temazcal(uuid) from public, anon, authenticated;

create or replace function public.encuentro_extras_al_aprobar() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.estado = 'aprobado' and old.estado is distinct from 'aprobado' then perform encuentro_sync_temazcal(new.id); end if;
  return new;
end $$;
drop trigger if exists encuentro_extras_al_aprobar on public.encuentro_registros;
create trigger encuentro_extras_al_aprobar after update of estado on public.encuentro_registros
  for each row execute function public.encuentro_extras_al_aprobar();

create or replace function public.encuentro_guardar_extras(p_token text, p_temazcal boolean, p_acampada boolean, p_pajareada boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
declare rid uuid;
begin
  select id into rid from encuentro_registros where token = p_token and estado <> 'rechazado';
  if rid is null then raise exception 'Enlace no válido.'; end if;
  if p_temazcal is null or p_acampada is null or p_pajareada is null then raise exception 'Responde sí o no a cada actividad extra.'; end if;
  insert into encuentro_extras (registro_id, temazcal, acampada, pajareada) values (rid, p_temazcal, p_acampada, p_pajareada)
  on conflict (registro_id) do update set temazcal = excluded.temazcal, acampada = excluded.acampada, pajareada = excluded.pajareada, updated_at = now();
  if p_temazcal then perform encuentro_sync_temazcal(rid); else delete from temazcal_lista where registro_id = rid; end if;
  return encuentro_mis_extras(p_token);
end $$;

create or replace function public.encuentro_mis_extras(p_token text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('temazcal', e.temazcal, 'acampada', e.acampada, 'pajareada', e.pajareada,
    'temazcal_lugar', exists (select 1 from temazcal_lista t where t.registro_id = r.id))
  from encuentro_registros r join encuentro_extras e on e.registro_id = r.id where r.token = p_token;
$$;

-- Staff: carta (folio, menor, imagen) y ficha médica por asistente
create or replace function public.gestor_cartas(p_token text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if gestor_de_token(p_token) is null then raise exception 'Sesión vencida. Vuelve a entrar.'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('registro_id', r.id, 'folio', a.folio, 'aceptada_en', a.aceptada_en,
      'es_menor', a.es_menor, 'acepta_imagen', a.acepta_imagen, 'ficha', to_jsonb(f) - 'registro_id',
      'extras', to_jsonb(e) - 'registro_id'))
    from encuentro_registros r
    left join lateral (select * from encuentro_aceptaciones x where x.registro_id = r.id order by folio desc limit 1) a on true
    left join encuentro_fichas_medicas f on f.registro_id = r.id
    left join encuentro_extras e on e.registro_id = r.id
    where a.folio is not null or f.registro_id is not null or e.registro_id is not null), '[]'::jsonb);
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
  public.encuentro_firmar_carta(text, text, text, text, boolean, boolean, boolean, boolean, text, text, text),
  public.gestor_cartas(text), public.gestor_carta_comprobante(text, uuid),
  public.encuentro_guardar_ficha(text, boolean, text, text, text, text, text, text), public.encuentro_mi_ficha(text),
  public.encuentro_guardar_extras(text, boolean, boolean, boolean), public.encuentro_mis_extras(text) to anon, authenticated;

-- ---------- Acceso: solo agentes validados (o gestores) ven programa, guía y mapa ----------
-- Estado de acceso para la app: 'gestor', 'aprobado', 'pendiente', 'rechazado' o null (sin registro).
create or replace function public.encuentro_acceso(p_token text, p_gestor text)
returns text language sql stable security definer set search_path = public as $$
  select case
    when p_gestor is not null and gestor_de_token(p_gestor) is not null then 'gestor'
    else (select estado from encuentro_registros where token = p_token) end;
$$;

-- Programa y avisos: ya no son públicos. Mismo contenido que encuentro_publico(), solo con acceso.
create or replace function public.encuentro_publico2(p_token text, p_gestor text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if encuentro_acceso(p_token, p_gestor) not in ('gestor', 'aprobado') then return null; end if;
  return encuentro_publico();
end $$;

revoke execute on function public.encuentro_publico() from public, anon, authenticated;
grant execute on function public.encuentro_acceso(text, text), public.encuentro_publico2(text, text) to anon, authenticated;

-- Si el agente aparta o libera su lugar del temazcal desde la tarjeta del programa, se refleja en sus extras.
create or replace function public.encuentro_temazcal_a_extras() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update encuentro_extras set temazcal = (tg_op = 'INSERT'), updated_at = now()
   where registro_id = coalesce(new.registro_id, old.registro_id) and temazcal is distinct from (tg_op = 'INSERT');
  return null;
end $$;
drop trigger if exists encuentro_temazcal_a_extras on public.temazcal_lista;
create trigger encuentro_temazcal_a_extras after insert or delete on public.temazcal_lista
  for each row execute function public.encuentro_temazcal_a_extras();
