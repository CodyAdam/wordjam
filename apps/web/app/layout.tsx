import './globals.css';
import { uiFont } from '@/src/utils/fontLoader';
import { Analytics } from '@vercel/analytics/react';
export const metadata = {
  title: 'Wordjam',
  description: 'A multiplayer word game',
  openGraph: {
    type: 'website',
    description: 'A multiplayer word game',
    locale: 'en_US',
    url: 'https://wordjam.fun',
    title: 'Wordjam',
    countryName: 'United States',
    images: [
      {
        url: 'https://wordjam.fun/api/og',
        width: 1200,
        height: 600,
        alt: 'Wordjam',
      }
    ]
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={`h-full touch-none ${uiFont.className}`}>
      <body className='relative flex h-full items-center justify-center overflow-hidden'>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
