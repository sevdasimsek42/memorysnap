import Link from "next/link"

const SiteFooter = () => {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50 py-8 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 text-sm text-neutral-500 sm:flex-row sm:px-6">
        <p>MemorySnap</p>
        <nav aria-label="Alt bağlantılar">
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-neutral-800 dark:hover:text-neutral-200"
          >
            Gizlilik politikası
          </Link>
        </nav>
      </div>
    </footer>
  )
}

export { SiteFooter }
