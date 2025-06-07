import type { AppProps } from 'next/app';
import Head from 'next/head';
import { SessionProvider } from 'next-auth/react';
import ToasterProvider from '@/components/ToasterProvider';
import LoginTracker from '@/components/LoginTracker';
import '@/styles/globals.css';

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>Nahuel Lozano | Trading y Mercados Financieros</title>
        <meta name="description" content="Especialista en trading y mercados financieros. Alertas, entrenamientos, asesorías y recursos profesionales." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/logos/logo-nahuel.png" />
        <link rel="apple-touch-icon" href="/logos/logo-nahuel.png" />
        <meta name="theme-color" content="#3b82f6" />
      </Head>
      <ToasterProvider>
        <LoginTracker />
        <Component {...pageProps} />
      </ToasterProvider>
    </SessionProvider>
  );
} 