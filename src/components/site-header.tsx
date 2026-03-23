import Link from "next/link"
import { Camera } from "lucide-react"

import { signOut } from "@/app/actions/auth"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"

const SiteHeader = async () => {
  const supabase = createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  return (
    <header className="border-b border-neutral-200/80 bg-white/70 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/70">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-md outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="MemorySnap ana sayfa"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
            <Camera className="h-5 w-5" aria-hidden />
          </span>
          <span className="text-lg font-semibold tracking-tight">MemorySnap</span>
        </Link>
        <nav
          className="flex items-center gap-2 sm:gap-3"
          aria-label="Ana navigasyon"
        >
          {user ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Panel</Link>
              </Button>
              <form action={signOut}>
                <Button type="submit" variant="outline">
                  Çıkış
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Giriş</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Kayıt ol</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export { SiteHeader }
