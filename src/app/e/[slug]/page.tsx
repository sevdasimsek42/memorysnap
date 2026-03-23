import Link from "next/link"
import { notFound } from "next/navigation"
import { Camera } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { GuestUploadZone } from "@/components/guest-upload-zone"
import { Button } from "@/components/ui/button"
import type { PublicEventRow } from "@/types/event"

type GuestEventPageProps = {
  params: { slug: string }
}

const GuestEventPage = async ({ params }: GuestEventPageProps) => {
  const supabase = createClient()
  const { data: rows, error } = await supabase.rpc("get_public_event_by_slug", {
    p_slug: params.slug
  })

  if (error || !rows?.length) {
    notFound()
  }

  const event = rows[0] as PublicEventRow

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
        <div className="text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
            <Camera className="h-7 w-7" aria-hidden />
          </span>
          <h1 className="mt-6 text-balance text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
            {event.title}
          </h1>
          {event.description ? (
            <p className="mt-3 text-pretty text-neutral-600 dark:text-neutral-400">
              {event.description}
            </p>
          ) : null}
          {event.event_date ? (
            <p className="mt-2 text-sm text-neutral-500">{event.event_date}</p>
          ) : null}
        </div>

        <div className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
            Fotoğraf veya video yükle
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Moderasyon: {event.requires_moderation ? "açık (yükleme sonrası)" : "kapalı"}
          </p>
          <div className="mt-6">
            <GuestUploadZone slug={event.slug} eventTitle={event.title} />
          </div>
        </div>

        <p className="mt-10 text-center">
          <Button variant="ghost" asChild>
            <Link href="/">MemorySnap</Link>
          </Button>
        </p>
      </div>
    </div>
  )
}

export default GuestEventPage
