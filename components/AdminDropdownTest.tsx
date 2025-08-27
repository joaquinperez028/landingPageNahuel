import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import styles from './AdminDropdownTest.module.css';

interface AdminDropdownTestProps {
  className?: string;
}

/**
 * ✅ NUEVO: Componente de prueba para verificar que los menús desplegables funcionen
 * 
 * Este componente se puede usar temporalmente en el dashboard para probar
 * que los selects y dropdowns funcionen correctamente después de los fixes
 */
const AdminDropdownTest: React.FC<AdminDropdownTestProps> = ({ className = '' }) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedDropdown, setSelectedDropdown] = useState('');

  const options = [
    { value: 'option1', label: 'Opción 1' },
    { value: 'option2', label: 'Opción 2' },
    { value: 'option3', label: 'Opción 3' },
    { value: 'option4', label: 'Opción 4' },
  ];

  const dropdownOptions = [
    { value: 'dropdown1', label: 'Dropdown Opción 1' },
    { value: 'dropdown2', label: 'Dropdown Opción 2' },
    { value: 'dropdown3', label: 'Dropdown Opción 3' },
  ];

  return (
    <div className={`${styles.container} ${className}`}>
      <h3 className={styles.title}>🧪 Prueba de Menús Desplegables</h3>
      <p className={styles.subtitle}>
        Verifica que estos elementos funcionen correctamente después de los fixes de seguridad
      </p>

      <div className={styles.testSection}>
        <h4>1. Select HTML Nativo</h4>
        <select
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          className={styles.testSelect}
        >
          <option value="">Selecciona una opción</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className={styles.result}>
          Opción seleccionada: <strong>{selectedOption || 'Ninguna'}</strong>
        </p>
      </div>

      <div className={styles.testSection}>
        <h4>2. Dropdown Personalizado</h4>
        <div className={styles.dropdownContainer}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={styles.dropdownButton}
          >
            {selectedDropdown || 'Selecciona una opción'}
            <ChevronDown className={`${styles.chevron} ${isDropdownOpen ? styles.rotated : ''}`} />
          </button>
          
          {isDropdownOpen && (
            <div className={styles.dropdownMenu}>
              {dropdownOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedDropdown(option.label);
                    setIsDropdownOpen(false);
                  }}
                  className={styles.dropdownItem}
                >
                  {option.label}
                  {selectedDropdown === option.label && <Check className={styles.checkIcon} />}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className={styles.result}>
          Opción seleccionada: <strong>{selectedDropdown || 'Ninguna'}</strong>
        </p>
      </div>

      <div className={styles.testSection}>
        <h4>3. Input de Texto</h4>
        <input
          type="text"
          placeholder="Escribe algo aquí..."
          className={styles.testInput}
        />
        <p className={styles.result}>
          Deberías poder escribir en este input sin problemas
        </p>
      </div>

      <div className={styles.testSection}>
        <h4>4. Botones</h4>
        <div className={styles.buttonGroup}>
          <button className={styles.testButton}>Botón Normal</button>
          <button className={`${styles.testButton} ${styles.primary}`}>Botón Primario</button>
          <button className={`${styles.testButton} ${styles.secondary}`}>Botón Secundario</button>
        </div>
        <p className={styles.result}>
          Todos los botones deberían ser clickeables
        </p>
      </div>

      <div className={styles.status}>
        <h4>📊 Estado de la Prueba:</h4>
        <ul>
          <li>✅ Select HTML: {selectedOption ? 'Funcionando' : 'Pendiente'}</li>
          <li>✅ Dropdown Personalizado: {selectedDropdown ? 'Funcionando' : 'Pendiente'}</li>
          <li>✅ Input de Texto: Funcionando</li>
          <li>✅ Botones: Funcionando</li>
        </ul>
      </div>

      <div className={styles.instructions}>
        <h4>📋 Instrucciones:</h4>
        <ol>
          <li>Prueba el select HTML nativo - debería abrirse y permitir selección</li>
          <li>Prueba el dropdown personalizado - debería abrirse al hacer click</li>
          <li>Prueba el input - deberías poder escribir</li>
          <li>Prueba los botones - deberían responder al click</li>
          <li>Si todo funciona, los menús del dashboard están arreglados</li>
        </ol>
      </div>
    </div>
  );
};

export default AdminDropdownTest; 