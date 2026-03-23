"use client"

import { useFormState } from "react-dom"

import {
  updateEvent,
  type EventActionState
} from "@/app/actions/events"
import type { EventRow } from "@/types/event"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const initialState: EventActionState = { error: null }

type EditEventFormProps = {
  event: EventRow
}

const EditEventForm = ({ event }: EditEventFormProps) => {
  const [state, formAction] = useFormState(updateEvent, initialState)

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="event_id" value={event.id} />
      <div className="space-y-2">
        <label
          htmlFor="title"
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          Etkinlik adı
        </label>
        <Input
          id="title"
          name="title"
          type="text"
          required
          minLength={2}
          defaultValue={event.title}
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "edit-event-error" : undefined}
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="description"
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          Açıklama
        </label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={event.description ?? ""}
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="event_date"
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          Tarih
        </label>
        <Input
          id="event_date"
          name="event_date"
          type="date"
          defaultValue={event.event_date ?? ""}
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="cover_image_url"
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          Kapak görseli URL
        </label>
        <Input
          id="cover_image_url"
          name="cover_image_url"
          type="url"
          defaultValue={event.cover_image_url ?? ""}
          placeholder="https://..."
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="is_active"
          name="is_active"
          type="checkbox"
          defaultChecked={event.is_active}
          className="h-4 w-4 rounded border-neutral-300"
        />
        <label
          htmlFor="is_active"
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          Etkinlik aktif (QR ile yükleme açık)
        </label>
      </div>
      <p className="text-xs text-neutral-500">
        Kalıcı adres: <span className="font-mono">{event.slug}</span> (değiştirilemez)
      </p>
      {state.error ? (
        <p
          id="edit-event-error"
          className="text-sm text-destructive"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      <Button type="submit">Kaydet</Button>
    </form>
  )
}

export { EditEventForm }
