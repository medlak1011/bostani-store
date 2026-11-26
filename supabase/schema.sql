-- BOSTANI (pruning saw) orders. Same Supabase project as DAFA, separate table.
create extension if not exists pgcrypto;

create table if not exists public.saw_orders (
  id            uuid primary key default gen_random_uuid(),
  order_number  text unique not null,
  submission_id uuid unique,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  full_name     text not null,
  phone         text not null,
  city          text not null,
  address       text not null,
  quantity      int  not null check (quantity between 1 and 10),
  subtotal      int  not null,
  shipping      int  not null default 0,
  total         int  not null,
  status        text not null default 'new'
                check (status in ('new','contacted','confirmed','preparing','shipped','delivered','cancelled','returned')),
  notes         text,
  source        jsonb not null default '{}'::jsonb,
  ip_hash       text,
  user_agent    text
);
create index if not exists saw_orders_created_idx on public.saw_orders (created_at desc);
create index if not exists saw_orders_phone_idx   on public.saw_orders (phone);
create index if not exists saw_orders_ip_idx      on public.saw_orders (ip_hash, created_at desc);

alter table public.saw_orders enable row level security;
revoke all on public.saw_orders from anon, authenticated;
