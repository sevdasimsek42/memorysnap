"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const UpdatePasswordForm = () => {
  const router = useRouter()

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.")
      return
    }

    if (password !== confirm) {
      setError("Şifreler eşleşmiyor.")
      return
    }

    setIsPending(true)

    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({
      password
    })

    setIsPending(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    router.refresh()
    router.push("/dashboard")
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <label
          htmlFor="new-password"
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          Yeni şifre
        </label>
        <Input
          id="new-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "update-pw-error" : undefined}
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="confirm-password"
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          Yeni şifre (tekrar)
        </label>
        <Input
          id="confirm-password"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "update-pw-error" : undefined}
        />
      </div>
      {error ? (
        <p
          id="update-pw-error"
          className="text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? "Kaydediliyor…" : "Şifreyi güncelle"}
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

export { UpdatePasswordForm }
