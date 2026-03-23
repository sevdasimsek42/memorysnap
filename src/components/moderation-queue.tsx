"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"

import { approveMedia, rejectMedia } from "@/app/actions/media"
import { Button } from "@/components/ui/button"

export type ModerationItem = {
  id: string
  file_url: string
  file_type: "image" | "video" | null
  signedUrl: string | null
  uploaded_at: string
}

type ModerationQueueProps = {
  items: ModerationItem[]
}

const ModerationQueue = ({ items }: ModerationQueueProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleApprove = (id: string) => {
    startTransition(async () => {
      await approveMedia(id)
      router.refresh()
    })
  }

  const handleReject = (id: string) => {
    startTransition(async () => {
      await rejectMedia(id)
      router.refresh()
    })
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Onay bekleyen medya yok.
      </p>
    )
  }

  return (
    <ul className="space-y-4" aria-label="Onay bekleyen medya">
      {items.map((m) => (
        <li
          key={m.id}
          className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-950/30 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex gap-3">
            {m.signedUrl && m.file_type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={m.signedUrl}
                alt=""
                className="h-24 w-24 rounded-md object-cover"
              />
            ) : null}
            {m.signedUrl && m.file_type === "video" ? (
              <video
                src={m.signedUrl}
                className="h-24 w-24 rounded-md object-cover"
                controls
                playsInline
                preload="metadata"
              />
            ) : null}
            <div className="text-xs text-neutral-600 dark:text-neutral-400">
              <p>{m.uploaded_at}</p>
              <p className="mt-1 font-mono text-[10px] text-neutral-500">
                {m.file_type ?? "?"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              disabled={isPending}
              onClick={() => handleApprove(m.id)}
            >
              Onayla
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              disabled={isPending}
              onClick={() => handleReject(m.id)}
            >
              Reddet
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}

export { ModerationQueue }
