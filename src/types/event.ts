export type EventRow = {
  id: string
  host_id: string
  title: string
  description: string | null
  event_date: string | null
  cover_image_url: string | null
  template_id: string | null
  template_config: Record<string, unknown> | null
  slug: string
  is_active: boolean
  requires_moderation: boolean
  created_at: string
}

export type PublicEventRow = Pick<
  EventRow,
  "id" | "title" | "description" | "slug" | "event_date" | "requires_moderation"
>

export type EventWithMediaCount = EventRow & {
  media?: { count: number }[] | null
}
