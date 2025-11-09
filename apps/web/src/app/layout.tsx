import type { Metadata } from 'next';
import Script from 'next/script';
import { AnimatePresence } from 'framer-motion';
import './globals.css';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { LiveChatWidget } from '../components/LiveChatWidget';
import { LenisProvider } from '../contexts/LenisContext';
import { NotificationProvider } from '../components/ui/NotificationCenter';

export const metadata: Metadata = {
  title: 'TB Group — Облачные решения для бизнеса',
  description: 'Внедрение Мой Склад, Битрикс24 и телефонии под ключ.',
};

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="bg-slate-950 text-slate-100">
        <NotificationProvider>
          <LenisProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                <AnimatePresence mode="wait">
                  {children}
                </AnimatePresence>
              </main>
              <Footer />
              <LiveChatWidget />
            </div>
          </LenisProvider>
        </NotificationProvider>
        {RECAPTCHA_SITE_KEY && (
          <Script
            src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
