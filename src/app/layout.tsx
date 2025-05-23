import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Analytics } from '@vercel/analytics/next';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BookMarket - Buy and Sell Books',
  description: 'Your trusted marketplace for buying and selling books. Connect with fellow readers and expand your collection.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8399483669564402"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#060013] text-white`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
