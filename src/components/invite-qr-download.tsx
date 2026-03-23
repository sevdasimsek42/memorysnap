"use client"

import { useCallback, useEffect, useId, useMemo, useState } from "react"
import QRCode from "qrcode"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import { Download, ImageIcon, QrCode } from "lucide-react"

import { Button } from "@/components/ui/button"

type InviteQrDownloadProps = {
  guestUrl: string
  title: string
  eventDate: string | null
  description: string | null
}

const InviteQrDownload = ({
  guestUrl,
  title,
  eventDate,
  description
}: InviteQrDownloadProps) => {
  const reactId = useId().replace(/:/g, "")
  const cardDomId = useMemo(() => `invite-card-${reactId}`, [reactId])
  const [busy, setBusy] = useState<"png" | "pdf" | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)

  const loadQr = useCallback(async () => {
    const url = await QRCode.toDataURL(guestUrl, {
      width: 200,
      margin: 2,
      color: { dark: "#171717", light: "#ffffff" }
    })
    setQrDataUrl(url)
  }, [guestUrl])

  useEffect(() => {
    void loadQr()
  }, [loadQr])

  const handlePng = useCallback(async () => {
    const el = document.getElementById(cardDomId)
    if (!el) {
      return
    }
    setBusy("png")
    try {
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#ffffff" })
      const a = document.createElement("a")
      a.href = canvas.toDataURL("image/png")
      a.download = "davetiye-qr.png"
      a.click()
    } finally {
      setBusy(null)
    }
  }, [cardDomId])

  const handlePdf = useCallback(async () => {
    const el = document.getElementById(cardDomId)
    if (!el) {
      return
    }
    setBusy("pdf")
    try {
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#ffffff" })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a5" })
      const w = 148
      const h = (canvas.height * w) / canvas.width
      pdf.addImage(imgData, "PNG", 0, 0, w, Math.min(h, 210))
      pdf.save("davetiye.pdf")
    } finally {
      setBusy(null)
    }
  }, [cardDomId])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy !== null}
          onClick={handlePng}
        >
          <ImageIcon className="h-4 w-4" aria-hidden />
          {busy === "png" ? "…" : "PNG indir"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy !== null}
          onClick={handlePdf}
        >
          <Download className="h-4 w-4" aria-hidden />
          {busy === "pdf" ? "…" : "PDF indir"}
        </Button>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-900">
        <p className="mb-3 flex items-center gap-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">
          <QrCode className="h-4 w-4" aria-hidden />
          Önizleme (basılı davetiyeye uygun A5)
        </p>
        <div
          id={cardDomId}
          className="mx-auto flex w-full max-w-sm flex-col items-center bg-white p-6 text-center shadow-sm"
        >
          <p className="font-serif text-lg font-semibold text-neutral-900">
            {title}
          </p>
          {eventDate ? (
            <p className="mt-2 text-sm text-neutral-600">{eventDate}</p>
          ) : null}
          {description ? (
            <p className="mt-3 line-clamp-4 text-xs text-neutral-500">{description}</p>
          ) : null}
          <div className="mt-6 flex flex-col items-center gap-2">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} width={200} height={200} alt="" />
            ) : (
              <span className="text-xs text-neutral-400">QR yükleniyor…</span>
            )}
            <p className="max-w-[200px] break-all font-mono text-[10px] text-neutral-400">
              {guestUrl}
            </p>
          </div>
          <p className="mt-4 text-[10px] text-neutral-400">
            Anılarınızı paylaşın — QR kodu okutun
          </p>
        </div>
      </div>
    </div>
  )
}

export { InviteQrDownload }
