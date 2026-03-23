"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"

export const approveMedia = async (mediaId: string) => {
  const supabase = createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Oturum gerekli." }
  }

  const { data: row, error: rErr } = await supabase
    .from("media")
    .select("id, event_id, file_url")
    .eq("id", mediaId)
    .maybeSingle()

  if (rErr || !row) {
    return { error: "Medya bulunamadı." }
  }

  const { data: ev } = await supabase
    .from("events")
    .select("host_id")
    .eq("id", row.event_id)
    .maybeSingle()

  if (ev?.host_id !== user.id) {
    return { error: "Yetkisiz." }
  }

  const { error } = await supabase
    .from("media")
    .update({ status: "approved" })
    .eq("id", mediaId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/events/${row.event_id}`)
  return { ok: true }
}

export const rejectMedia = async (mediaId: string) => {
  const supabase = createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Oturum gerekli." }
  }

  const { data: row, error: rErr } = await supabase
    .from("media")
    .select("id, event_id, file_url")
    .eq("id", mediaId)
    .maybeSingle()

  if (rErr || !row) {
    return { error: "Medya bulunamadı." }
  }

  const { data: ev } = await supabase
    .from("events")
    .select("host_id")
    .eq("id", row.event_id)
    .maybeSingle()

  if (ev?.host_id !== user.id) {
    return { error: "Yetkisiz." }
  }

  await supabase.storage.from("media").remove([row.file_url])
  const { error } = await supabase.from("media").delete().eq("id", mediaId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/events/${row.event_id}`)
  return { ok: true }
}

export type ZipSourceItem = { name: string; url: string }

export const getZipSourcesForEvent = async (
  eventId: string
): Promise<{ error?: string; items?: ZipSourceItem[] }> => {
  const supabase = createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Oturum gerekli." }
  }

  const { data: ev } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("host_id", user.id)
    .maybeSingle()

  if (!ev) {
    return { error: "Etkinlik bulunamadı." }
  }

  const { data: rows } = await supabase
    .from("media")
    .select("id, file_url, file_type")
    .eq("event_id", eventId)
    .order("uploaded_at", { ascending: true })

  const items: ZipSourceItem[] = []

  for (const m of rows ?? []) {
    const { data: signed } = await supabase.storage
      .from("media")
      .createSignedUrl(m.file_url, 7200)

    if (!signed?.signedUrl) {
      continue
    }

    const leaf = m.file_url.includes("/")
      ? m.file_url.split("/").pop()
      : m.file_url
    const name = leaf && leaf.length > 0 ? leaf : `${m.id}-media`

    items.push({
      name,
      url: signed.signedUrl
    })
  }

  return { items }
}
