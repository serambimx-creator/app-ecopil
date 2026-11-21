-- Lista de interesados en el temazcal del 20 dic (cupo 20). Solo agentes con registro aprobado.
create table if not exists public.temazcal_lista (
  registro_id uuid primary key references public.encuentro_registros(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.temazcal_lista enable row level security;
revoke all on public.temazcal_lista from anon, authenticated;

-- p_quiero: null = solo consultar, true = apuntarse, false = liberar el lugar.
create or replace function public.encuentro_temazcal(p_token text, p_quiero boolean default null)
returns jsonb language plpgsql security definer set search_path = public as $$
declare rid uuid; cupo constant int := 20; n int; lleno boolean := false;
begin
  select id into rid from encuentro_registros where token = p_token and estado = 'aprobado';
  if rid is null then return null; end if;
  if p_quiero is not null then
    perform pg_advisory_xact_lock(hashtext('temazcal_lista'));
    if p_quiero then
      if not exists (select 1 from temazcal_lista where registro_id = rid) then
        if (select count(*) from temazcal_lista) >= cupo then lleno := true;
        else insert into temazcal_lista (registro_id) values (rid); end if;
      end if;
    else
      delete from temazcal_lista where registro_id = rid;
    end if;
  end if;
  select count(*) into n from temazcal_lista;
  return jsonb_build_object('apuntado', exists (select 1 from temazcal_lista where registro_id = rid),
    'ocupados', n, 'cupo', cupo, 'lleno', lleno);
end $$;

create or replace function public.gestor_temazcal(p_token text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  if gestor_de_token(p_token) is null then return null; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('nombre', r.nombre, 'nodo', n.nombre, 'telefono', r.telefono, 'created_at', t.created_at) order by t.created_at)
    from temazcal_lista t join encuentro_registros r on r.id = t.registro_id join encuentro_nodos_lista n on n.id = r.nodo_id), '[]'::jsonb);
end $$;

grant execute on function public.encuentro_temazcal(text, boolean), public.gestor_temazcal(text) to anon, authenticated;
