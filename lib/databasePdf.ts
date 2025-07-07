/**
 * Funciones helper para manejar PDFs almacenados en la base de datos
 */

/**
 * Genera URL para visualizar un PDF almacenado en la base de datos
 * @param pdfId ID del PDF en la base de datos
 * @param fileName Nombre del archivo (opcional)
 * @returns URL para visualizar en navegador
 */
export function getDatabasePDFViewUrl(
  pdfId: string,
  fileName?: string
): string {
  const baseUrl = `/api/pdf-db/view/${pdfId}`;
  return fileName ? `${baseUrl}?fileName=${encodeURIComponent(fileName)}` : baseUrl;
}

/**
 * Genera URL para descargar un PDF almacenado en la base de datos
 * @param pdfId ID del PDF en la base de datos  
 * @param fileName Nombre que se usará para la descarga
 * @returns URL para descarga forzada con nombre específico
 */
export function getDatabasePDFDownloadUrl(
  pdfId: string,
  fileName: string
): string {
  return `/api/pdf-db/download/${pdfId}?fileName=${encodeURIComponent(fileName)}`;
}

/**
 * Valida si un ID de PDF es válido (ObjectId de MongoDB)
 * @param pdfId ID a validar
 * @returns boolean
 */
export function isValidPDFId(pdfId: string): boolean {
  return typeof pdfId === 'string' && 
         pdfId.length === 24 && 
         /^[0-9a-fA-F]{24}$/.test(pdfId);
}

/**
 * Genera un nombre de archivo limpio para PDFs
 * @param originalName Nombre original del archivo
 * @param suffix Sufijo adicional (opcional)
 * @returns Nombre de archivo limpio
 */
export function generateCleanFileName(
  originalName: string,
  suffix?: string
): string {
  // Remover caracteres especiales y espacios
  let cleanName = originalName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/__+/g, '_')
    .replace(/^_|_$/g, '');

  // Asegurar que termine en .pdf
  if (!cleanName.toLowerCase().endsWith('.pdf')) {
    cleanName += '.pdf';
  }

  // Agregar sufijo si se proporciona
  if (suffix) {
    const nameWithoutExt = cleanName.replace(/\.pdf$/i, '');
    cleanName = `${nameWithoutExt}_${suffix}.pdf`;
  }

  return cleanName;
}

/**
 * Formatea el tamaño de archivo en bytes a formato legible
 * @param bytes Tamaño en bytes
 * @returns String formateado (ej: "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Extrae información del tipo de contenido para PDFs
 * @param content Contenido de la lección
 * @returns Información del PDF o null si no es PDF de base de datos
 */
export function extractDatabasePDFInfo(content: any): {
  pdfId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadDate: Date;
} | null {
  if (!content?.databasePdf) {
    return null;
  }

  return {
    pdfId: content.databasePdf.pdfId,
    fileName: content.databasePdf.fileName,
    fileSize: content.databasePdf.fileSize,
    mimeType: content.databasePdf.mimeType,
    uploadDate: content.databasePdf.uploadDate
  };
}

/**
 * Determina qué tipo de PDF está siendo usado (Cloudinary vs Database)
 * @param content Contenido de la lección
 * @returns 'cloudinary' | 'database' | 'legacy' | null
 */
export function getPDFType(content: any): 'cloudinary' | 'database' | 'legacy' | null {
  if (!content) return null;

  if (content.databasePdf?.pdfId) {
    return 'database';
  }
  
  if (content.cloudinaryPdf?.publicId) {
    return 'cloudinary';
  }
  
  if (content.pdfUrl) {
    return 'legacy';
  }

  return null;
} 