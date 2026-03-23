import Link from "next/link"

import { Button } from "@/components/ui/button"

const PrivacyPage = () => {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
        Gizlilik politikası
      </h1>
      <p className="mt-2 text-sm text-neutral-500">Son güncelleme: Mart 2025</p>

      <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
        <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          MemorySnap; düğün, doğum günü ve benzeri etkinliklerde misafirlerin
          fotoğraf ve video paylaşmasına olanak tanır. Bu metin, KVKK ve GDPR
          kapsamında bilgilendirme amaçlıdır ve hukuki danışmanlık yerine geçmez.
        </p>

        <h2 className="mt-8 text-lg font-medium text-neutral-900 dark:text-neutral-50">
          Veri sorumlusu
        </h2>
        <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
          Etkinlik sahibi (hesap oluşturan kullanıcı), kendi etkinliği ve bu
          etkinliğe yüklenen içerikler için veri sorumlusu sıfatıyla hareket eder.
          Platform işletmecisi, teknik altyapıyı sağlar.
        </p>

        <h2 className="mt-8 text-lg font-medium text-neutral-900 dark:text-neutral-50">
          Toplanan veriler
        </h2>
        <ul className="mt-2 list-inside list-disc text-sm text-neutral-700 dark:text-neutral-300">
          <li>
            <strong>Host:</strong> hesap için e-posta ve kimlik doğrulama
            bilgileri (Supabase Auth).
          </li>
          <li>
            <strong>Misafir:</strong> yüklenen fotoğraf/video dosyaları; isteğe
            bağlı olarak belirttiğiniz isim.
          </li>
          <li>
            <strong>Teknik:</strong> güvenlik ve kötüye kullanım önleme için
            sınırlı oranda günlük ve IP tabanlı hız sınırı bilgisi.
          </li>
        </ul>

        <h2 className="mt-8 text-lg font-medium text-neutral-900 dark:text-neutral-50">
          Amaçlar
        </h2>
        <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
          Veriler; etkinlik albümünü oluşturmak, içerik moderasyonu uygulamak,
          kötüye kullanımı azaltmak ve hizmeti sunmak için işlenir.
        </p>

        <h2 className="mt-8 text-lg font-medium text-neutral-900 dark:text-neutral-50">
          Haklarınız
        </h2>
        <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
          KVKK ve GDPR kapsamında; erişim, düzeltme, silme, itiraz ve veri
          taşınabilirliği haklarınızı kullanmak için veri sorumlusu (etkinlik
          sahibi) veya platform ile iletişime geçebilirsiniz.
        </p>

        <h2 className="mt-8 text-lg font-medium text-neutral-900 dark:text-neutral-50">
          Saklama
        </h2>
        <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300">
          İçerik, etkinlik sahibi silene veya hesabını kapatana kadar veya
          hizmet politikaları uyarınca saklanabilir.
        </p>
      </div>

      <Button className="mt-10" variant="outline" asChild>
        <Link href="/">Ana sayfa</Link>
      </Button>
    </div>
  )
}

export default PrivacyPage
