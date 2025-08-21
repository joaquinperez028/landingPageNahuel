import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import styles from '@/styles/FAQAccordion.module.css';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'trader-call' | 'smart-money' | 'general';
  order: number;
  visible: boolean;
}

interface FAQAccordionProps {
  faqs: FAQ[];
  category?: 'trader-call' | 'smart-money' | 'general';
  maxItems?: number;
}

const FAQAccordion: React.FC<FAQAccordionProps> = ({ 
  faqs, 
  category,
  maxItems = 5 
}) => {
  const [openItems, setOpenItems] = useState<string[]>([]);

  // Filter FAQs by category if specified, and only show visible ones
  const filteredFaqs = faqs
    .filter(faq => faq.visible)
    .filter(faq => !category || faq.category === category)
    .sort((a, b) => a.order - b.order)
    .slice(0, maxItems);

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  if (filteredFaqs.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No hay preguntas frecuentes disponibles para esta sección</p>
      </div>
    );
  }

  return (
    <div className={styles.accordion}>
      {filteredFaqs.map((faq, index) => (
        <motion.div
          key={faq.id}
          className={styles.accordionItem}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <button
            className={`${styles.accordionHeader} ${openItems.includes(faq.id) ? styles.active : ''}`}
            onClick={() => toggleItem(faq.id)}
            aria-expanded={openItems.includes(faq.id)}
            aria-controls={`faq-content-${faq.id}`}
          >
            <span className={styles.question}>{faq.question}</span>
            <span className={styles.icon}>
              {openItems.includes(faq.id) ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </span>
          </button>
          
          <AnimatePresence>
            {openItems.includes(faq.id) && (
              <motion.div
                id={`faq-content-${faq.id}`}
                className={styles.accordionContent}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                <div className={styles.answerContent}>
                  {faq.answer.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

export default FAQAccordion;
