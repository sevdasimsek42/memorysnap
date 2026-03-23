-- Storage: private `media` bucket + RLS (T1.6)
-- Yol formatı: {event_id}/{dosyaAdı}

insert into storage.buckets (id, name, public)
values ('media', 'media', false)
on conflict (id) do nothing;

-- Mevcut politikaları temizlemek için (ilk kurulumda yoktur)
drop policy if exists "media_storage_select_host" on storage.objects;
drop policy if exists "media_storage_insert_host" on storage.objects;
drop policy if exists "media_storage_update_host" on storage.objects;
drop policy if exists "media_storage_delete_host" on storage.objects;

-- İlk klasör segmenti = event id; yalnızca etkinlik sahibi
create policy "media_storage_select_host"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'media'
    and (string_to_array(name, '/'))[1] in (
      select e.id::text from public.events e where e.host_id = auth.uid()
    )
  );

create policy "media_storage_insert_host"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'media'
    and (string_to_array(name, '/'))[1] in (
      select e.id::text from public.events e where e.host_id = auth.uid()
    )
  );

create policy "media_storage_update_host"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'media'
    and (string_to_array(name, '/'))[1] in (
      select e.id::text from public.events e where e.host_id = auth.uid()
    )
  );

create policy "media_storage_delete_host"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'media'
    and (string_to_array(name, '/'))[1] in (
      select e.id::text from public.events e where e.host_id = auth.uid()
    )
  );
