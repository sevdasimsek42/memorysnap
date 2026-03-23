"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const RegisterForm = () => {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setIsPending(true)

    const supabase = createClient()
    const origin =
      typeof window !== "undefined" ? window.location.origin : ""

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback?next=/dashboard`
      }
    })

    setIsPending(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    if (data.session) {
      router.refresh()
      router.push("/dashboard")
      return
    }

    setInfo(
      "Kayıt için e-postanızdaki doğrulama bağlantısına tıklayın. Onay sonrası giriş yapabilirsiniz."
    )
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <label
          htmlFor="register-email"
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          E-posta
        </label>
        <Input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? "register-error" : info ? "register-info" : undefined
          }
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="register-password"
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          Şifre (en az 6 karakter)
        </label>
        <Input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? "register-error" : info ? "register-info" : undefined
          }
        />
      </div>
      {error ? (
        <p
          id="register-error"
          className="text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {info ? (
        <p
          id="register-info"
          className="text-sm text-neutral-600 dark:text-neutral-400"
          role="status"
        >
          {info}
        </p>
      ) : null}
      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? "Kaydediliyor…" : "Hesap oluştur"}
      </Button>
      <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
        Zaten hesabın var mı?{" "}
        <Link
          href="/login"
          className="font-medium text-neutral-900 underline underline-offset-4 dark:text-neutral-100"
        >
          Giriş yap
        </Link>
      </p>
    </form>
  )
}

export { RegisterForm }
