import './globals.css';
import { Space_Grotesk, Inter_Tight, JetBrains_Mono } from 'next/font/google';

const fontHeading = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const fontBody = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const fontMonoData = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-data',
  display: 'swap',
});

export const metadata = {
  title: 'GridSense AI — Power Grid Stability Risk Intelligence',
  description: 'Operator-grade contingency and stability risk analytics for high-penetration renewable integration.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fontHeading.variable} ${fontBody.variable} ${fontMonoData.variable} dark`}
    >
      <body className="bg-[var(--bg-base)] text-[var(--text-primary)] font-body antialiased selection:bg-[var(--accent)] selection:text-white">
        {children}
      </body>
    </html>
  );
}
