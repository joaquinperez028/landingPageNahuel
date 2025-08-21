import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { authOptions } from '@/lib/googleAuth';
import { verifyAdminAccess } from '@/lib/adminAuth';
import { usePricing, PricingData } from '@/hooks/usePricing';
import { toast } from 'react-hot-toast';
import { 
  Save, 
  DollarSign, 
  AlertTriangle, 
  GraduationCap, 
  Users, 
  RefreshCw,
  TrendingUp,
  Percent,
  Calendar,
  Clock
} from 'lucide-react';
import styles from '@/styles/AdminPricing.module.css';

interface AdminPricingProps {
  session: any;
}

export default function AdminPricing({ session }: AdminPricingProps) {
  const { 
    pricing, 
    loading, 
    error, 
    updatePricing, 
    formatPrice,
    fetchPricing 
  } = usePricing();
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [localPricing, setLocalPricing] = useState<PricingData | null>(null);

  // Inicializar precios locales cuando se cargan los precios
  React.useEffect(() => {
    if (pricing && !localPricing) {
      setLocalPricing(JSON.parse(JSON.stringify(pricing)));
    }
  }, [pricing, localPricing]);

  const handleInputChange = (path: string, value: any) => {
    if (!localPricing) return;

    const newPricing = { ...localPricing };
    const keys = path.split('.');
    let current: any = newPricing;

    // Navegar hasta el penúltimo nivel
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    // Establecer el valor en el último nivel
    const lastKey = keys[keys.length - 1];
    if (typeof value === 'number') {
      current[lastKey] = Math.max(0, value);
    } else {
      current[lastKey] = value;
    }

    setLocalPricing(newPricing);
  };

  const handleSave = async () => {
    if (!localPricing) return;

    setIsUpdating(true);
    try {
      const result = await updatePricing(localPricing);
      
      if (result.success) {
        toast.success('Precios actualizados correctamente');
        await fetchPricing(); // Recargar precios
      } else {
        toast.error(result.error || 'Error al actualizar precios');
      }
    } catch (error) {
      toast.error('Error al actualizar precios');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = () => {
    if (pricing) {
      setLocalPricing(JSON.parse(JSON.stringify(pricing)));
      toast.success('Cambios revertidos');
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Cargando precios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <AlertTriangle size={48} className={styles.errorIcon} />
        <h2>Error al cargar precios</h2>
        <p>{error}</p>
        <button onClick={fetchPricing} className={styles.retryButton}>
          Reintentar
        </button>
      </div>
    );
  }

  if (!localPricing) {
    return (
      <div className={styles.errorContainer}>
        <p>No se pudieron cargar los precios</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <DollarSign size={32} />
            Dashboard de Precios
          </h1>
          <p className={styles.subtitle}>
            Gestiona todos los precios del sitio web de forma centralizada
          </p>
        </div>
        
        <div className={styles.headerActions}>
          <button 
            onClick={handleReset}
            className={styles.resetButton}
            disabled={isUpdating}
          >
            <RefreshCw size={16} />
            Revertir Cambios
          </button>
          
          <button 
            onClick={handleSave}
            className={styles.saveButton}
            disabled={isUpdating}
          >
            <Save size={16} />
            {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {/* Sección de Alertas */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <AlertTriangle size={24} className={styles.sectionIcon} />
            <h2>Precios de Alertas</h2>
          </div>
          
          <div className={styles.pricingGrid}>
            {/* Trader Call */}
            <div className={styles.pricingCard}>
              <h3>Trader Call</h3>
              <div className={styles.priceInputs}>
                <div className={styles.priceInput}>
                  <label>Mensual</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.currency}>$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={localPricing.alertas.traderCall.monthly}
                      onChange={(e) => handleInputChange('alertas.traderCall.monthly', parseFloat(e.target.value))}
                      className={styles.input}
                    />
                  </div>
                </div>
                
                <div className={styles.priceInput}>
                  <label>Anual</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.currency}>$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={localPricing.alertas.traderCall.yearly}
                      onChange={(e) => handleInputChange('alertas.traderCall.yearly', parseFloat(e.target.value))}
                      className={styles.input}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Money */}
            <div className={styles.pricingCard}>
              <h3>Smart Money</h3>
              <div className={styles.priceInputs}>
                <div className={styles.priceInput}>
                  <label>Mensual</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.currency}>$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={localPricing.alertas.smartMoney.monthly}
                      onChange={(e) => handleInputChange('alertas.smartMoney.monthly', parseFloat(e.target.value))}
                      className={styles.input}
                    />
                  </div>
                </div>
                
                <div className={styles.priceInput}>
                  <label>Anual</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.currency}>$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={localPricing.alertas.smartMoney.yearly}
                      onChange={(e) => handleInputChange('alertas.smartMoney.yearly', parseFloat(e.target.value))}
                      className={styles.input}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sección de Entrenamientos */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <GraduationCap size={24} className={styles.sectionIcon} />
            <h2>Precios de Entrenamientos</h2>
          </div>
          
          <div className={styles.pricingGrid}>
            {/* Swing Trading */}
            <div className={styles.pricingCard}>
              <h3>Swing Trading</h3>
              <div className={styles.priceInputs}>
                <div className={styles.priceInput}>
                  <label>Precio</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.currency}>$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={localPricing.entrenamientos.swingTrading.price}
                      onChange={(e) => handleInputChange('entrenamientos.swingTrading.price', parseFloat(e.target.value))}
                      className={styles.input}
                    />
                  </div>
                </div>
                
                <div className={styles.priceInput}>
                  <label>Precio Original (opcional)</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.currency}>$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={localPricing.entrenamientos.swingTrading.originalPrice || ''}
                      onChange={(e) => handleInputChange('entrenamientos.swingTrading.originalPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className={styles.input}
                      placeholder="Sin descuento"
                    />
                  </div>
                </div>
                
                <div className={styles.priceInput}>
                  <label>Descuento % (opcional)</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={localPricing.entrenamientos.swingTrading.discount || ''}
                      onChange={(e) => handleInputChange('entrenamientos.swingTrading.discount', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className={styles.input}
                      placeholder="0"
                    />
                    <span className={styles.percent}>%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Day Trading */}
            <div className={styles.pricingCard}>
              <h3>Day Trading</h3>
              <div className={styles.priceInputs}>
                <div className={styles.priceInput}>
                  <label>Precio</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.currency}>$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={localPricing.entrenamientos.dayTrading.price}
                      onChange={(e) => handleInputChange('entrenamientos.dayTrading.price', parseFloat(e.target.value))}
                      className={styles.input}
                    />
                  </div>
                </div>
                
                <div className={styles.priceInput}>
                  <label>Precio Original (opcional)</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.currency}>$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={localPricing.entrenamientos.dayTrading.originalPrice || ''}
                      onChange={(e) => handleInputChange('entrenamientos.dayTrading.originalPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className={styles.input}
                      placeholder="Sin descuento"
                    />
                  </div>
                </div>
                
                <div className={styles.priceInput}>
                  <label>Descuento % (opcional)</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={localPricing.entrenamientos.dayTrading.discount || ''}
                      onChange={(e) => handleInputChange('entrenamientos.dayTrading.discount', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className={styles.input}
                      placeholder="0"
                    />
                    <span className={styles.percent}>%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced */}
            <div className={styles.pricingCard}>
              <h3>Advanced</h3>
              <div className={styles.priceInputs}>
                <div className={styles.priceInput}>
                  <label>Precio</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.currency}>$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={localPricing.entrenamientos.advanced.price}
                      onChange={(e) => handleInputChange('entrenamientos.advanced.price', parseFloat(e.target.value))}
                      className={styles.input}
                    />
                  </div>
                </div>
                
                <div className={styles.priceInput}>
                  <label>Precio Original (opcional)</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.currency}>$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={localPricing.entrenamientos.advanced.originalPrice || ''}
                      onChange={(e) => handleInputChange('entrenamientos.advanced.originalPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className={styles.input}
                      placeholder="Sin descuento"
                    />
                  </div>
                </div>
                
                <div className={styles.priceInput}>
                  <label>Descuento % (opcional)</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={localPricing.entrenamientos.advanced.discount || ''}
                      onChange={(e) => handleInputChange('entrenamientos.advanced.discount', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className={styles.input}
                      placeholder="0"
                    />
                    <span className={styles.percent}>%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sección de Asesorías */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Users size={24} className={styles.sectionIcon} />
            <h2>Precios de Asesorías</h2>
          </div>
          
          <div className={styles.pricingGrid}>
            {/* Consultorio Financiero */}
            <div className={styles.pricingCard}>
              <h3>Consultorio Financiero</h3>
              <div className={styles.priceInputs}>
                <div className={styles.priceInput}>
                  <label>Precio</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.currency}>$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={localPricing.asesorias.consultorioFinanciero.price}
                      onChange={(e) => handleInputChange('asesorias.consultorioFinanciero.price', parseFloat(e.target.value))}
                      className={styles.input}
                    />
                  </div>
                </div>
                
                <div className={styles.priceInput}>
                  <label>Duración</label>
                  <input
                    type="text"
                    value={localPricing.asesorias.consultorioFinanciero.duration}
                    onChange={(e) => handleInputChange('asesorias.consultorioFinanciero.duration', e.target.value)}
                    className={styles.input}
                    placeholder="60 minutos"
                  />
                </div>
                
                <div className={styles.priceInput}>
                  <label>Precio Original (opcional)</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.currency}>$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={localPricing.asesorias.consultorioFinanciero.originalPrice || ''}
                      onChange={(e) => handleInputChange('asesorias.consultorioFinanciero.originalPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className={styles.input}
                      placeholder="Sin descuento"
                    />
                  </div>
                </div>
                
                <div className={styles.priceInput}>
                  <label>Descuento % (opcional)</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={localPricing.asesorias.consultorioFinanciero.discount || ''}
                      onChange={(e) => handleInputChange('asesorias.consultorioFinanciero.discount', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className={styles.input}
                      placeholder="0"
                    />
                    <span className={styles.percent}>%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Configuración General */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <TrendingUp size={24} className={styles.sectionIcon} />
            <h2>Configuración General</h2>
          </div>
          
          <div className={styles.configGrid}>
            <div className={styles.configCard}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={localPricing.showDiscounts}
                  onChange={(e) => handleInputChange('showDiscounts', e.target.checked)}
                />
                <span>Mostrar descuentos en el sitio</span>
              </label>
              <p className={styles.configDescription}>
                Activa esta opción para mostrar precios tachados y descuentos en las páginas del sitio
              </p>
            </div>
            
            <div className={styles.configCard}>
              <label>Moneda</label>
              <select
                value={localPricing.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className={styles.select}
              >
                <option value="USD">USD - Dólar Estadounidense</option>
                <option value="EUR">EUR - Euro</option>
                <option value="ARS">ARS - Peso Argentino</option>
              </select>
            </div>
          </div>
        </section>

        {/* Información de Última Actualización */}
        <section className={styles.section}>
          <div className={styles.infoCard}>
            <div className={styles.infoItem}>
              <Clock size={16} />
              <span>Última actualización: {new Date(localPricing.lastUpdated).toLocaleString('es-AR')}</span>
            </div>
            <div className={styles.infoItem}>
              <Users size={16} />
              <span>Actualizado por: {localPricing.updatedBy}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const adminCheck = await verifyAdminAccess(context);
  
  if (!adminCheck.isAdmin) {
    return {
      redirect: {
        destination: adminCheck.redirectTo || '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      session: adminCheck.session,
    },
  };
}; 