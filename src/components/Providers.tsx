'use client';

import { ThemeProvider } from '@/contexts/ThemeContext';
import Navbar from '@/components/Navbar';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
        <Navbar />
        <main>{children}</main>
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} BookMarket. All rights reserved.
            </p>
          </div>
        </footer>
    </ThemeProvider>
  );
} 