create table movimientos (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  concepto text not null,
  tipo text not null check (tipo in ('ingreso','gasto')),
  ambito text not null default 'emprendimiento' check (ambito in ('emprendimiento','personal')),
  monto numeric not null,
  fecha date not null default current_date
);
alter table movimientos enable row level security;
create policy "solo mis movimientos" on movimientos for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Si ya habias creado la tabla antes, ejecuta solo esta linea:
-- alter table movimientos add column ambito text not null default 'emprendimiento';
