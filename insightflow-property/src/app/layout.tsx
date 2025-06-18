import React from 'react'
import './globals.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'InsightFlow Property - Document Review Assistant',
  description: 'AI-assisted property document review to help you prepare better questions for professionals.',
  keywords: 'property, document review, AI assistant, property buying, legal documents',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-slate-50">
          {children}
        </div>
      </body>
    </html>
  )
}
