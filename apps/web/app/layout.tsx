import './globals.css';
import { uiFont } from '@/src/utils/fontLoader';

export const metadata = {
  title: 'Wordjam',
  description: 'A multiplayer word game',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: 0,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={`h-full touch-none ${uiFont.className}`}>
      <body className='relative flex h-full items-center justify-center overflow-hidden'>{children}</body>
    </html>
  );
}
