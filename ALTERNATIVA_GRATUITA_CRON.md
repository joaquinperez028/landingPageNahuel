# 🚀 Alternativa Gratuita a Cron Jobs - setInterval + Hooks

## 📋 **¿Por qué no usamos Cron Jobs de Vercel?**

Los cron jobs de Vercel son **funcionalidades de pago** que requieren un plan Pro o superior. Para mantener la aplicación **gratuita**, implementamos una solución alternativa usando **setInterval** en el frontend.

---

## 🔄 **Solución Implementada: setInterval + Hooks**

### **✅ Ventajas:**
- **💰 Completamente gratuito**
- **⚡ Funciona en tiempo real**
- **🔄 Persistencia en localStorage**
- **📱 Optimizado para móviles**
- **🎯 Control total del usuario**

### **⚠️ Limitaciones:**
- **Solo funciona cuando el usuario está en la página**
- **Se detiene si se cierra la pestaña**
- **Requiere que el usuario inicie manualmente**

---

## 🛠️ **Componentes Implementados:**

### **1. `useAutoPriceUpdate` Hook:**
```typescript
// Actualiza precios cada 10 minutos
const {
  isActive,
  lastUpdate,
  nextUpdate,
  startAutoUpdate,
  stopAutoUpdate,
  forceUpdate,
  error
} = useAutoPriceUpdate(updateFunction, 10);
```

**Características:**
- ✅ **Intervalo configurable** (por defecto 10 minutos)
- ✅ **Persistencia en localStorage**
- ✅ **Reintentos automáticos** en caso de error
- ✅ **Optimización con visibilitychange**

### **2. `useMarketClose` Hook:**
```typescript
// Verifica cierre de mercado cada 5 minutos
const {
  isMarketOpen,
  timeUntilClose,
  startMarketMonitoring,
  forceCloseCheck
} = useMarketClose(closeFunction, 5);
```

**Características:**
- ✅ **Zona horaria** America/Montevideo
- ✅ **Días hábiles** (lunes a viernes)
- ✅ **Horario de mercado** 9:00 - 17:30
- ✅ **Detección automática** de cierre

### **3. `AutoUpdateController` Component:**
```typescript
<AutoUpdateController
  onPriceUpdate={async () => {
    // Tu función de actualización de precios
  }}
  onMarketClose={async () => {
    // Tu función de cierre de mercado
  }}
/>
```

**Características:**
- ✅ **Interfaz visual** para el usuario
- ✅ **Control de inicio/parada**
- ✅ **Información en tiempo real**
- ✅ **Manejo de errores**

---

## 🚀 **Cómo Usar:**

### **1. En tu Dashboard:**
```typescript
import { useAutoPriceUpdate } from '@/hooks/useAutoPriceUpdate';
import { useMarketClose } from '@/hooks/useMarketClose';

const Dashboard = () => {
  // ✅ NUEVO: Hook para actualización automática
  const {
    isActive: isPriceUpdateActive,
    startAutoUpdate: startPriceUpdate,
    stopAutoUpdate: stopPriceUpdate
  } = useAutoPriceUpdate(async () => {
    // Tu lógica de actualización de precios
    await updateStockPrices();
  }, 10);

  // ✅ NUEVO: Hook para monitoreo de mercado
  const {
    isMarketOpen,
    timeUntilClose,
    startMarketMonitoring
  } = useMarketClose(async () => {
    // Tu lógica de cierre de mercado
    await handleMarketClose();
  }, 5);

  return (
    <div>
      {/* ✅ NUEVO: Controlador de actualizaciones */}
      <AutoUpdateController
        onPriceUpdate={async () => {
          await updateStockPrices();
        }}
        onMarketClose={async () => {
          await handleMarketClose();
        }}
      />
      
      {/* Resto de tu dashboard */}
    </div>
  );
};
```

