export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "video/mp4",
  "video/quicktime"
] as const

export const MAX_IMAGE_BYTES = 20 * 1024 * 1024
export const MAX_VIDEO_BYTES = 200 * 1024 * 1024
export const MAX_VIDEO_DURATION_SEC = 60

export const guessMimeFromFileName = (name: string): string | null => {
  const ext = name.split(".").pop()?.toLowerCase()
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    heic: "image/heic",
    mp4: "video/mp4",
    mov: "video/quicktime"
  }
  return ext ? map[ext] ?? null : null
}

const mimeToExt: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "video/mp4": "mp4",
  "video/quicktime": "mov"
}

export type MetaValidation =
  | { ok: true; ext: string; isVideo: boolean }
  | { ok: false; error: string }

export const validateUploadMeta = (
  contentType: string,
  fileSize: number
): MetaValidation => {
  const normalized = contentType.split(";")[0]?.trim().toLowerCase() ?? ""
  if (!ALLOWED_MIME_TYPES.includes(normalized as (typeof ALLOWED_MIME_TYPES)[number])) {
    return { ok: false, error: "Desteklenmeyen dosya türü." }
  }

  const ext = mimeToExt[normalized]
  if (!ext) {
    return { ok: false, error: "Desteklenmeyen dosya türü." }
  }

  const isVideo = normalized.startsWith("video/")
  const max = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES
  if (fileSize > max) {
    return {
      ok: false,
      error: isVideo
        ? "Video en fazla 200 MB olabilir."
        : "Görsel en fazla 20 MB olabilir."
    }
  }

  if (fileSize < 1) {
    return { ok: false, error: "Dosya boş." }
  }

  return { ok: true, ext, isVideo }
}
