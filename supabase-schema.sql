create extension if not exists pgcrypto;

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  public_id text unique not null,
  name text not null,
  phone text not null,
  booking_date date not null,
  booking_time text not null,
  players integer not null check (players >= 10),
  notes text,
  deposit_amount numeric not null check (deposit_amount >= 0),
  game_price numeric not null check (game_price >= 0),
  status text not null default 'pending',
  payment_id text,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unique (booking_date, booking_time)
);

create index if not exists reservations_date_idx
  on public.reservations(booking_date);
