import './globals.css';
import { uiFont } from '@/src/utils/fontLoader';

export const metadata = {
  title: 'Wordjam',
  description: 'A multiplayer word game',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={`h-full ${uiFont.className}`}>
      <meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0'></meta>
      <body className='relative flex h-full items-center justify-center overflow-hidden'>{children}</body>
    </html>
  );
}
