import Link from "next/link"

import { RegisterForm } from "@/components/register-form"
import { Button } from "@/components/ui/button"

const RegisterPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-950">
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h1 className="text-center text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
          Kayıt ol
        </h1>
        <p className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
          Etkinliklerinizi yönetmek için ücretsiz hesap oluşturun.
        </p>
        <div className="mt-8">
          <RegisterForm />
        </div>
        <Button className="mt-8 w-full" variant="outline" asChild>
          <Link href="/">Ana sayfaya dön</Link>
        </Button>
      </div>
    </div>
  )
}

export default RegisterPage
