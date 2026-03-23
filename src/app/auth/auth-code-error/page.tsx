import Link from "next/link"

import { Button } from "@/components/ui/button"

const AuthCodeErrorPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-950">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
          Oturum doğrulanamadı
        </h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Bağlantı süresi dolmuş veya geçersiz olabilir. Lütfen tekrar giriş yapın
          veya yeni bir sıfırlama e-postası isteyin.
        </p>
        <Button className="mt-6 w-full" asChild>
          <Link href="/login">Giriş sayfasına dön</Link>
        </Button>
      </div>
    </div>
  )
}

export default AuthCodeErrorPage
