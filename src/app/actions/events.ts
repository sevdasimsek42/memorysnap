"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { createSlugCandidate } from "@/lib/slug"

export type EventActionState = {
  error?: string | null
}

const slugConflictCode = "23505"

export const createEvent = async (
  _prev: EventActionState,
  formData: FormData
): Promise<EventActionState> => {
  const supabase = createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Oturum gerekli." }
  }

  const title = (formData.get("title") as string)?.trim()
  if (!title || title.length < 2) {
    return { error: "Başlık en az 2 karakter olmalıdır." }
  }

  const description = (formData.get("description") as string)?.trim() || null
  const eventDateRaw = (formData.get("event_date") as string)?.trim()
  const event_date = eventDateRaw ? eventDateRaw : null
  const cover_image_url =
    (formData.get("cover_image_url") as string)?.trim() || null

  for (let attempt = 0; attempt < 10; attempt++) {
    const slug = createSlugCandidate()
    const { error } = await supabase.from("events").insert({
      host_id: user.id,
      title,
      description,
      event_date,
      cover_image_url,
      slug,
      template_id: null,
      template_config: null,
      is_active: true,
      requires_moderation: true
    })

    if (!error) {
      revalidatePath("/dashboard")
      redirect("/dashboard")
    }

    if (error.code !== slugConflictCode) {
      return { error: error.message }
    }
  }

  return { error: "Benzersiz adres üretilemedi, tekrar deneyin." }
}

export const updateEvent = async (
  _prev: EventActionState,
  formData: FormData
): Promise<EventActionState> => {
  const supabase = createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Oturum gerekli." }
  }

  const eventId = formData.get("event_id") as string
  if (!eventId) {
    return { error: "Etkinlik bulunamadı." }
  }

  const title = (formData.get("title") as string)?.trim()
  if (!title || title.length < 2) {
    return { error: "Başlık en az 2 karakter olmalıdır." }
  }

  const description = (formData.get("description") as string)?.trim() || null
  const eventDateRaw = (formData.get("event_date") as string)?.trim()
  const event_date = eventDateRaw ? eventDateRaw : null
  const cover_image_url =
    (formData.get("cover_image_url") as string)?.trim() || null
  const is_active = formData.get("is_active") === "on"

  const { error } = await supabase
    .from("events")
    .update({
      title,
      description,
      event_date,
      cover_image_url,
      is_active
    })
    .eq("id", eventId)
    .eq("host_id", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  revalidatePath(`/dashboard/events/${eventId}`)
  redirect("/dashboard")
}

export type DeleteEventResult = { error?: string; ok?: boolean }

export const deleteEvent = async (
  eventId: string
): Promise<DeleteEventResult> => {
  const supabase = createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Oturum gerekli." }
  }

  const { data: files, error: listError } = await supabase.storage
    .from("media")
    .list(eventId, { limit: 1000 })

  if (listError) {
    return { error: listError.message }
  }

  if (files?.length) {
    const paths = files.map((f) => `${eventId}/${f.name}`)
    const { error: removeError } = await supabase.storage
      .from("media")
      .remove(paths)

    if (removeError) {
      return { error: removeError.message }
    }
  }

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId)
    .eq("host_id", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  return { ok: true }
}
