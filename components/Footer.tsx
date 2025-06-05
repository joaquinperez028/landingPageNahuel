import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import styles from '@/styles/Footer.module.css';

/**
 * Componente Footer
 * Contiene enlaces de navegación, información de contacto y redes sociales
 */
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    servicios: [
      { label: 'Trader Call', href: '/alertas/trader-call' },
      { label: 'Smart Money', href: '/alertas/smart-money' },
      { label: 'CashFlow', href: '/alertas/cash-flow' },
      { label: 'Trading', href: '/entrenamientos/trading' },
      { label: 'Crypto', href: '/entrenamientos/crypto' },
      { label: 'Forex', href: '/entrenamientos/forex' },
    ],
    empresa: [
      { label: 'Sobre Nahuel', href: '/sobre-mi' },
      { label: 'Contacto', href: '/contacto' },
      { label: 'Términos y Condiciones', href: '/terminos' },
      { label: 'Política de Privacidad', href: '/privacidad' },
    ],
    recursos: [
      { label: 'Blog', href: '/recursos' },
      { label: 'Tutoriales', href: '/recursos?categoria=Tutoriales' },
      { label: 'Plantillas', href: '/recursos?categoria=Plantillas' },
      { label: 'Centro de Ayuda', href: '/ayuda' },
    ],
  };

  const redesSociales = [
    { 
      name: 'Twitter',
      icon: <Twitter size={20} />,
      href: 'https://twitter.com/nahuellozano',
      color: '#1DA1F2'
    },
    { 
      name: 'Instagram',
      icon: <Instagram size={20} />,
      href: 'https://instagram.com/nahuellozano',
      color: '#E4405F'
    },
    { 
      name: 'LinkedIn',
      icon: <Linkedin size={20} />,
      href: 'https://linkedin.com/in/nahuellozano',
      color: '#0077B5'
    },
    { 
      name: 'YouTube',
      icon: <Youtube size={20} />,
      href: 'https://youtube.com/@nahuellozano',
      color: '#FF0000'
    },
  ];

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerContent}>
          {/* Logo y descripción */}
          <div className={styles.footerBrand}>
            <Link href="/" className={styles.footerLogo}>
              <span className={styles.logoText}>Nahuel Lozano</span>
            </Link>
            <p className={styles.brandDescription}>
              Experto en trading y análisis financiero. Ayudando a inversores 
              a maximizar sus resultados en los mercados desde 2018.
            </p>
            
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <Mail size={16} />
                <span>contacto@lozanonahuel.com</span>
              </div>
              <div className={styles.contactItem}>
                <Phone size={16} />
                <span>+598 99 123 456</span>
              </div>
              <div className={styles.contactItem}>
                <MapPin size={16} />
                <span>Montevideo, Uruguay</span>
              </div>
            </div>
          </div>

          {/* Enlaces de navegación */}
          <div className={styles.footerLinks}>
            <div className={styles.linkColumn}>
              <h4>Servicios</h4>
              <ul>
                {footerLinks.servicios.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.linkColumn}>
              <h4>Empresa</h4>
              <ul>
                {footerLinks.empresa.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.linkColumn}>
              <h4>Recursos</h4>
              <ul>
                {footerLinks.recursos.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className={styles.newsletter}>
            <h4>Mantente actualizado</h4>
            <p>Recibe las últimas noticias del mercado y nuestras mejores estrategias.</p>
            <form className={styles.newsletterForm}>
              <input
                type="email"
                placeholder="Tu email"
                className={styles.newsletterInput}
                required
              />
              <button type="submit" className={styles.newsletterButton}>
                Suscribirme
              </button>
            </form>
          </div>
        </div>

        {/* Footer bottom */}
        <div className={styles.footerBottom}>
          <div className={styles.footerBottomContent}>
            <p className={styles.copyright}>
              © {currentYear} Nahuel Lozano. Todos los derechos reservados.
            </p>
            
            <div className={styles.socialLinks}>
              {redesSociales.map((red) => (
                <a
                  key={red.name}
                  href={red.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  style={{ color: red.color }}
                  aria-label={`Seguir en ${red.name}`}
                >
                  {red.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 