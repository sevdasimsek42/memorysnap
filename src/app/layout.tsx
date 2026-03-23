import type { Metadata } from "next"
import { DM_Sans } from "next/font/google"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

import "./globals.css"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
})

export const metadata: Metadata = {
  title: "MemorySnap — Etkinlik fotoğraf albümü",
  description:
    "Düğün ve kutlamalarda misafir fotoğraflarını tek yerde toplayın. QR ile yükleme, kayıt gerekmez."
}

type RootLayoutProps = {
  children: React.ReactNode
}

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="tr" className={dmSans.variable}>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  )
}

export default RootLayout
