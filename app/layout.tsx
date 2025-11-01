import type React from "react"
import "./globals.css"
import { Quicksand } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

// Initialize the Quicksand font
const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata = {
  title: "Echo Frequency - Musical Journey",
  description: "A musical journey across cultures and languages",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={quicksand.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
