import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { ChevronDown, Menu, X, User, LogOut, Settings, Bell, MessageCircle } from 'lucide-react';
import NotificationDropdown from '@/components/NotificationDropdown';
import ContactForm from '@/components/ContactForm';
import styles from '@/styles/Navbar.module.css';

interface NavbarProps {
  /** @param className - Clases CSS adicionales */
  className?: string;
}

/**
 * Componente de navegación principal
 * Incluye menú desplegable para servicios y autenticación con Google
 */
const Navbar: React.FC<NavbarProps> = ({ className = '' }) => {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  // Obtener conteo de notificaciones
  const fetchNotificationCount = async () => {
    if (!session?.user?.email) return;
    
    try {
      const response = await fetch('/api/notifications/get?limit=1');
      if (response.ok) {
        const data = await response.json();
        setNotificationCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error al obtener conteo de notificaciones:', error);
    }
  };

  // Cargar conteo al iniciar sesión
  useEffect(() => {
    if (session?.user?.email) {
      fetchNotificationCount();
    }
  }, [session]);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  const navItems = [
    {
      label: 'Alertas',
      href: '/alertas',
      dropdown: [
        { label: 'Trader Call', href: '/alertas/trader-call' },
        { label: 'Smart Money', href: '/alertas/smart-money' },
        { label: 'CashFlow', href: '/alertas/cash-flow' },
      ],
    },
    {
      label: 'Entrenamientos',
      href: '/entrenamientos',
      dropdown: [
        { label: 'Swing Trading', href: '/entrenamientos/swing-trading' },
        { label: 'Dow Jones', href: '/entrenamientos/advanced' },
      ],
    },
    {
      label: 'Asesorías',
      href: '/asesorias',
      dropdown: [
        { label: 'Consultorio Financiero', href: '/asesorias/consultorio-financiero' },
        { label: 'Cuenta Asesorada', href: '/asesorias/cuenta-asesorada' },
      ],
    },
    {
      label: 'Recursos',
      href: '/recursos',
    },
  ];

  const handleDropdownToggle = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
    // Cerrar notificaciones y contacto si se abre otro dropdown
    if (label !== 'notifications') {
      setShowNotifications(false);
    }
    if (label !== 'contact') {
      setShowContactForm(false);
    }
  };

  const handleChevronClick = (e: React.MouseEvent, label: string) => {
    e.preventDefault();
    e.stopPropagation();
    handleDropdownToggle(label);
  };

  const handleNotificationToggle = () => {
    setShowNotifications(!showNotifications);
    // Cerrar otros dropdowns
    setOpenDropdown(null);
    setShowContactForm(false);
  };

  const handleContactToggle = () => {
    setShowContactForm(!showContactForm);
    // Cerrar otros dropdowns
    setOpenDropdown(null);
    setShowNotifications(false);
  };

  const handleLogin = () => {
    signIn('google');
  };

  const handleLogout = () => {
    signOut();
  };

  // Verificación defensiva para asegurar que session.user existe
  const sessionUser = session?.user;

  return (
    <>
      <nav className={`${styles.navbar} ${className}`}>
        <div className={styles.container}>
          {/* Logo Principal - Ahora con imagen */}
          <Link href="/" className={styles.logo}>
            <img 
              src="/logos/logo notificaciones.png" 
              alt="Nahuel Lozano Trading"
              className={styles.logoImage}
            />
          </Link>

          {/* Logo Mentoring - Posicionado después del logo principal */}
          <a 
            href="https://plataformacursos.lozanonahuel.com/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mentoringLogo}
            title="Ir a Plataforma de Mentoring"
          >
            <img 
              src="/logos/LOGOTIPO NARANJA SIN FONDO.png" 
              alt="Mentoring"
              className={styles.mentoringImage}
            />
          </a>

          {/* Desktop Navigation */}
          <div className={styles.desktopNav}>
            <div className={styles.navContent}>
              {/* Navigation Links */}
              <ul className={styles.navList}>
                {navItems.map((item) => (
                  <li
                    key={item.label}
                    className={styles.navItem}
                    onMouseEnter={() => {
                      if (item.dropdown) {
                        // Limpiar cualquier timeout pendiente
                        if (hoverTimeout) {
                          clearTimeout(hoverTimeout);
                          setHoverTimeout(null);
                        }
                        setOpenDropdown(item.label);
                      }
                    }}
                    onMouseLeave={() => {
                      if (item.dropdown) {
                        // Agregar un pequeño delay antes de cerrar
                        const timeout = setTimeout(() => {
                          setOpenDropdown(null);
                        }, 150);
                        setHoverTimeout(timeout);
                      }
                    }}
                  >
                    <div className={`${styles.navLink} ${item.dropdown ? styles.hasDropdown : ''}`}>
                      <Link
                        href={item.href}
                        className={styles.mainLink}
                      >
                        {item.label}
                      </Link>
                      {item.dropdown && (
                        <button
                          className={styles.chevronButton}
                          onClick={(e) => handleChevronClick(e, item.label)}
                        >
                          <ChevronDown 
                            size={16} 
                            className={`${styles.chevron} ${openDropdown === item.label ? styles.chevronOpen : ''}`}
                          />
                        </button>
                      )}
                    </div>

                    {/* Dropdown Menu */}
                    {item.dropdown && openDropdown === item.label && (
                      <div 
                        className={styles.dropdown}
                        onMouseEnter={() => {
                          // Limpiar cualquier timeout pendiente
                          if (hoverTimeout) {
                            clearTimeout(hoverTimeout);
                            setHoverTimeout(null);
                          }
                          setOpenDropdown(item.label);
                        }}
                        onMouseLeave={() => {
                          // Agregar un pequeño delay antes de cerrar
                          const timeout = setTimeout(() => {
                            setOpenDropdown(null);
                          }, 150);
                          setHoverTimeout(timeout);
                        }}
                      >
                        {item.dropdown.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.label}
                            href={dropdownItem.href}
                            className={styles.dropdownItem}
                          >
                            {dropdownItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* User Section */}
          <div className={styles.userSection}>
            {status === 'loading' ? (
              <div className={styles.spinner} />
            ) : session && sessionUser ? (
              <div className={styles.userActions}>
                {/* Contact Button */}
                <button
                  className={`${styles.contactButton} ${showContactForm ? styles.active : ''}`}
                  onClick={handleContactToggle}
                  title="Contactar"
                >
                  <MessageCircle size={20} />
                  <span className={styles.contactLabel}>Contacto</span>
                </button>

                {/* Notifications Button */}
                <div className={styles.notificationContainer}>
                  <button
                    className={`${styles.notificationButton} ${showNotifications ? styles.active : ''}`}
                    onClick={handleNotificationToggle}
                    title="Notificaciones"
                  >
                    <Bell size={20} />
                    {notificationCount > 0 && (
                      <span className={styles.notificationBadge}>
                        {notificationCount > 9 ? '9+' : notificationCount}
                      </span>
                    )}
                  </button>
                  
                  <NotificationDropdown 
                    isOpen={showNotifications}
                    onClose={() => setShowNotifications(false)}
                    onUpdate={fetchNotificationCount}
                  />
                </div>

                {/* User Menu */}
                <div className={styles.userMenu}>
                  <button
                    className={styles.userButton}
                    onClick={() => handleDropdownToggle('user')}
                  >
                    {sessionUser.image ? (
                      <img
                        src={sessionUser.image}
                        alt={sessionUser.name || 'Usuario'}
                        className={styles.userAvatar}
                        onError={(e) => {
                          // Si falla la carga de la imagen, ocultar y mostrar icono
                          e.currentTarget.style.display = 'none';
                          const fallbackIcon = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                          if (fallbackIcon) {
                            (fallbackIcon as HTMLElement).style.display = 'inline-flex';
                          }
                        }}
                      />
                    ) : null}
                    <User 
                      size={20} 
                      className="fallback-icon"
                      style={{ display: sessionUser.image ? 'none' : 'inline-flex' }}
                    />
                    <span className={styles.userName}>{sessionUser.name}</span>
                    <ChevronDown 
                      size={16} 
                      className={`${styles.chevron} ${openDropdown === 'user' ? styles.chevronOpen : ''}`}
                    />
                  </button>

                  {openDropdown === 'user' && (
                    <div className={styles.userDropdown}>
                      <Link href="/perfil" className={styles.dropdownItem}>
                        <User size={16} />
                        Mi Perfil
                      </Link>
                      {sessionUser.role === 'admin' && (
                        <>
                          <Link href="/admin/dashboard" className={styles.dropdownItem}>
                            <Settings size={16} />
                            Panel de Administración
                          </Link>
                          <Link href="/admin/notifications" className={styles.dropdownItem}>
                            <Bell size={16} />
                            Gestión de Notificaciones
                          </Link>
                        </>
                      )}
                      <button onClick={handleLogout} className={styles.dropdownItem}>
                        <LogOut size={16} />
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button onClick={handleLogin} className={styles.loginButton}>
                Iniciar Sesión
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={styles.mobileMenuButton}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className={styles.mobileMenu}>
            <div className={styles.mobileMenuContent}>
              {/* Mobile Mentoring Logo */}
              <div className={styles.mobileNavItem}>
                <a 
                  href="https://plataformacursos.lozanonahuel.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.mobileMentoringLogo}
                  onClick={() => setIsMenuOpen(false)}
                  title="Ir a Plataforma de Mentoring"
                >
                  <img 
                    src="/logos/LOGOTIPO NARANJA SIN FONDO.png" 
                    alt="Mentoring"
                    className={styles.mobileMentoringImage}
                  />
                  <span>Mentoring</span>
                </a>
              </div>

              {navItems.map((item) => (
                <div key={item.label} className={styles.mobileNavItem}>
                  <div className={styles.mobileNavLinkContainer}>
                    <Link
                      href={item.href}
                      className={styles.mobileNavLink}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                    {item.dropdown && (
                      <button
                        className={styles.mobileChevronButton}
                        onClick={() => handleDropdownToggle(`mobile-${item.label}`)}
                      >
                        <ChevronDown 
                          size={16} 
                          className={`${styles.chevron} ${openDropdown === `mobile-${item.label}` ? styles.chevronOpen : ''}`}
                        />
                      </button>
                    )}
                  </div>
                  
                  {/* Mobile Dropdown */}
                  {item.dropdown && openDropdown === `mobile-${item.label}` && (
                    <div className={styles.mobileDropdown}>
                      {item.dropdown.map((dropdownItem) => (
                        <Link
                          key={dropdownItem.label}
                          href={dropdownItem.href}
                          className={styles.mobileDropdownItem}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {dropdownItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Mobile User Section */}
              <div className={styles.mobileUserSection}>
                {session && sessionUser ? (
                  <>
                    {/* Mobile Contact Button */}
                    <button 
                      onClick={() => { 
                        handleContactToggle(); 
                        setIsMenuOpen(false); 
                      }} 
                      className={styles.mobileNavLink}
                    >
                      <MessageCircle size={16} />
                      Contacto
                    </button>
                    
                    <Link href="/perfil" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
                      {sessionUser.image ? (
                        <img
                          src={sessionUser.image}
                          alt={sessionUser.name || 'Usuario'}
                          className={styles.userAvatar}
                          style={{ width: '16px', height: '16px' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallbackIcon = e.currentTarget.nextElementSibling;
                            if (fallbackIcon) {
                              (fallbackIcon as HTMLElement).style.display = 'inline-flex';
                            }
                          }}
                        />
                      ) : null}
                      <User 
                        size={16} 
                        style={{ display: sessionUser.image ? 'none' : 'inline-flex' }}
                      />
                      Mi Perfil
                    </Link>
                    {sessionUser.role === 'admin' && (
                      <>
                        <Link href="/admin/dashboard" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
                          <Settings size={16} />
                          Panel de Administración
                        </Link>
                        <Link href="/admin/notifications" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
                          <Bell size={16} />
                          Gestión de Notificaciones
                        </Link>
                      </>
                    )}
                    <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className={styles.mobileNavLink}>
                      <LogOut size={16} />
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <button onClick={() => { handleLogin(); setIsMenuOpen(false); }} className={styles.mobileNavLink}>
                    Iniciar Sesión
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Contact Form Modal */}
      <ContactForm 
        isOpen={showContactForm} 
        onClose={() => setShowContactForm(false)} 
      />
    </>
  );
};

export default Navbar;