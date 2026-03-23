import Link from "next/link"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { CreateEventForm } from "@/components/create-event-form"
import { Button } from "@/components/ui/button"

const NewEventPage = async () => {
  const supabase = createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">← Panele dön</Link>
          </Button>
          <h1 className="mt-4 text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
            Yeni etkinlik
          </h1>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            Başlık zorunlu. Kaydettiğinizde benzersiz bir paylaşım kodu (slug)
            atanır.
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <CreateEventForm />
        </div>
      </div>
    </div>
  )
}

export default NewEventPage
