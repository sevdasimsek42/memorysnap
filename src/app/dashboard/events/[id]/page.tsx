import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { DeleteEventButton } from "@/components/delete-event-button"
import { EventGallery, type GalleryItem } from "@/components/event-gallery"
import { InviteQrDownload } from "@/components/invite-qr-download"
import { ModerationQueue, type ModerationItem } from "@/components/moderation-queue"
import { Button } from "@/components/ui/button"
import type { EventRow } from "@/types/event"

const PAGE_SIZE = 30

const getSiteBase = () => {
  const u = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")
  if (u) {
    return u
  }
  return ""
}

type EventDetailPageProps = {
  params: { id: string }
  searchParams: { page?: string }
}

const EventDetailPage = async ({
  params,
  searchParams
}: EventDetailPageProps) => {
  const supabase = createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: row, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", params.id)
    .maybeSingle()

  if (error || !row) {
    notFound()
  }

  const event = row as EventRow
  const base = getSiteBase()
  const guestPath = base ? `${base}/e/${event.slug}` : `/e/${event.slug}`
  const guestUrlAbs = base
    ? `${base}/e/${event.slug}`
    : `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/e/${event.slug}`

  const { count: mediaCount } = await supabase
    .from("media")
    .select("*", { count: "exact", head: true })
    .eq("event_id", event.id)

  const page = Math.max(
    1,
    parseInt(searchParams.page ?? "1", 10) || 1
  )
  const totalPages = Math.max(1, Math.ceil((mediaCount ?? 0) / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const from = (safePage - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data: mediaRows } = await supabase
    .from("media")
    .select("id, file_url, file_type, status, uploaded_at")
    .eq("event_id", event.id)
    .order("uploaded_at", { ascending: false })
    .range(from, to)

  const mediaWithUrls: GalleryItem[] = await Promise.all(
    (mediaRows ?? []).map(async (m) => {
      const { data: signed } = await supabase.storage
        .from("media")
        .createSignedUrl(m.file_url, 3600)
      return {
        ...m,
        signedUrl: signed?.signedUrl ?? null
      } as GalleryItem
    })
  )

  const { data: pendingRows } = await supabase
    .from("media")
    .select("id, file_url, file_type, uploaded_at")
    .eq("event_id", event.id)
    .eq("status", "pending")
    .order("uploaded_at", { ascending: false })
    .limit(50)

  const pendingWithUrls: ModerationItem[] = await Promise.all(
    (pendingRows ?? []).map(async (m) => {
      const { data: signed } = await supabase.storage
        .from("media")
        .createSignedUrl(m.file_url, 3600)
      return {
        ...m,
        signedUrl: signed?.signedUrl ?? null
      } as ModerationItem
    })
  )

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">← Panel</Link>
        </Button>

        <header className="mt-6">
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
            {event.title}
          </h1>
          {event.description ? (
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">
              {event.description}
            </p>
          ) : null}
          <dl className="mt-4 flex flex-wrap gap-4 text-sm text-neutral-500 dark:text-neutral-400">
            {event.event_date ? (
              <div>
                <dt className="sr-only">Tarih</dt>
                <dd>{event.event_date}</dd>
              </div>
            ) : null}
            <div>
              <dt className="sr-only">Medya sayısı</dt>
              <dd>{mediaCount ?? 0} medya</dd>
            </div>
            <div>
              <dt className="sr-only">Durum</dt>
              <dd>{event.is_active ? "Aktif" : "Pasif"}</dd>
            </div>
          </dl>
        </header>

        <section
          className="mt-8 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
          aria-labelledby="guest-link-heading"
        >
          <h2
            id="guest-link-heading"
            className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Misafir bağlantısı ve davetiye QR
          </h2>
          <p className="mt-2 break-all font-mono text-sm text-neutral-600 dark:text-neutral-400">
            {guestPath}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link href={`/e/${event.slug}`} target="_blank">
                Önizle
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/dashboard/events/${event.id}/edit`}>Düzenle</Link>
            </Button>
          </div>
          <div className="mt-6 border-t border-neutral-200 pt-6 dark:border-neutral-800">
            <InviteQrDownload
              guestUrl={guestUrlAbs}
              title={event.title}
              eventDate={event.event_date}
              description={event.description}
            />
          </div>
        </section>

        <section
          className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/40 p-5 dark:border-amber-900 dark:bg-amber-950/20"
          aria-labelledby="mod-heading"
        >
          <h2
            id="mod-heading"
            className="text-sm font-medium text-amber-900 dark:text-amber-100"
          >
            Onay bekleyenler ({pendingWithUrls.length})
          </h2>
          <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-200/80">
            Otomatik moderasyon belirsiz veya kapalı API anahtarı durumunda
            buraya düşer.
          </p>
          <div className="mt-4">
            <ModerationQueue items={pendingWithUrls} />
          </div>
        </section>

        <section
          className="mt-8 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
          aria-labelledby="gallery-heading"
        >
          <h2
            id="gallery-heading"
            className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
          >
            Galeri
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Masonry düzen · tıklayınca büyük önizleme
          </p>
          <div className="mt-4">
            <EventGallery
              eventId={event.id}
              eventSlug={event.slug}
              items={mediaWithUrls}
              page={safePage}
              totalPages={totalPages}
              totalCount={mediaCount ?? 0}
            />
          </div>
        </section>

        <div className="mt-10 border-t border-neutral-200 pt-8 dark:border-neutral-800">
          <DeleteEventButton eventId={event.id} />
        </div>
      </div>
    </div>
  )
}

export default EventDetailPage
