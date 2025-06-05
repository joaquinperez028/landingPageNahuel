# Landing Page Nahuel Lozano

Sitio web completo para servicios de trading e inversiones con Next.js, TypeScript, MongoDB y MUX.

## 🚀 Características

- **Autenticación con Google** usando NextAuth.js
- **Sistema de Alertas** (Trader Call, Smart Money, CashFlow)
- **Entrenamientos** de Trading, Crypto y Forex
- **Asesorías** personalizadas
- **Recursos** educativos
- **Pasarela de pagos** con Stripe y Mobbex
- **Videos** integrados con MUX
- **Dashboard administrador** completo
- **Diseño responsivo** mobile-first

## 🛠 Tecnologías

- **Frontend**: Next.js 14, TypeScript, React, Framer Motion
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Autenticación**: NextAuth.js con Google OAuth
- **Pagos**: Stripe, Mobbex
- **Videos**: MUX Video Streaming
- **Estilos**: CSS Modules, CSS Variables
- **Deployment**: Vercel

## 📦 Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd landingPageNahuel
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
Copia el archivo `env.example` a `.env.local` y configura las variables:

```bash
cp env.example .env.local
```

### Variables de entorno requeridas:

#### MongoDB
```
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/database
```

#### Google OAuth
```
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
```

#### NextAuth
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_secret_muy_seguro_min_32_caracteres
```

#### MUX (Videos)
```
MUX_TOKEN_ID=tu_mux_token_id
MUX_TOKEN_SECRET=tu_mux_token_secret
```

#### Stripe (Pagos)
```
STRIPE_SECRET_KEY=sk_test_tu_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_tu_stripe_publishable_key
```

#### Mobbex (Pagos alternativos)
```
MOBBEX_API_KEY=tu_mobbex_api_key
MOBBEX_ACCESS_TOKEN=tu_mobbex_access_token
```

## 🏃‍♂️ Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🏗 Construir para producción

```bash
npm run build
npm start
```

## 📁 Estructura del proyecto

```
/
├── components/          # Componentes React reutilizables
│   ├── Navbar.tsx      # Navegación principal
│   ├── Footer.tsx      # Pie de página
│   ├── Carousel.tsx    # Carrusel de imágenes
│   └── VideoPlayerMux.tsx # Reproductor MUX
├── lib/                # Funciones auxiliares
│   ├── mongodb.ts      # Conexión MongoDB
│   ├── googleAuth.ts   # Configuración NextAuth
│   ├── mux.ts          # Configuración MUX
│   └── payments.ts     # Stripe y Mobbex
├── models/             # Modelos MongoDB (Mongoose)
│   ├── User.ts         # Modelo Usuario
│   ├── Alert.ts        # Modelo Alerta
│   ├── Training.ts     # Modelo Entrenamiento
│   ├── Advisory.ts     # Modelo Asesoría
│   ├── Resource.ts     # Modelo Recurso
│   └── Billing.ts      # Modelo Facturación
├── pages/              # Páginas Next.js
│   ├── api/            # API Routes
│   │   ├── auth/       # Autenticación
│   │   ├── alerts.ts   # CRUD Alertas
│   │   └── subscribe.ts # Suscripciones
│   ├── index.tsx       # Página principal
│   └── _app.tsx        # App principal
├── styles/             # Estilos CSS
│   ├── globals.css     # Estilos globales
│   ├── Home.module.css # Estilos página principal
│   ├── Navbar.module.css # Estilos navegación
│   ├── Footer.module.css # Estilos footer
│   └── Carousel.module.css # Estilos carrusel
└── types/              # Tipos TypeScript
    └── mux.d.ts        # Tipos MUX
```

## 🔐 Configuración de servicios

### 1. MongoDB Atlas
1. Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crear cluster y base de datos
3. Obtener string de conexión
4. Configurar `MONGODB_URI`

### 2. Google OAuth
1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear proyecto y habilitar Google+ API
3. Crear credenciales OAuth 2.0
4. Configurar URLs autorizadas:
   - Desarrollo: `http://localhost:3000/api/auth/callback/google`
   - Producción: `https://tudominio.com/api/auth/callback/google`

### 3. MUX Video
1. Crear cuenta en [MUX](https://mux.com/)
2. Generar API tokens
3. Configurar `MUX_TOKEN_ID` y `MUX_TOKEN_SECRET`

### 4. Stripe
1. Crear cuenta en [Stripe](https://stripe.com/)
2. Obtener claves de API (test y live)
3. Configurar webhooks para `/api/webhooks/stripe`

### 5. Mobbex (Argentina/Uruguay)
1. Crear cuenta en [Mobbex](https://mobbex.com/)
2. Obtener API key y access token
3. Configurar webhook para `/api/webhooks/mobbex`

## 🚀 Deploy en Vercel

1. **Conectar repositorio**
   - Importar proyecto desde GitHub en [Vercel](https://vercel.com)

2. **Configurar variables de entorno**
   - Ir a Settings > Environment Variables
   - Agregar todas las variables de producción

3. **Deploy automático**
   - Cada push a `main` despliega automáticamente

## 📚 Funcionalidades principales

### Home Page
- Hero section con video MUX
- Carrusel de empresas asociadas
- Servicios destacados
- Testimonios de clientes
- Call-to-action

### Sistema de Alertas
- **Vista pública**: Información básica y métricas
- **Vista suscriptor**: Alertas completas, dashboard, comunidad
- Tres tipos: Trader Call, Smart Money, CashFlow
- Sistema de suscripción con pagos

### Entrenamientos
- Entrenamientos de Trading, Crypto y Forex
- Videos explicativos con MUX
- Calendario de próximos entrenamientos
- Sistema de inscripción
- Integración con Google Calendar

### Asesorías
- Consultorio Financiero (sesiones individuales)
- Cuenta Asesorada (gestión de portafolio)
- Formularios de solicitud
- Calendario de disponibilidad

### Dashboard Administrador
- Gestión de usuarios y roles
- CRUD de alertas, entrenamientos y recursos
- Métricas y analytics
- Generación de reportes de facturación

## 🎨 Personalización

### Colores y temas
Editar variables CSS en `styles/globals.css`:

```css
:root {
  --primary-color: #2563eb;
  --secondary-color: #64748b;
  --accent-color: #f59e0b;
  /* ... más variables */
}
```

### Componentes
Los componentes están en `/components` y usan CSS Modules para estilos aislados.

## 🐛 Troubleshooting

### Error de variables de entorno
```bash
Error: Por favor define las variables de entorno...
```
**Solución**: Verificar que todas las variables estén configuradas en `.env.local`

### Error de conexión MongoDB
```bash
MongoNetworkError: failed to connect to server
```
**Solución**: Verificar string de conexión y whitelist de IPs en MongoDB Atlas

### Error MUX player
```bash
Error cargando MUX player
```
**Solución**: Verificar tokens MUX y que el playback ID sea válido

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📞 Soporte

Para soporte técnico, contactar a: [tu-email@ejemplo.com]

---

**Desarrollado con ❤️ para Nahuel Lozano**