### **2. Funciones de Actualización:**
```typescript
// ✅ NUEVO: Función para actualizar precios
const updateStockPrices = async () => {
  try {
    console.log('🔄 Actualizando precios de acciones...');
    
    // Obtener alertas activas
    const activeAlerts = await fetch('/api/alerts/list?status=active');
    const alerts = await activeAlerts.json();
    
    // Actualizar precios desde Google Finance
    for (const alert of alerts) {
      const priceResponse = await fetch(`/api/market-data/google-finance?symbol=${alert.symbol}`);
      const priceData = await priceResponse.json();
      
      if (priceData.success) {
        // Actualizar precio en la base de datos
        await fetch(`/api/alerts/update-prices`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            alertId: alert._id,
            currentPrice: priceData.price
          })
        });
      }
    }
    
    console.log('✅ Precios actualizados exitosamente');
  } catch (error) {
    console.error('❌ Error actualizando precios:', error);
    throw error;
  }
};

// ✅ NUEVO: Función para cierre de mercado
const handleMarketClose = async () => {
  try {
    console.log('🔔 Procesando cierre de mercado...');
    
    // Obtener alertas que necesitan precio final
    const alertsNeedingFinalPrice = await fetch('/api/alerts/list?needsFinalPrice=true');
    const alerts = await alertsNeedingFinalPrice.json();
    
    for (const alert of alerts) {
      // Obtener precio de cierre
      const closePriceResponse = await fetch(`/api/market-data/google-finance?symbol=${alert.symbol}`);
      const closePriceData = await closePriceResponse.json();
      
      if (closePriceData.success) {
        // Establecer precio final
        await fetch(`/api/alerts/set-final-price`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            alertId: alert._id,
            finalPrice: closePriceData.price
          })
        });
        
        // Enviar email de cierre
        await fetch('/api/alerts/send-market-close-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            alertId: alert._id,
            closePrice: closePriceData.price
          })
        });
      }
    }
    
    console.log('✅ Cierre de mercado procesado exitosamente');
  } catch (error) {
    console.error('❌ Error procesando cierre de mercado:', error);
    throw error;
  }
};
```

---

## 🔧 **Configuración Avanzada:**

### **1. Personalizar Intervalos:**
```typescript
// Actualizar precios cada 5 minutos en lugar de 10
const { startAutoUpdate } = useAutoPriceUpdate(updateFunction, 5);

// Verificar mercado cada 2 minutos en lugar de 5
const { startMarketMonitoring } = useMarketClose(closeFunction, 2);
```

### **2. Múltiples Hooks:**
```typescript
// Para diferentes tipos de actualizaciones
const { startAutoUpdate: startPriceUpdate } = useAutoPriceUpdate(updatePrices, 10);
const { startAutoUpdate: startMetricsUpdate } = useAutoPriceUpdate(updateMetrics, 30);
const { startAutoUpdate: startNewsUpdate } = useAutoPriceUpdate(updateNews, 60);
```

### **3. Persistencia Personalizada:**
```typescript
// Los hooks automáticamente guardan en localStorage:
// - autoPriceUpdateActive
// - autoPriceUpdateInterval
// - lastPriceUpdate
// - nextPriceUpdate
// - marketMonitoringActive
// - marketMonitoringInterval
// - lastMarketCloseCheck
// - nextMarketCloseCheck
```

---

## 📱 **Optimizaciones Implementadas:**

### **1. Visibility Change:**
```typescript
// ✅ NUEVO: Solo ejecuta cuando la página es visible
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    // Verificar si necesita actualización
    const timeSinceLastUpdate = Date.now() - lastUpdateTime;
    if (timeSinceLastUpdate >= interval) {
      updateFunction();
    }
  }
});
```

### **2. Reintentos Inteligentes:**
```typescript
// ✅ NUEVO: Reintenta en caso de error
try {
  await updateFunction();
} catch (error) {
  // Reintentar en 2 minutos
  setTimeout(() => {
    if (isActive) {
      updateFunction();
    }
  }, 2 * 60 * 1000);
}
```

