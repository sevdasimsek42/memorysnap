# MemorySnap

Misafirlerin QR ile fotoğraf/video yüklediği, etkinlik sahibinin panelden yönettiği Next.js + Supabase uygulaması.

## Gereksinimler

- Node.js 18+
- [Supabase](https://supabase.com) projesi
- (İsteğe bağlı) [Google Cloud Vision](https://cloud.google.com/vision) API anahtarı — otomatik güvenli arama için

## Kurulum

```bash
cd memorysnap
npm install
```

Kök dizinde `.env.local` oluşturun (`.env.example` referans):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — misafir yükleme ve finalize için **zorunlu**
- `NEXT_PUBLIC_SITE_URL` — örn. `http://localhost:3000` (QR ve e-posta yönlendirmeleri)
- `GOOGLE_VISION_API_KEY` — görseller için SafeSearch; yoksa görseller “pending” kalır

## Veritabanı

Supabase SQL Editor’da sırayla çalıştırın:

1. `supabase/migrations/20250322120000_initial_schema.sql`
2. `supabase/migrations/20250322120001_storage_media_bucket.sql`
3. `supabase/migrations/20250322130000_media_unique_storage_path.sql`

**Authentication → URL Configuration:** Redirect URL olarak `http://localhost:3000/auth/callback` (üretimde kendi domaininiz) ekleyin.

## Geliştirme

```bash
npm run dev
```

Tarayıcı: [http://localhost:3000](http://localhost:3000)

## Test senaryosu (elle)

1. **Kayıt / giriş** — `/register`, `/login`
2. **Etkinlik** — Panel → Yeni etkinlik; başlık gir, oluştur
3. **Davetiye** — Etkinlik detayında PNG/PDF indir; QR’nin `/e/{slug}` adresine gittiğini doğrula
4. **Misafir** — Gizli pencerede `/e/{slug}` aç; dosya yükle; ilerleme çubuğunu kontrol et
5. **Panel** — Aynı etkinlikte galeri, sayfalama (`?page=2`), ZIP indir, büyük önizleme
6. **Moderasyon** — `GOOGLE_VISION_API_KEY` varsa uygunsuz görsel reddedilebilir veya “pending” düşer; pending için Onayla/Reddet
7. **Gizlilik** — `/privacy` açılıyor mu, footer linki

## Üretim

- Vercel veya benzeri: env değişkenlerini panelden girin
- `NEXT_PUBLIC_SITE_URL` ve Supabase redirect URL’lerini güncelleyin

## Komutlar

| Komut | Açıklama |
|--------|----------|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Üretim derlemesi |
| `npm run start` | Üretim sunucusu |
| `npm run lint` | ESLint |
