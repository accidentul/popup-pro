import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import { Sparkles, Menu, X } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ExitIntent Pro - Exit-Intent Popup Builder for Shopify',
  description: 'Build and manage exit-intent popups for your Shopify store. Capture abandoning visitors and boost conversions.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Global Navigation - Only show on non-landing pages */}
        {children}
      </body>
    </html>
  )
}