### **3. Limpieza Automática:**
```typescript
// ✅ NUEVO: Limpia intervalos al desmontar
useEffect(() => {
  return () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };
}, []);
```

---

## 🌐 **Alternativas para 24/7 (Gratuitas):**

### **1. cron-job.org:**
- ✅ **Gratuito** hasta 5 jobs
- ✅ **Intervalo mínimo**: 1 minuto
- ✅ **Webhooks HTTP**
- ✅ **Sin registro requerido**

**Configuración:**
```bash
# URL a llamar
https://tuapp.vercel.app/api/cron/update-stock-prices

# Headers
Authorization: Bearer tu_token_secreto

# Schedule
*/10 * * * *  # Cada 10 minutos
```

### **2. UptimeRobot:**
- ✅ **Gratuito** hasta 50 monitores
- ✅ **Intervalo mínimo**: 5 minutos
- ✅ **Webhooks HTTP**
- ✅ **Dashboard web**

### **3. EasyCron:**
- ✅ **Gratuito** hasta 3 jobs
- ✅ **Intervalo mínimo**: 1 minuto
- ✅ **Webhooks HTTP**
- ✅ **Soporte por email**

---

## 🎯 **Recomendaciones:**

### **1. Para Desarrollo:**
- ✅ **Usa setInterval** (implementado)
- ✅ **Prueba localmente** con diferentes intervalos
- ✅ **Verifica logs** en consola

### **2. Para Producción:**
- ✅ **Considera cron-job.org** para actualizaciones críticas
- ✅ **Mantén setInterval** como fallback
- ✅ **Monitorea logs** de Vercel

### **3. Para Usuarios:**
- ✅ **Educa sobre la limitación** (solo funciona en página activa)
- ✅ **Proporciona controles** para iniciar/detener
- ✅ **Muestra estado** en tiempo real

---

## 🔍 **Monitoreo y Debugging:**

### **1. Logs en Consola:**
```typescript
// Los hooks generan logs detallados:
console.log('🚀 Iniciando actualización automática de precios cada 10 minutos');
console.log('✅ Precios actualizados exitosamente a las 14:30:00');
console.log('❌ Error actualizando precios: Network error');
```

### **2. Estado en localStorage:**
```typescript
// Verificar estado actual:
localStorage.getItem('autoPriceUpdateActive');        // "true" o null
localStorage.getItem('autoPriceUpdateInterval');     // "10"
localStorage.getItem('lastPriceUpdate');            // "2024-01-15T14:30:00.000Z"
localStorage.getItem('nextPriceUpdate');            // "2024-01-15T14:40:00.000Z"
```

### **3. Métricas del Usuario:**
```typescript
// Tiempo activo en la página
const activeTime = Date.now() - pageLoadTime;

// Frecuencia de actualizaciones
const updateCount = parseInt(localStorage.getItem('updateCount') || '0');

// Última actividad
const lastActivity = localStorage.getItem('lastActivity');
```

---

## 🎉 **Resumen:**

**✅ Implementamos una solución completamente gratuita:**
- **setInterval** en lugar de cron jobs
- **Hooks personalizados** para diferentes funcionalidades
- **Persistencia en localStorage** para mantener estado
- **Optimizaciones** para móviles y pestañas inactivas
- **Interfaz visual** para control del usuario

**🚀 Alternativas gratuitas para 24/7:**
- **cron-job.org** (5 jobs gratis)
- **UptimeRobot** (50 monitores gratis)
- **EasyCron** (3 jobs gratis)

**💡 La solución híbrida es la más robusta:**
- **setInterval** para cuando el usuario está activo
- **Servicios externos** para actualizaciones críticas 24/7

---

**🎯 ¡Sistema de actualizaciones automáticas implementado sin costo!** 