"use client"

import { useFormState } from "react-dom"

import {
  createEvent,
  type EventActionState
} from "@/app/actions/events"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const initialState: EventActionState = { error: null }

const CreateEventForm = () => {
  const [state, formAction] = useFormState(createEvent, initialState)

  return (
    <form action={formAction} className="space-y-4">
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
          placeholder="Örn. Ayşe ve Mehmet düğünü"
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "create-event-error" : undefined}
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="description"
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          Açıklama (isteğe bağlı)
        </label>
        <Textarea
          id="description"
          name="description"
          placeholder="Kısa bir not ekleyebilirsiniz."
          rows={4}
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="event_date"
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          Tarih (isteğe bağlı)
        </label>
        <Input id="event_date" name="event_date" type="date" />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="cover_image_url"
          className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          Kapak görseli URL (isteğe bağlı)
        </label>
        <Input
          id="cover_image_url"
          name="cover_image_url"
          type="url"
          placeholder="https://..."
        />
      </div>
      {state.error ? (
        <p
          id="create-event-error"
          className="text-sm text-destructive"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="w-full sm:w-auto">
        Etkinliği oluştur
      </Button>
    </form>
  )
}

export { CreateEventForm }
