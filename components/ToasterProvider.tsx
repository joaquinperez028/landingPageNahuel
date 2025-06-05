'use client';

import { useEffect, useState } from 'react';

interface ToasterProviderProps {
  children?: React.ReactNode;
}

export default function ToasterProvider({ children }: ToasterProviderProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  // Importación dinámica para evitar problemas de SSR
  const Toaster = require('react-hot-toast').Toaster;

  return (
    <>
      {children}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </>
  );
} 