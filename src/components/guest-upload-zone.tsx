"use client"

import { useCallback, useId, useRef, useState } from "react"
import imageCompression from "browser-image-compression"

import { createClient } from "@/lib/supabase/client"
import {
  guessMimeFromFileName,
  MAX_VIDEO_BYTES,
  MAX_VIDEO_DURATION_SEC,
  validateUploadMeta
} from "@/lib/upload-validation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const putFileWithProgress = (
  signedUrl: string,
  file: File,
  onProgress: (pct: number) => void
) => {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    })
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error(`Depo yanıtı (${xhr.status})`))
      }
    })
    xhr.addEventListener("error", () => reject(new Error("Ağ hatası")))
    xhr.open("PUT", signedUrl)
    if (file.type) {
      xhr.setRequestHeader("Content-Type", file.type)
    }
    xhr.send(file)
  })
}

type GuestUploadZoneProps = {
  slug: string
  eventTitle: string
}

type QueueItem = {
  id: string
  file: File
  status: "pending" | "uploading" | "done" | "error"
  message?: string
  progress?: number
}

const readVideoDuration = (file: File) => {
  return new Promise<number>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const el = document.createElement("video")
    el.preload = "metadata"
    el.muted = true
    el.playsInline = true
    el.src = url
    el.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      resolve(el.duration)
    }
    el.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Video okunamadı"))
    }
  })
}

const maybeCompressImage = async (file: File) => {
  if (!file.type.startsWith("image/") || file.type === "image/heic") {
    return file
  }
  return imageCompression(file, {
    maxSizeMB: 18,
    maxWidthOrHeight: 2048,
    useWebWorker: true
  })
}

