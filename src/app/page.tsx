import Link from "next/link"
import { QrCode, Sparkles, Camera } from "lucide-react"

import { Button } from "@/components/ui/button"

const HomePage = () => {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Etkinlik anılarını tek albümde toplayın
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-5xl">
            Misafir fotoğrafları, tek QR ile toplansın
          </h1>
          <p className="mt-5 text-pretty text-lg text-neutral-600 dark:text-neutral-400">
            Davetiyenize özel QR kodu tarayanlar kayıt olmadan fotoğraf ve video
            yükler. Siz de panelden galeriyi yönetir, indirirsiniz.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/register">Ücretsiz başla</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#nasil">Nasıl çalışır?</Link>
            </Button>
          </div>
        </div>

        <ul
          id="nasil"
          className="mt-20 grid gap-6 sm:grid-cols-3"
          aria-label="Özellikler"
        >
          <li className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
              <QrCode className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
            </div>
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">
              QR ile yükleme
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Her etkinlik için benzersiz kod; misafirler doğrudan yükleme
              ekranına gelir.
            </p>
          </li>
          <li className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
              <Camera className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
            </div>
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">
              Kayıt yok
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Misafirler hesap açmadan çoklu fotoğraf ve kısa video yükleyebilir.
            </p>
          </li>
          <li className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
              <Sparkles className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
            </div>
            <h2 className="font-semibold text-neutral-900 dark:text-neutral-50">
              Davetiye + arşiv
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Hazır şablonlarla davetiye, PDF indirme ve merkezi galeri yakında.
            </p>
          </li>
        </ul>
      </main>
    </div>
  )
}

export default HomePage
