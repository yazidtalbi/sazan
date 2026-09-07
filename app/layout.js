import localFont from 'next/font/local';
import './globals.css';

const garamond = localFont({
  src: [
    {
      path: '../public/fonts/GaramondNovaCond Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/GaramondNovaCond Italic.ttf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../public/fonts/GaramondNovaCond Bold.ttf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/GaramondNovaCond Bold Italic.ttf',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-serif',
  display: 'swap',
});

const helveticaNeue = localFont({
  src: [
    {
      path: '../public/fonts/HelveticaNeueRoman.otf',
      weight: '400',
      style: 'normal',
    },
  ],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata = {
  title: 'SAZAN ISLAND • Private Mediterranean Sanctuary',
  description: 'An exclusive private island in the Mediterranean where nature, architecture, and luxury life exist in perfect harmony.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${garamond.variable} ${helveticaNeue.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
