/**
 * Genera un avatar usando data URL para evitar problemas con servicios externos
 * @param text - Texto a mostrar en el avatar
 * @param backgroundColor - Color de fondo en formato hex
 * @param textColor - Color del texto en formato hex
 * @param size - Tamaño del avatar (ancho y alto)
 * @returns Data URL del SVG generado
 */
export function generateAvatarDataURL(
  text: string = '?', 
  backgroundColor: string = '#3b82f6', 
  textColor: string = '#ffffff',
  size: number = 80
): string {
  try {
    const cleanText = text.trim() || '?';
    const firstLetter = cleanText.charAt(0).toUpperCase();
    
    const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg"><rect width="${size}" height="${size}" fill="${backgroundColor}" rx="${Math.round(size / 8)}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.round(size * 0.4)}" font-weight="600" fill="${textColor}">${firstLetter}</text></svg>`;
    
    // Usar encodeURIComponent en lugar de btoa para mejor compatibilidad
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  } catch (error) {
    console.warn('Error generando avatar:', error);
    // Fallback simple
    return `data:image/svg+xml,${encodeURIComponent('<svg width="80" height="80" xmlns="http://www.w3.org/2000/svg"><rect width="80" height="80" fill="#64748b"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="32" fill="white">?</text></svg>')}`;
  }
}

/**
 * Genera un avatar circular usando data URL
 */
export function generateCircularAvatarDataURL(
  text: string = '?', 
  backgroundColor: string = '#3b82f6', 
  textColor: string = '#ffffff',
  size: number = 80
): string {
  try {
    const cleanText = text.trim() || '?';
    const firstLetter = cleanText.charAt(0).toUpperCase();
    const radius = size / 2;
    
    const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg"><circle cx="${radius}" cy="${radius}" r="${radius}" fill="${backgroundColor}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="${Math.round(size * 0.4)}" font-weight="600" fill="${textColor}">${firstLetter}</text></svg>`;
    
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  } catch (error) {
    console.warn('Error generando avatar circular:', error);
    // Fallback simple
    return `data:image/svg+xml,${encodeURIComponent('<svg width="80" height="80" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="40" fill="#64748b"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="32" fill="white">?</text></svg>')}`;
  }
} 