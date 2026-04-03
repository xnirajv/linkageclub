import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Providers } from './providers';
import dns from 'dns';

dns.setServers(["1.1.1.1" , "8.8.8.8"])

export const metadata: Metadata = {
  title: {
    default: 'InternHub - India\'s #1 AI-Powered Tech Talent Ecosystem',
    template: '%s | InternHub',
  },
  description: 'From Learning to Earning - Everything in One Platform. Learn skills, get verified, work on real projects, and get hired.',
  keywords: [
    'internship',
    'jobs',
    'tech talent',
    'AI matching',
    'skill assessment',
    'mentorship',
    'India internships',
    'tech jobs India',
  ],
  authors: [{ name: 'InternHub Team' }],
  creator: 'InternHub',
  publisher: 'InternHub',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'InternHub - India\'s #1 AI-Powered Tech Talent Ecosystem',
    description: 'From Learning to Earning - Everything in One Platform',
    url: 'https://internhub.com',
    siteName: 'InternHub',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'InternHub - AI-Powered Tech Talent Ecosystem',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InternHub - India\'s #1 AI-Powered Tech Talent Ecosystem',
    description: 'From Learning to Earning - Everything in One Platform',
    images: ['/og-image.png'],
    creator: '@internhub',
    site: '@internhub',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