const GuestUploadZone = ({ slug, eventTitle }: GuestUploadZoneProps) => {
  const inputId = useId()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploaderName, setUploaderName] = useState("")
  const [note, setNote] = useState("")
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [phase, setPhase] = useState<"idle" | "uploading" | "finished">("idle")
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [allSuccess, setAllSuccess] = useState(false)

  const handleFiles = useCallback((list: FileList | File[]) => {
    const arr = Array.from(list)
    const next: QueueItem[] = arr.map((file) => ({
      id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
      file,
      status: "pending"
    }))
    setQueue((q) => [...q, ...next])
    setGlobalError(null)
    setPhase("idle")
    setAllSuccess(false)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleFiles(e.target.files)
      e.target.value = ""
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.files?.length) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      fileInputRef.current?.click()
    }
  }

  const runUpload = async () => {
    if (queue.length === 0) {
      setGlobalError("Önce dosya seçin.")
      return
    }

    setGlobalError(null)
    setPhase("uploading")
    setAllSuccess(false)

    const snapshot = [...queue]
    const supabase = createClient()
    let successCount = 0
    let failCount = 0

    for (const item of snapshot) {
      if (item.status === "done") {
        continue
      }

      setQueue((prev) =>
        prev.map((row) =>
          row.id === item.id
            ? { ...row, status: "uploading", message: undefined, progress: 0 }
            : row
        )
      )

      try {
        let file = item.file
        file = await maybeCompressImage(file)

        const effectiveType =
          file.type || guessMimeFromFileName(file.name) || ""
        if (!effectiveType) {
          throw new Error("Dosya türü algılanamadı.")
        }

        const meta = validateUploadMeta(effectiveType, file.size)
        if (!meta.ok) {
          throw new Error(meta.error)
        }

        if (meta.isVideo) {
          if (file.size > MAX_VIDEO_BYTES) {
            throw new Error("Video en fazla 200 MB olabilir.")
          }
          const dur = await readVideoDuration(file)
          if (!Number.isFinite(dur) || dur > MAX_VIDEO_DURATION_SEC + 0.5) {
            throw new Error("Video en fazla 60 saniye olabilir.")
          }
        }

        const prep = await fetch("/api/upload/prepare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            fileName: file.name,
            fileSize: file.size,
            contentType: effectiveType
          })
        })

        const prepJson = (await prep.json()) as {
          error?: string
          path?: string
          token?: string
          signedUrl?: string
        }

        if (!prep.ok || prepJson.error || !prepJson.path) {
          throw new Error(prepJson.error ?? "Yükleme hazırlanamadı.")
        }

        if (prepJson.signedUrl) {
          await putFileWithProgress(prepJson.signedUrl, file, (pct) => {
            setQueue((prev) =>
              prev.map((row) =>
                row.id === item.id ? { ...row, progress: pct } : row
              )
            )
          })
        } else if (prepJson.token) {
          const { data: upData, error: upErr } = await supabase.storage
            .from("media")
            .uploadToSignedUrl(prepJson.path, prepJson.token, file)

          if (upErr || !upData) {
            throw new Error(upErr?.message ?? "Depoya yüklenemedi.")
          }
        } else {
          throw new Error("İmzalı yükleme bilgisi eksik.")
        }

        const fin = await fetch("/api/upload/finalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            path: prepJson.path,
            fileSize: file.size,
            contentType: effectiveType,
            uploaderName: uploaderName.trim() || null
          })
        })

        const finJson = (await fin.json()) as { error?: string; ok?: boolean }
        if (!fin.ok || !finJson.ok) {
          throw new Error(finJson.error ?? "Kayıt tamamlanamadı.")
        }

        setQueue((prev) =>
          prev.map((row) =>
            row.id === item.id
              ? { ...row, status: "done", progress: 100 }
              : row
          )
        )
        successCount += 1
      } catch (err) {
        failCount += 1
        const msg = err instanceof Error ? err.message : "Bilinmeyen hata"
        setQueue((prev) =>
          prev.map((row) =>
            row.id === item.id
              ? { ...row, status: "error", message: msg }
              : row
          )
        )
      }
    }

    setPhase("finished")
    setAllSuccess(successCount > 0 && failCount === 0)
    if (successCount === 0 && failCount === 0) {
      setGlobalError("Yüklenecek yeni dosya yok veya tümü zaten tamamlanmış.")
    }
  }

  const resetAll = () => {
    setQueue([])
    setPhase("idle")
    setAllSuccess(false)
    setGlobalError(null)
  }

  const doneCount = queue.filter((q) => q.status === "done").length
  const hasErrors = queue.some((q) => q.status === "error")
  const isUploading = phase === "uploading"

  if (phase === "finished" && allSuccess) {
    return (
      <div
        className="rounded-2xl border border-neutral-200 bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900"
        role="status"
        aria-live="polite"
      >
        <p className="text-lg font-medium text-neutral-900 dark:text-neutral-50">
          Teşekkürler!
        </p>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          {doneCount} dosya yüklendi. {eventTitle} için anılarınız kaydedildi.
        </p>
        {note ? (
          <p className="mt-4 text-sm text-neutral-500">{note}</p>
        ) : null}
        <Button className="mt-6" type="button" variant="outline" onClick={resetAll}>
          Başka dosya yükle
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {phase === "finished" && hasErrors ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
          Bazı dosyalar yüklenemedi. Aşağıdaki satırları kontrol edip tekrar
          deneyebilirsiniz.
        </p>
      ) : null}

      <div className="space-y-2">
        <label
          htmlFor="uploader-name"
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          Adınız (isteğe bağlı)
        </label>
        <Input
          id="uploader-name"
          value={uploaderName}
          onChange={(e) => setUploaderName(e.target.value)}
          placeholder="Misafir olarak görünsün"
          autoComplete="name"
        />
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label="Dosya sürükleyip bırakın veya seçmek için Enter veya Space"
        className="rounded-2xl border-2 border-dashed border-neutral-300 bg-white p-8 text-center outline-none transition hover:border-neutral-400 focus-visible:ring-2 focus-visible:ring-ring dark:border-neutral-600 dark:bg-neutral-900"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onKeyDown={handleKeyDown}
      >
        <input
          ref={fileInputRef}
          id={inputId}
          type="file"
          className="sr-only"
          multiple
          accept="image/jpeg,image/png,image/webp,image/heic,video/mp4,video/quicktime"
          onChange={handleInputChange}
        />
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Fotoğraf veya kısa video sürükleyin, ya da
        </p>
        <label htmlFor={inputId} className="mt-2 inline-block cursor-pointer">
          <span className="text-sm font-medium text-neutral-900 underline dark:text-neutral-100">
            dosya seçin
          </span>
        </label>
        <p className="mt-3 text-xs text-neutral-500">
          Görsel en fazla 20 MB, video en fazla 200 MB ve 60 sn. JPG, PNG, WebP,
          HEIC, MP4, MOV.
        </p>
      </div>

      {queue.length > 0 ? (
        <ul className="space-y-2" aria-label="Yükleme kuyruğu">
          {queue.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900"
            >
              <span className="truncate pr-2">{item.file.name}</span>
              <span className="flex min-w-[4rem] flex-col items-end gap-1 text-neutral-500">
                {item.status === "uploading" ? (
                  <>
                    <span className="text-xs tabular-nums">
                      {item.progress ?? 0}%
                    </span>
                    <span
                      className="h-1 w-20 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700"
                      aria-hidden
                    >
                      <span
                        className="block h-full bg-neutral-900 transition-all dark:bg-neutral-100"
                        style={{ width: `${item.progress ?? 0}%` }}
                      />
                    </span>
                  </>
                ) : null}
                {item.status === "done" && "Tamam"}
                {item.status === "error" && (
                  <span className="text-destructive">{item.message}</span>
                )}
                {item.status === "pending" && "Bekliyor"}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {globalError ? (
        <p className="text-sm text-destructive" role="alert">
          {globalError}
        </p>
      ) : null}

      <div className="space-y-2">
        <label
          htmlFor="guest-note"
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          Not (isteğe bağlı, yalnızca ekranda)
        </label>
        <Textarea
          id="guest-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Örn. aile masasından selamlar"
          rows={2}
        />
      </div>

      <Button
        type="button"
        className="w-full"
        disabled={queue.length === 0 || isUploading}
        onClick={runUpload}
      >
        {isUploading ? "Yükleniyor…" : "Yüklemeyi başlat"}
      </Button>
    </div>
  )
}

export { GuestUploadZone }
