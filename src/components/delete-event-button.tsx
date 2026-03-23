"use client"

import { useRouter } from "next/navigation"

import { deleteEvent } from "@/app/actions/events"
import { Button } from "@/components/ui/button"

type DeleteEventButtonProps = {
  eventId: string
}

const DeleteEventButton = ({ eventId }: DeleteEventButtonProps) => {
  const router = useRouter()

  const handleClick = async () => {
    if (
      !confirm(
        "Bu etkinlik ve veritabanındaki medya kayıtları kalıcı olarak silinir. Devam edilsin mi?"
      )
    ) {
      return
    }

    const result = await deleteEvent(eventId)
    if (result.error) {
      alert(result.error)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <Button type="button" variant="destructive" onClick={handleClick}>
      Etkinliği sil
    </Button>
  )
}

export { DeleteEventButton }
