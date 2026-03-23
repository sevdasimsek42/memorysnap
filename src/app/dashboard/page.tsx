import Link from "next/link"
import { redirect } from "next/navigation"
import { Calendar, ImageIcon, Plus } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import type { EventWithMediaCount } from "@/types/event"

const getSiteBase = () => {
  const u = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")
  if (u) {
    return u
  }
  return ""
}

const DashboardPage = async () => {
  const supabase = createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: rawEvents } = await supabase
    .from("events")
    .select("id, title, slug, event_date, is_active, created_at, media(count)")
    .order("created_at", { ascending: false })

  const events = (rawEvents ?? []) as EventWithMediaCount[]
  const totalMedia = events.reduce((acc, e) => {
    const row = e.media?.[0] as { count?: number } | undefined
    const n = typeof row?.count === "number" ? row.count : 0
    return acc + n
  }, 0)

  const base = getSiteBase()

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
              Panel
            </h1>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {user.email}
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/events/new">
              <Plus className="h-4 w-4" aria-hidden />
              Yeni etkinlik
            </Link>
          </Button>
        </div>

        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Etkinlikler
            </dt>
            <dd className="mt-1 text-3xl font-semibold tabular-nums text-neutral-900 dark:text-neutral-50">
              {events.length}
            </dd>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
            <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Toplam medya
            </dt>
            <dd className="mt-1 text-3xl font-semibold tabular-nums text-neutral-900 dark:text-neutral-50">
              {totalMedia}
            </dd>
          </div>
        </dl>

        <section className="mt-10" aria-labelledby="events-heading">
          <h2
            id="events-heading"
            className="text-lg font-semibold text-neutral-900 dark:text-neutral-50"
          >
            Etkinlikleriniz
          </h2>
          {events.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
              Henüz etkinlik yok. Misafir yüklemeleri için bir etkinlik oluşturun.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {events.map((ev) => {
                const countRow = ev.media?.[0] as { count?: number } | undefined
                const mediaCount =
                  typeof countRow?.count === "number" ? countRow.count : 0
                const guestPath = base ? `${base}/e/${ev.slug}` : `/e/${ev.slug}`
                return (
                  <li key={ev.id}>
                    <article className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <Link
                          href={`/dashboard/events/${ev.id}`}
                          className="font-medium text-neutral-900 hover:underline dark:text-neutral-50"
                        >
                          {ev.title}
                        </Link>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                          {ev.event_date ? (
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" aria-hidden />
                              {ev.event_date}
                            </span>
                          ) : null}
                          <span className="inline-flex items-center gap-1">
                            <ImageIcon className="h-3.5 w-3.5" aria-hidden />
                            {mediaCount} medya
                          </span>
                          {!ev.is_active ? (
                            <span className="text-amber-600 dark:text-amber-400">
                              Pasif
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 font-mono text-xs text-neutral-500">
                          {guestPath}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/e/${ev.slug}`} target="_blank">
                            Misafir görünümü
                          </Link>
                        </Button>
                        <Button variant="secondary" size="sm" asChild>
                          <Link href={`/dashboard/events/${ev.id}/edit`}>
                            Düzenle
                          </Link>
                        </Button>
                      </div>
                    </article>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <p className="mt-10 text-center">
          <Button variant="ghost" asChild>
            <Link href="/">Ana sayfa</Link>
          </Button>
        </p>
      </div>
    </div>
  )
}

export default DashboardPage
