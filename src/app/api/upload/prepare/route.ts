import { NextResponse } from "next/server"

import { createServiceClient } from "@/lib/supabase/admin"
import { checkUploadRateLimit } from "@/lib/rate-limit"
import { validateUploadMeta } from "@/lib/upload-validation"

export const runtime = "nodejs"

const getClientIp = (req: Request) => {
  const h =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  return h
}

export const POST = async (req: Request) => {
  const ip = getClientIp(req)
  if (!checkUploadRateLimit(ip)) {
    return NextResponse.json(
      { error: "Saatlik yükleme limiti aşıldı. Daha sonra tekrar deneyin." },
      { status: 429 }
    )
  }

  const admin = createServiceClient()
  if (!admin) {
    return NextResponse.json(
      { error: "Sunucu yapılandırması eksik (SUPABASE_SERVICE_ROLE_KEY)." },
      { status: 503 }
    )
  }

  let body: {
    slug?: string
    fileName?: string
    fileSize?: number
    contentType?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Geçersiz istek gövdesi." }, { status: 400 })
  }

  const slug = body.slug?.trim()
  const fileSize = body.fileSize
  const contentType = body.contentType?.trim() ?? ""

  if (!slug || typeof fileSize !== "number" || !contentType) {
    return NextResponse.json({ error: "Eksik alanlar." }, { status: 400 })
  }

  const meta = validateUploadMeta(contentType, fileSize)
  if (!meta.ok) {
    return NextResponse.json({ error: meta.error }, { status: 400 })
  }

  const { data: event, error: evErr } = await admin
    .from("events")
    .select("id, is_active")
    .eq("slug", slug)
    .maybeSingle()

  if (evErr || !event?.is_active) {
    return NextResponse.json(
      { error: "Etkinlik bulunamadı veya kapalı." },
      { status: 404 }
    )
  }

  const objectName = `${crypto.randomUUID()}.${meta.ext}`
  const path = `${event.id}/${objectName}`

  const { data: signed, error: signErr } = await admin.storage
    .from("media")
    .createSignedUploadUrl(path)

  if (signErr || !signed) {
    return NextResponse.json(
      { error: signErr?.message ?? "İmzalı yükleme oluşturulamadı." },
      { status: 500 }
    )
  }

  return NextResponse.json({
    path: signed.path,
    token: signed.token,
    signedUrl: signed.signedUrl
  })
}
