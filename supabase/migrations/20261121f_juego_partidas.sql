-- Puntajes del juego de Mixtli para agentes registrados (concurso de regalos del cierre).
-- El navegador no manda la duración: el servidor la mide entre juego_iniciar y juego_terminar,
-- y rechaza puntajes imposibles para ese tiempo. Los no registrados juegan sin guardar.

create table if not exists public.juego_partidas (
  id uuid primary key default gen_random_uuid(),
  registro_id uuid not null references public.encuentro_registros(id) on delete cascade,
  inicio timestamptz not null default now(),
  fin timestamptz,
  pesos int,
  metros int,
  aciertos int,
  con_preguntas boolean,
  -- Puntaje del concurso: Ecopil pesos + 10 por respuesta correcta + 1 por cada 100 m
  puntos int generated always as (coalesce(pesos, 0) + 10 * coalesce(aciertos, 0) + coalesce(metros, 0) / 100) stored,
  sospechosa boolean not null default false
);
create index if not exists juego_partidas_registro on public.juego_partidas (registro_id, inicio desc);
alter table public.juego_partidas enable row level security;
revoke all on public.juego_partidas from anon, authenticated;

-- Empieza una partida. Devuelve id, nombre y mejor puntaje; null si el token no sirve.
create or replace function public.juego_iniciar(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r record; pid uuid;
begin
  select id, nombre into r from encuentro_registros where token = p_token and estado <> 'rechazado';
  if r.id is null then return null; end if;
  -- límites: una partida cada 3 s y 400 por día
  if exists (select 1 from juego_partidas where registro_id = r.id and inicio > now() - interval '3 seconds')
     or (select count(*) from juego_partidas where registro_id = r.id and inicio > now() - interval '1 day') >= 400 then
    return jsonb_build_object('error', 'Demasiadas partidas seguidas, espera un momento.');
  end if;
  insert into juego_partidas (registro_id) values (r.id) returning id into pid;
  return jsonb_build_object('partida', pid, 'nombre', r.nombre,
    'mejor', coalesce((select max(puntos) from juego_partidas where registro_id = r.id and not sospechosa), 0));
end $$;

-- Cierra la partida con su resultado. Devuelve el mejor puntaje válido de la persona.
create or replace function public.juego_terminar(p_token text, p_partida uuid, p_pesos int, p_metros int, p_aciertos int, p_con_preguntas boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
declare rid uuid; ini timestamptz; seg numeric; mala boolean;
begin
  select id into rid from encuentro_registros where token = p_token and estado <> 'rechazado';
  if rid is null then return null; end if;
  select inicio into ini from juego_partidas where id = p_partida and registro_id = rid and fin is null;
  if ini is null then return jsonb_build_object('error', 'Partida no válida'); end if;
  seg := extract(epoch from now() - ini);
  -- Topes generosos: monedas ≈ 5/s a velocidad máxima, +5 por acierto (una pregunta cada 15 s),
  -- velocidad máxima ≈ 60 m/s, 20 preguntas en total.
  mala := p_pesos < 0 or p_metros < 0 or p_aciertos < 0 or p_aciertos > 20
       or p_aciertos > floor(seg / 15) + 1
       or p_pesos > seg * 6 + p_aciertos * 5 + 10
       or p_metros > seg * 65 + 10
       or seg > 3 * 3600;
  update juego_partidas set fin = now(), pesos = p_pesos, metros = p_metros, aciertos = p_aciertos,
    con_preguntas = p_con_preguntas, sospechosa = mala where id = p_partida;
  return jsonb_build_object('mejor', coalesce((select max(puntos) from juego_partidas where registro_id = rid and not sospechosa), 0),
    'valida', not mala);
end $$;

-- Ranking para el staff: mejor partida válida por persona, con datos para verificarla.
create or replace function public.gestor_juego(p_token text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if gestor_de_token(p_token) is null then return null; end if;
  return coalesce((select jsonb_agg(x order by (x->>'puntos')::int desc, x->>'fin') from (
    select jsonb_build_object('registro_id', r.id, 'nombre', r.nombre, 'nodo', n.nombre, 'estado', r.estado,
      'puntos', b.puntos, 'pesos', b.pesos, 'metros', b.metros, 'aciertos', b.aciertos, 'con_preguntas', b.con_preguntas,
      'segundos', round(extract(epoch from b.fin - b.inicio)), 'fin', b.fin,
      'partidas', (select count(*) from juego_partidas p where p.registro_id = r.id and p.fin is not null),
      'sospechosas', (select count(*) from juego_partidas p where p.registro_id = r.id and p.sospechosa)) x
    from encuentro_registros r join encuentro_nodos_lista n on n.id = r.nodo_id
    cross join lateral (select * from juego_partidas p where p.registro_id = r.id and p.fin is not null and not p.sospechosa
      order by p.puntos desc, p.fin limit 1) b) t), '[]'::jsonb);
end $$;

grant execute on function public.juego_iniciar(text), public.juego_terminar(text, uuid, int, int, int, boolean),
  public.gestor_juego(text) to anon, authenticated;
