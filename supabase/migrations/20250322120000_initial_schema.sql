-- MemorySnap: events + media, RLS (T1.4, T1.5)
-- Supabase SQL Editor veya: supabase db push

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- events
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  event_date date,
  cover_image_url text,
  template_id text,
  template_config jsonb,
  slug text not null unique,
  is_active boolean not null default true,
  requires_moderation boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists events_host_id_idx on public.events (host_id);
create index if not exists events_slug_idx on public.events (slug);

-- ---------------------------------------------------------------------------
-- media
-- ---------------------------------------------------------------------------
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  uploader_name text,
  file_url text not null,
  file_type text check (file_type in ('image', 'video')),
  file_size integer,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  moderation_score double precision,
  uploaded_at timestamptz not null default now()
);

create index if not exists media_event_id_idx on public.media (event_id);
create index if not exists media_status_idx on public.media (status);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.events enable row level security;
alter table public.media enable row level security;

-- events: yalnızca sahibi
create policy "events_select_own"
  on public.events for select
  to authenticated
  using (auth.uid() = host_id);

create policy "events_insert_own"
  on public.events for insert
  to authenticated
  with check (auth.uid() = host_id);

create policy "events_update_own"
  on public.events for update
  to authenticated
  using (auth.uid() = host_id)
  with check (auth.uid() = host_id);

create policy "events_delete_own"
  on public.events for delete
  to authenticated
  using (auth.uid() = host_id);

-- Not: Anon doğrudan events tablosunu tarayamaz; slug ile okuma için aşağıdaki RPC kullanılır.

-- media: host kendi etkinliğinin medyasını yönetir
create policy "media_select_host"
  on public.media for select
  to authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = media.event_id and e.host_id = auth.uid()
    )
  );

-- Misafir yükleme: aktif etkinlik varsa insert (detay doğrulama API'de)
create policy "media_insert_guest"
  on public.media for insert
  to anon, authenticated
  with check (
    exists (
      select 1 from public.events e
      where e.id = media.event_id and e.is_active = true
    )
  );

create policy "media_update_host"
  on public.media for update
  to authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = media.event_id and e.host_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.events e
      where e.id = media.event_id and e.host_id = auth.uid()
    )
  );

create policy "media_delete_host"
  on public.media for delete
  to authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = media.event_id and e.host_id = auth.uid()
    )
  );

-- Misafir galerisi için ayrı RPC veya API eklenecek (anon tüm onaylı medyayı göremesin diye kapalı)

-- ---------------------------------------------------------------------------
-- QR / misafir: yalnızca slug ile sınırlı etkinlik bilgisi (SECURITY DEFINER)
-- ---------------------------------------------------------------------------
create or replace function public.get_public_event_by_slug(p_slug text)
returns table (
  id uuid,
  title text,
  description text,
  slug text,
  event_date date,
  requires_moderation boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    e.id,
    e.title,
    e.description,
    e.slug,
    e.event_date,
    e.requires_moderation
  from public.events e
  where e.slug = p_slug and e.is_active = true
  limit 1;
$$;

grant execute on function public.get_public_event_by_slug(text) to anon, authenticated;
