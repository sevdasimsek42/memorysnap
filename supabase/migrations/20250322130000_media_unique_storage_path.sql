-- Aynı depo yolu iki kez kayıtlanmasın (finalize tekrarı)
create unique index if not exists media_event_file_url_unique
  on public.media (event_id, file_url);
