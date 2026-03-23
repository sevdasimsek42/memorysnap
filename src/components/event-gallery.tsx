"use client"

import { useCallback, useState } from "react"
import Link from "next/link"
import JSZip from "jszip"
import { saveAs } from "file-saver"
import { ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react"

import { getZipSourcesForEvent } from "@/app/actions/media"
import { Button } from "@/components/ui/button"

export type GalleryItem = {
  id: string
  file_url: string
  file_type: "image" | "video" | null
  status: string
  uploaded_at: string
  signedUrl: string | null
}

type EventGalleryProps = {
  eventId: string
  eventSlug: string
  items: GalleryItem[]
  page: number
  totalPages: number
  totalCount: number
}

const EventGallery = ({
  eventId,
  eventSlug,
  items,
  page,
  totalPages,
  totalCount
}: EventGalleryProps) => {
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [zipLoading, setZipLoading] = useState(false)

  const handleDownloadZip = async () => {
    setZipLoading(true)
    try {
      const res = await getZipSourcesForEvent(eventId)
      if (res.error || !res.items?.length) {
        alert(res.error ?? "İndirilecek dosya yok.")
        return
      }
      const zip = new JSZip()
      for (const item of res.items) {
        const blob = await fetch(item.url).then((r) => r.blob())
        zip.file(item.name, blob)
      }
      const out = await zip.generateAsync({ type: "blob" })
      saveAs(out, `memorysnap-${eventSlug}.zip`)
    } catch (e) {
      alert(e instanceof Error ? e.message : "ZIP oluşturulamadı.")
    } finally {
      setZipLoading(false)
    }
  }

  const goPrev = useCallback(() => {
    setLightbox((i) => {
      if (i === null || i <= 0) {
        return i
      }
      return i - 1
    })
  }, [])

  const goNext = useCallback(() => {
    setLightbox((i) => {
      if (i === null || i >= items.length - 1) {
        return i
      }
      return i + 1
    })
  }, [items.length])

  const active = lightbox !== null ? items[lightbox] : null

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-neutral-500">
          Toplam {totalCount} öğe · Sayfa {page} / {Math.max(1, totalPages)}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={zipLoading || totalCount === 0}
            onClick={handleDownloadZip}
          >
            {zipLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Download className="h-4 w-4" aria-hidden />
            )}
            ZIP indir
          </Button>
          {totalPages > 1 ? (
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                asChild
              >
                <Link
                  href={`/dashboard/events/${eventId}?page=${page - 1}`}
                  scroll={false}
                >
                  Önceki
                </Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={page >= totalPages}
                asChild
              >
                <Link
                  href={`/dashboard/events/${eventId}?page=${page + 1}`}
                  scroll={false}
                >
                  Sonraki
                </Link>
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
          Bu sayfada medya yok.
        </p>
      ) : (
        <ul
          className="mt-4 columns-2 gap-3 sm:columns-3 md:columns-4"
          aria-label="Galeri"
        >
          {items.map((m, idx) => (
            <li
              key={m.id}
              className="mb-3 break-inside-avoid"
            >
              <button
                type="button"
                className="w-full overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 text-left outline-none ring-offset-background transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-ring dark:border-neutral-700 dark:bg-neutral-800"
                onClick={() => setLightbox(idx)}
                aria-label={`Medya büyüt: ${m.status}`}
              >
                {m.signedUrl && m.file_type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.signedUrl}
                    alt=""
                    className="max-h-64 w-full object-cover"
                    loading="lazy"
                  />
                ) : null}
                {m.signedUrl && m.file_type === "video" ? (
                  <video
                    src={m.signedUrl}
                    className="max-h-64 w-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : null}
                {!m.signedUrl ? (
                  <div className="flex aspect-square items-center justify-center p-4 text-xs text-neutral-500">
                    Önizleme yok
                  </div>
                ) : null}
                <span className="block truncate px-2 py-1 text-[10px] text-neutral-500">
                  {m.status}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {lightbox !== null && active?.signedUrl ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Büyük önizleme"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Kapat"
            onClick={() => setLightbox(null)}
          />
          <div className="relative z-10 max-h-[90vh] max-w-4xl">
            {active.file_type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={active.signedUrl}
                alt=""
                className="max-h-[85vh] max-w-full object-contain"
              />
            ) : (
              <video
                src={active.signedUrl}
                className="max-h-[85vh] max-w-full"
                controls
                playsInline
                autoPlay
              />
            )}
            <div className="mt-4 flex justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={goPrev}
                disabled={lightbox <= 0}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={goNext}
                disabled={lightbox >= items.length - 1}
              >
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setLightbox(null)}
              >
                Kapat
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export { EventGallery }
