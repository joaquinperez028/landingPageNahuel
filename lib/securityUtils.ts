/**
 * Utilidades de seguridad para proteger el sistema de contacto
 * Incluye detección de patrones maliciosos, rate limiting avanzado y más
 */

// Patrones de detección de contenido malicioso
const MALICIOUS_PATTERNS = {
  // Scripts y código malicioso
  scripts: [
    /<script[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
    /on\w+\s*=/gi,
    /eval\s*\(/gi,
    /function\s*\(/gi,
    /document\./gi,
    /window\./gi,
    /location\./gi,
    /href\s*=/gi,
  ],
  
  // Inyección SQL
  sqlInjection: [
    /('|(\\['\"])|(--)|(\*))[\s\S]*(union|select|insert|delete|update|drop|create|alter|exec|execute)/gi,
    /\b(union|select|insert|delete|update|drop|create|alter)\b.*(\b(from|where|into|values|set)\b)/gi,
    /'[\s]*or[\s]*'1'[\s]*=[\s]*'1/gi,
    /'[\s]*or[\s]*1[\s]*=[\s]*1/gi,
  ],
  
  // Comandos del sistema
  systemCommands: [
    /(\||&|;|\$\(|\`)/g,
    /\.\.\//g,
    /\.\.\\{1,2}/g,
    /\/etc\/passwd/gi,
    /\/proc\//gi,
    /cmd\.exe/gi,
    /powershell/gi,
    /bash/gi,
    /sh\s/gi,
  ],
  
  // Contenido spam típico
  spam: [
    /(viagra|cialis|pharmacy|pills)/gi,
    /(casino|poker|gambling|slots|bet)/gi,
    /(lottery|winner|prize|million|dollars|€|£)/gi,
    /(congratulations|you['']?ve won|selected)/gi,
    /(click here|visit now|act now|limited time)/gi,
    /(make money|earn \$|get rich|work from home)/gi,
  ],
  
  // URLs y enlaces sospechosos
  urls: [
    /https?:\/\/[^\s]+[^\s.]/gi,
    /www\.[^\s]+/gi,
    /[^\s]+\.(com|net|org|ru|cn|tk|ml|ga|cf)[^\s]*/gi,
    /bit\.ly|tinyurl|short\.link/gi,
  ],
  
  // Patrones de phishing
  phishing: [
    /(urgent|immediate|verify|confirm|suspend|expire)/gi,
    /(account|password|security|login|credential)/gi,
    /(paypal|amazon|google|microsoft|apple|bank)/gi,
    /(click.*link|follow.*link|verify.*identity)/gi,
  ]
};

// Lista de palabras prohibidas específicas
const BLOCKED_WORDS = [
  // Palabras maliciosas
  'payload', 'exploit', 'vulnerability', 'injection', 'xss', 'csrf',
  'malware', 'virus', 'trojan', 'backdoor', 'rootkit',
  
  // Spam común
  'cryptocurrency', 'bitcoin', 'forex', 'trading signals', 'investment opportunity',
  'guaranteed profit', 'risk free', 'double your money',
  
  // Contenido inapropiado básico
  'porn', 'sex', 'adult', 'escort', 'drug', 'illegal'
];

/**
 * Analiza el contenido en busca de patrones maliciosos
 * @param content - Texto a analizar
 * @returns Objeto con el resultado del análisis
 */
export function analyzeContentSecurity(content: string): {
  isSafe: boolean;
  threats: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  score: number; // 0-100, donde 100 es máximo riesgo
} {
  const threats: string[] = [];
  let riskScore = 0;
  
  const normalizedContent = content.toLowerCase().trim();
  
  // Verificar patrones maliciosos por categoría
  Object.entries(MALICIOUS_PATTERNS).forEach(([category, patterns]) => {
    patterns.forEach(pattern => {
      if (pattern.test(content)) {
        threats.push(`Patrón ${category} detectado`);
        
        // Asignar puntuación por tipo de amenaza
        switch (category) {
          case 'scripts':
            riskScore += 40;
            break;
          case 'sqlInjection':
            riskScore += 35;
            break;
          case 'systemCommands':
            riskScore += 30;
            break;
          case 'spam':
            riskScore += 15;
            break;
          case 'urls':
            riskScore += 20;
            break;
          case 'phishing':
            riskScore += 25;
            break;
        }
      }
    });
  });
  
  // Verificar palabras prohibidas
  BLOCKED_WORDS.forEach(word => {
    if (normalizedContent.includes(word)) {
      threats.push(`Palabra prohibida: ${word}`);
      riskScore += 10;
    }
  });
  
  // Verificar patrones sospechosos adicionales
  
  // Contenido muy corto después de limpieza
  if (normalizedContent.length < 5) {
    threats.push('Contenido demasiado corto');
    riskScore += 5;
  }
  
  // Demasiados caracteres especiales
  const specialCharsCount = (content.match(/[^a-zA-Z0-9\s]/g) || []).length;
  const specialCharsRatio = specialCharsCount / content.length;
  if (specialCharsRatio > 0.3) {
    threats.push('Exceso de caracteres especiales');
    riskScore += 15;
  }
  
  // Repetición excesiva de caracteres
  if (/(.)\1{10,}/.test(content)) {
    threats.push('Repetición excesiva de caracteres');
    riskScore += 20;
  }
  
  // Contenido en mayúsculas excesivo
  const upperCaseRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (upperCaseRatio > 0.7 && content.length > 20) {
    threats.push('Exceso de mayúsculas (posible spam)');
    riskScore += 10;
  }
  
  // Determinar nivel de riesgo
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  if (riskScore >= 70) {
    riskLevel = 'critical';
  } else if (riskScore >= 40) {
    riskLevel = 'high';
  } else if (riskScore >= 20) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }
  
  // El contenido es seguro si el riesgo es bajo y no hay amenazas críticas
  const isSafe = riskLevel === 'low' && riskScore < 25;
  
  return {
    isSafe,
    threats,
    riskLevel,
    score: Math.min(riskScore, 100)
  };
}

/**
 * Limpia el contenido de caracteres potencialmente peligrosos
 * @param content - Contenido a limpiar
 * @returns Contenido limpio y seguro
 */
export function sanitizeContent(content: string): string {
  return content
    // Eliminar caracteres de control
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Normalizar espacios en blanco
    .replace(/\s+/g, ' ')
    // Eliminar caracteres Unicode peligrosos
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // Eliminar secuencias de escape
    .replace(/\\x[0-9a-fA-F]{2}/g, '')
    .replace(/\\u[0-9a-fA-F]{4}/g, '')
    // Limpiar y normalizar
    .trim();
}

/**
 * Calcula un hash simple del contenido para detección de duplicados
 * @param content - Contenido a hashear
 * @returns Hash simple del contenido
 */
export function getContentHash(content: string): string {
  let hash = 0;
  if (content.length === 0) return '0';
  
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir a 32bit integer
  }
  
  return Math.abs(hash).toString(36);
}

/**
 * Verifica si el contenido parece ser generado automáticamente
 * @param content - Contenido a verificar
 * @returns true si parece automatizado
 */
export function detectAutomatedContent(content: string): boolean {
  // Patrones que sugieren contenido automatizado
  const automatedPatterns = [
    // Repetición de palabras
    /\b(\w+)\s+\1\s+\1\b/gi,
    // Secuencias numéricas largas
    /\d{10,}/,
    // Patrones de bot
    /bot|automated|script|crawler/gi,
    // Texto muy estructurado o repetitivo
    /^(.{10,50})\1{2,}$/,
  ];
  
  return automatedPatterns.some(pattern => pattern.test(content));
}

/**
 * Valida que el email sea real y no temporal
 * @param email - Email a validar
 * @returns true si el email parece legítimo
 */
export function validateEmailLegitimacy(email: string): boolean {
  // Dominios temporales conocidos
  const tempEmailDomains = [
    '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
    'mailinator.com', 'throwaway.email', 'temp-mail.org',
    'fakemailgenerator.com', 'dispostable.com'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  
  // Verificar si es un dominio temporal
  if (tempEmailDomains.includes(domain)) {
    return false;
  }
  
  // Verificar patrones sospechosos en el dominio
  const suspiciousDomainPatterns = [
    /\d{5,}/, // Muchos números consecutivos
    /[a-z]{20,}/, // Cadenas muy largas sin sentido
    /(.)\1{4,}/, // Repetición excesiva de caracteres
  ];
  
  return !suspiciousDomainPatterns.some(pattern => pattern.test(domain));
}

/**
 * Genera un reporte de seguridad completo
 * @param subject - Asunto del mensaje
 * @param message - Cuerpo del mensaje
 * @param userEmail - Email del usuario
 * @returns Reporte completo de seguridad
 */
export function generateSecurityReport(
  subject: string,
  message: string,
  userEmail: string
): {
  isSecure: boolean;
  issues: string[];
  recommendations: string[];
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Analizar asunto
  const subjectAnalysis = analyzeContentSecurity(subject);
  if (!subjectAnalysis.isSafe) {
    issues.push(`Asunto problemático: ${subjectAnalysis.threats.join(', ')}`);
  }
  
  // Analizar mensaje
  const messageAnalysis = analyzeContentSecurity(message);
  if (!messageAnalysis.isSafe) {
    issues.push(`Mensaje problemático: ${messageAnalysis.threats.join(', ')}`);
  }
  
  // Validar email
  if (!validateEmailLegitimacy(userEmail)) {
    issues.push('Email sospechoso o temporal detectado');
    recommendations.push('Verificar la legitimidad del email del usuario');
  }
  
  // Detectar contenido automatizado
  if (detectAutomatedContent(subject) || detectAutomatedContent(message)) {
    issues.push('Posible contenido generado automáticamente');
    recommendations.push('Implementar CAPTCHA adicional');
  }
  
  // Determinar riesgo general
  const maxRiskScore = Math.max(subjectAnalysis.score, messageAnalysis.score);
  let overallRisk: 'low' | 'medium' | 'high' | 'critical';
  
  if (issues.length === 0) {
    overallRisk = 'low';
  } else if (maxRiskScore >= 70) {
    overallRisk = 'critical';
  } else if (maxRiskScore >= 40) {
    overallRisk = 'high';
  } else {
    overallRisk = 'medium';
  }
  
  // Generar recomendaciones
  if (overallRisk !== 'low') {
    recommendations.push('Revisar manualmente el contenido antes de procesarlo');
    recommendations.push('Considerar implementar moderación adicional');
  }
  
  return {
    isSecure: issues.length === 0,
    issues,
    recommendations,
    overallRisk
  };
} 