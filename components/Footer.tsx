import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/Footer.module.css';

/**
 * Componente Footer - Diseño idéntico a la imagen proporcionada
 */
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerContent}>
          {/* Logo y descripción */}
          <div className={styles.footerBrand}>
            <div className={styles.logoContainer}>
              <Image
                src="/logos/logo notificaciones.png"
                alt="Lozano Nahuel Logo"
                width={180}
                height={180}
                className={styles.footerLogo}
              />
            </div>
            <p className={styles.brandDescription}>
              Desde 2016 promoviendo la educación financiera para mejorar la calidad de vida de las personas
            </p>
          </div>

          {/* Alertas */}
          <div className={styles.linkColumn}>
            <h4 className={styles.columnTitle}>Alertas</h4>
            <ul className={styles.linkList}>
              <li><Link href="/alertas/trader-call" className={styles.footerLink}>Trader Call</Link></li>
              <li><Link href="/alertas/smart-money" className={styles.footerLink}>Smart Money</Link></li>
              <li><Link href="/alertas/cash-flow" className={styles.footerLink}>CashFlow</Link></li>
            </ul>
          </div>

          {/* Entrenamientos */}
          <div className={styles.linkColumn}>
            <h4 className={styles.columnTitle}>Entrenamientos</h4>
            <ul className={styles.linkList}>
              <li><Link href="/entrenamientos/swing-trading" className={styles.footerLink}>Swing Trading</Link></li>
              <li><Link href="/entrenamientos/advanced" className={styles.footerLink}>Swing Trading</Link></li>
            </ul>
          </div>

          {/* Asesorías */}
          <div className={styles.linkColumn}>
            <h4 className={styles.columnTitle}>Asesorías</h4>
            <ul className={styles.linkList}>
              <li><Link href="/asesorias/consultorio-financiero" className={styles.footerLink}>Consultorio Financiero</Link></li>
              <li><Link href="/asesorias/cuenta-asesorada" className={styles.footerLink}>Cuenta Asesorada</Link></li>
            </ul>
          </div>

          {/* Recursos */}
          <div className={styles.linkColumn}>
            <h4 className={styles.columnTitle}>Recursos</h4>
            <ul className={styles.linkList}>
              <li><Link href="https://tradingview.com" target="_blank" className={styles.footerLink}>TradingView</Link></li>
              <li><Link href="/recursos" className={styles.footerLink}>Links para Traders</Link></li>
              <li><Link href="/recursos" className={styles.footerLink}>Material Complementario</Link></li>
            </ul>
          </div>

          {/* Empresa */}
          <div className={styles.linkColumn}>
            <h4 className={styles.columnTitle}>Empresa</h4>
            <ul className={styles.linkList}>
              <li><Link href="/contacto" className={styles.footerLink}>Contacto</Link></li>
              <li><Link href="/terminos" className={styles.footerLink}>Términos y Condiciones</Link></li>
              <li><Link href="/privacidad" className={styles.footerLink}>Políticas de Privacidad</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer bottom */}
        <div className={styles.footerBottom}>
          <div className={styles.footerBottomContent}>
            <p className={styles.copyright}>
              © {currentYear} Nahuel Lozano. Todos los derechos reservados.
            </p>
            
            <div className={styles.socialLinks}>
              <a href="https://youtube.com/@nahuellozano" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <div className={styles.socialIcon} style={{ backgroundColor: '#FF0000' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a2.869 2.869 0 0 0-2.018-2.031C19.622 3.742 12 3.742 12 3.742s-7.622 0-9.48.413a2.869 2.869 0 0 0-2.018 2.031C0 8.07 0 12 0 12s0 3.93.502 5.814a2.869 2.869 0 0 0 2.018 2.031C4.378 20.258 12 20.258 12 20.258s7.622 0 9.48-.413a2.869 2.869 0 0 0 2.018-2.031C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.609 15.609v-7.218L15.327 12l-5.718 3.609z"/>
                  </svg>
                </div>
              </a>
              
              <a href="https://twitter.com/nahuellozano" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <div className={styles.socialIcon} style={{ backgroundColor: '#000000' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
              </a>
              
              <a href="https://tiktok.com/@nahuellozano" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <div className={styles.socialIcon} style={{ backgroundColor: '#00d9ff' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.321 5.562a5.124 5.124 0 0 1-.443-.258 6.228 6.228 0 0 1-1.137-.966c-.849-.849-1.342-1.956-1.411-3.338h-3.064v13.2a3.847 3.847 0 1 1-3.847-3.847c.349 0 .686.047 1.006.133V7.292c-2.22-.225-4.006 1.438-4.006 3.7 0 2.128 1.719 3.847 3.847 3.847a3.847 3.847 0 0 0 3.847-3.847V8.067a7.95 7.95 0 0 0 4.208 1.175V6.178c-.49 0-.969-.078-1.412-.226a5.857 5.857 0 0 1-1.588-.39z"/>
                  </svg>
                </div>
              </a>
              
              <a href="https://instagram.com/nahuellozano" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <div className={styles.socialIcon} style={{ backgroundColor: '#E4405F' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
              </a>
              
              <a href="https://t.me/nahuellozano" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <div className={styles.socialIcon} style={{ backgroundColor: '#0088cc' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </div>
              </a>
              
              <a href="https://linkedin.com/in/nahuellozano" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <div className={styles.socialIcon} style={{ backgroundColor: '#0077B5' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 