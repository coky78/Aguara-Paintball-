create table if not exists public.home_promotion (
  id integer primary key default 1,
  enabled boolean not null default false,
  title text not null default '',
  text_content text not null default '',
  event_date text not null default '',
  cta_text text not null default '',
  cta_url text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.home_promotion enable row level security;

drop policy if exists "public can read enabled promotion" on public.home_promotion;
create policy "public can read enabled promotion"
  on public.home_promotion for select
  to anon, authenticated
  using (enabled = true);

insert into public.home_promotion (id, enabled, title, text_content, event_date, cta_text, cta_url)
values (1, false, '', '', '', '', '')
on conflict (id) do nothing;
