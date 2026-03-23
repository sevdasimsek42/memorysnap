/**
 * Basit IP + saat dilimi sınırı (ör. sunucu başına tek süreç).
 * Üretimde Redis / Upstash önerilir.
 */
/** prepare + finalize birlikte ~2 istek / dosya */
const MAX_PER_HOUR = 100
const store = new Map<string, number>()

export const checkUploadRateLimit = (ip: string) => {
  const hour = Math.floor(Date.now() / 3600000)
  const key = `${ip}:${hour}`
  const next = (store.get(key) ?? 0) + 1
  if (next > MAX_PER_HOUR) {
    return false
  }
  store.set(key, next)
  if (store.size > 10000) {
    store.clear()
  }
  return true
}
