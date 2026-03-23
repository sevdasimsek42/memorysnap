import type { SupabaseClient } from "@supabase/supabase-js"

const blockedLevels = new Set(["LIKELY", "VERY_LIKELY"])
const flaggedLevels = new Set(["POSSIBLE"])

/**
 * Görseller için Google Vision SafeSearch; videolar için durum ataması.
 * API anahtarı yoksa veya hata olursa pending bırakılır.
 */
export const runSafeSearchAndUpdateMedia = async (
  admin: SupabaseClient,
  mediaId: string,
  storagePath: string,
  isVideo: boolean,
  requiresModeration: boolean
) => {
  if (isVideo) {
    const status = requiresModeration ? "pending" : "approved"
    await admin.from("media").update({ status }).eq("id", mediaId)
    return
  }

  const apiKey = process.env.GOOGLE_VISION_API_KEY
  if (!apiKey) {
    await admin.from("media").update({ status: "pending" }).eq("id", mediaId)
    return
  }

  const { data: fileBlob, error: dlErr } = await admin.storage
    .from("media")
    .download(storagePath)

  if (dlErr || !fileBlob) {
    await admin.from("media").update({ status: "pending" }).eq("id", mediaId)
    return
  }

  const buffer = Buffer.from(await fileBlob.arrayBuffer())
  const base64 = buffer.toString("base64")

  let visionJson: {
    responses?: Array<{
      safeSearchAnnotation?: {
        adult?: string
        violence?: string
      }
    }>
  }

  try {
    const visionRes = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64 },
              features: [{ type: "SAFE_SEARCH_DETECTION" }]
            }
          ]
        })
      }
    )
    visionJson = await visionRes.json()
  } catch {
    await admin.from("media").update({ status: "pending" }).eq("id", mediaId)
    return
  }

  const safe = visionJson?.responses?.[0]?.safeSearchAnnotation
  if (!safe) {
    await admin.from("media").update({ status: "pending" }).eq("id", mediaId)
    return
  }

  const adult = safe.adult ?? "UNKNOWN"
  const violence = safe.violence ?? "UNKNOWN"

  let status: "approved" | "rejected" | "pending" = "approved"
  if (blockedLevels.has(adult) || blockedLevels.has(violence)) {
    status = "rejected"
  } else if (flaggedLevels.has(adult) || flaggedLevels.has(violence)) {
    status = "pending"
  }

  if (status === "rejected") {
    await admin.storage.from("media").remove([storagePath])
    await admin.from("media").delete().eq("id", mediaId)
    return
  }

  await admin.from("media").update({ status }).eq("id", mediaId)
}
