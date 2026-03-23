"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const LoginForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") ?? "/dashboard"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsPending(true)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    })

    setIsPending(false)

    if (signInError) {
      setError(signInError.message)
      return
    }

    router.refresh()
    router.push(redirectTo)
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <label
          htmlFor="login-email"
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          E-posta
        </label>
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "login-error" : undefined}
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="login-password"
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          Şifre
        </label>
        <Input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "login-error" : undefined}
        />
      </div>
      {error ? (
        <p
          id="login-error"
          className="text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? "Giriş yapılıyor…" : "Giriş yap"}
      </Button>
      <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
        <Link
          href="/forgot-password"
          className="font-medium text-neutral-900 underline underline-offset-4 hover:text-neutral-700 dark:text-neutral-100 dark:hover:text-neutral-300"
        >
          Şifremi unuttum
        </Link>
      </p>
    </form>
  )
}

export { LoginForm }
