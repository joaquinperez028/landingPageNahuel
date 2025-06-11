import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder?: string;
  access_mode: string;
  overwritten?: boolean;
  original_filename: string;
}

/**
 * Sube una imagen a Cloudinary
 * @param fileBuffer Buffer del archivo de imagen
 * @param fileName Nombre del archivo
 * @param folder Carpeta donde se guardará la imagen (opcional)
 * @returns Promise con resultado del upload
 */
export async function uploadImageToCloudinary(
  fileBuffer: Buffer,
  fileName: string,
  folder?: string
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      resource_type: 'image',
      public_id: `${Date.now()}_${fileName.replace(/\.[^/.]+$/, "")}`,
      overwrite: true,
      quality: 'auto',
    };

    if (folder) {
      uploadOptions.folder = folder;
    }

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('❌ Error subiendo imagen a Cloudinary:', error);
          reject(error);
        } else if (result) {
          console.log('✅ Imagen subida exitosamente a Cloudinary:', result.public_id);
          resolve(result);
        } else {
          reject(new Error('No se recibió respuesta de Cloudinary'));
        }
      }
    ).end(fileBuffer);
  });
}

/**
 * Elimina una imagen de Cloudinary
 * @param publicId Public ID de la imagen a eliminar
 * @returns Promise<boolean> Éxito de la eliminación
 */
export async function deleteImageFromCloudinary(publicId: string): Promise<boolean> {
  try {
    console.log('🗑️ Eliminando imagen de Cloudinary:', publicId);
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      console.log('✅ Imagen eliminada exitosamente de Cloudinary');
      return true;
    } else {
      console.warn('⚠️ La imagen no pudo ser eliminada:', result.result);
      return false;
    }
  } catch (error) {
    console.error('❌ Error eliminando imagen de Cloudinary:', error);
    return false;
  }
}

/**
 * Genera URL optimizada de Cloudinary
 * @param publicId Public ID de la imagen
 * @param options Opciones de transformación
 * @returns URL optimizada
 */
export function getCloudinaryImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb' | 'limit' | 'mfit' | 'mpad';
    quality?: 'auto' | number | string;
    format?: 'webp' | 'jpg' | 'png';
    gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
  } = {}
): string {
  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format,
    gravity = 'auto'
  } = options;

  const transformations: string[] = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);
  if (gravity && crop !== 'scale') transformations.push(`g_${gravity}`);

  const transformString = transformations.length > 0 ? `${transformations.join(',')}/` : '';
  
  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${transformString}${publicId}`;
}

/**
 * Valida si un public ID es válido
 * @param publicId Public ID a validar
 * @returns boolean
 */
export function isValidCloudinaryPublicId(publicId: string): boolean {
  return typeof publicId === 'string' && publicId.length > 0;
}

export default cloudinary; 