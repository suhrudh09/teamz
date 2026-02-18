import type { Metadata } from 'next'
import { Orbitron, Rajdhani, Share_Tech_Mono } from 'next/font/google'
import './globals.css'

// Configure fonts
const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '600', '800'],
  display: 'swap',
})

const rajdhani = Rajdhani({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const shareTechMono = Share_Tech_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: '400',
  display: 'swap',
})

// Metadata for SEO
export const metadata: Metadata = {
  title: 'NITROUS — Stream Every Race on the Planet',
  description: 'The ultimate platform for motorsport, adventure racing & extreme sports. Stream live events, book VIP passes, and ride with the teams.',
  keywords: ['motorsport', 'racing', 'streaming', 'NASCAR', 'F1', 'Dakar', 'extreme sports'],
  openGraph: {
    title: 'NITROUS — Fuel Your Speed',
    description: 'Stream every race. Book every pass. Live every moment.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${orbitron.variable} ${rajdhani.variable} ${shareTechMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
