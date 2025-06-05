import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import ToasterProvider from '@/components/ToasterProvider';
import '@/styles/globals.css';

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <ToasterProvider>
        <Component {...pageProps} />
      </ToasterProvider>
    </SessionProvider>
  );
} 