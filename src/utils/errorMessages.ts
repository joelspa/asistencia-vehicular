/**
 * errorMessages.ts - Mensajes de error centralizados y legibles.
 * Principio: Separar mensajes de negocio de lógica técnica.
 * Facilita cambios de copy sin tocar el código.
 */

export const ERROR_MESSAGES = {
  SERVER_UNAVAILABLE:
    'El servidor de diagnóstico no está disponible en este momento. Por favor, revisa tu conexión o intenta de nuevo más tarde.',
  
  NETWORK_ERROR:
    'Error de conexión. Verifica tu conexión a Internet e intenta nuevamente.',
  
  LOCATION_PERMISSION_DENIED:
    'Se necesita permiso de ubicación para mostrar talleres cercanos.',
  
  NO_SYMPTOMS_PROVIDED:
    'Por favor, describe los síntomas de tu vehículo antes de continuar.',
  
  INVALID_RESPONSE:
    'La respuesta del servidor no es válida. Intenta de nuevo.',
  
  STORAGE_ERROR:
    'Error al guardar los datos. Algunos datos pueden no persistir.',
} as const;

/**
 * Retorna un mensaje de error amigable según el tipo de error.
 * Mapea errores técnicos a mensajes comprensibles para el usuario.
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    
    if (message.includes('json')) {
      return ERROR_MESSAGES.INVALID_RESPONSE;
    }
  }
  
  return ERROR_MESSAGES.SERVER_UNAVAILABLE;
}
