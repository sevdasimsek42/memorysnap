import { NextResponse } from "next/server"

import { runSafeSearchAndUpdateMedia } from "@/lib/moderation"
import { createServiceClient } from "@/lib/supabase/admin"
import { checkUploadRateLimit } from "@/lib/rate-limit"
import { validateUploadMeta } from "@/lib/upload-validation"

export const runtime = "nodejs"
export const maxDuration = 60

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
      { error: "Saatlik yükleme limiti aşıldı." },
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
    path?: string
    fileSize?: number
    contentType?: string
    uploaderName?: string | null
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Geçersiz istek gövdesi." }, { status: 400 })
  }

  const slug = body.slug?.trim()
  const path = body.path?.trim()
  const fileSize = body.fileSize
  const contentType = body.contentType?.trim() ?? ""
  const uploaderName = body.uploaderName?.trim() || null

  if (!slug || !path || typeof fileSize !== "number" || !contentType) {
    return NextResponse.json({ error: "Eksik alanlar." }, { status: 400 })
  }

  const meta = validateUploadMeta(contentType, fileSize)
  if (!meta.ok) {
    return NextResponse.json({ error: meta.error }, { status: 400 })
  }

  const { data: event, error: evErr } = await admin
    .from("events")
    .select("id, is_active, requires_moderation")
    .eq("slug", slug)
    .maybeSingle()

  if (evErr || !event?.is_active) {
    return NextResponse.json({ error: "Etkinlik bulunamadı." }, { status: 404 })
  }

  if (!path.startsWith(`${event.id}/`)) {
    return NextResponse.json({ error: "Geçersiz dosya yolu." }, { status: 400 })
  }

  const parts = path.split("/")
  const folder = parts[0]
  const leaf = parts.slice(1).join("/")
  if (!folder || !leaf) {
    return NextResponse.json({ error: "Geçersiz dosya yolu." }, { status: 400 })
  }

  const { data: listed, error: listErr } = await admin.storage
    .from("media")
    .list(folder, { limit: 1000 })

  if (listErr || !listed?.some((f) => f.name === leaf)) {
    return NextResponse.json(
      { error: "Dosya depoda bulunamadı. Yükleme tamamlanmamış olabilir." },
      { status: 400 }
    )
  }

  const { data: inserted, error: insErr } = await admin
    .from("media")
    .insert({
      event_id: event.id,
      uploader_name: uploaderName,
      file_url: path,
      file_type: meta.isVideo ? "video" : "image",
      file_size: fileSize,
      status: "pending"
    })
    .select("id")
    .maybeSingle()

  if (insErr) {
    if (insErr.code === "23505") {
      return NextResponse.json({ ok: true, duplicate: true })
    }
    return NextResponse.json({ error: insErr.message }, { status: 500 })
  }

  if (!inserted?.id) {
    return NextResponse.json({ error: "Kayıt oluşturulamadı." }, { status: 500 })
  }

  await runSafeSearchAndUpdateMedia(
    admin,
    inserted.id,
    path,
    meta.isVideo,
    event.requires_moderation
  )

  return NextResponse.json({ ok: true })
}
