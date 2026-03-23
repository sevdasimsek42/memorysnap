import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { EditEventForm } from "@/components/edit-event-form"
import { Button } from "@/components/ui/button"
import type { EventRow } from "@/types/event"

type EditEventPageProps = {
  params: { id: string }
}

const EditEventPage = async ({ params }: EditEventPageProps) => {
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

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/events/${event.id}`}>← Etkinlik</Link>
          </Button>
          <h1 className="mt-4 text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
            Etkinliği düzenle
          </h1>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <EditEventForm event={event} />
        </div>
      </div>
    </div>
  )
}

export default EditEventPage
