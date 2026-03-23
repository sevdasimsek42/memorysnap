"use client"

import { useState } from "react"
import Link from "next/link"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("")
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

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${origin}/auth/callback?next=/update-password`
      }
    )

    setIsPending(false)

    if (resetError) {
      setError(resetError.message)
      return
    }

    setInfo(
      "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Gelen kutunuzu kontrol edin."
    )
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <label
          htmlFor="forgot-email"
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          E-posta
        </label>
        <Input
          id="forgot-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? "forgot-error" : info ? "forgot-info" : undefined
          }
        />
      </div>
      {error ? (
        <p
          id="forgot-error"
          className="text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {info ? (
        <p
          id="forgot-info"
          className="text-sm text-neutral-600 dark:text-neutral-400"
          role="status"
        >
          {info}
        </p>
      ) : null}
      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? "Gönderiliyor…" : "Sıfırlama bağlantısı gönder"}
      </Button>
      <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
        <Link
          href="/login"
          className="font-medium text-neutral-900 underline underline-offset-4 dark:text-neutral-100"
        >
          Girişe dön
        </Link>
      </p>
    </form>
  )
}

export { ForgotPasswordForm }
