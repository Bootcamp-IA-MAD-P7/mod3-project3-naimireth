/**
 * TRAZO · mensajes de error legibles de la generación (Etapa 3).
 *
 * Traduce el `GenerationError` del `generationStore` a frases para la
 * interfaz, según la naturaleza del fallo: red, validación 422,
 * proveedor de IA, parseo u HTTP genérico.
 */
import type { GenerationError } from '../../../../store/generationStore';

export function errorTextFor(error: GenerationError): string {
  switch (error.kind) {
    case 'network':
      return 'No se pudo conectar con el backend. Comprueba que FastAPI está en marcha en http://localhost:8000.';
    case 'validation':
      return `El brief no superó la validación del servidor. ${error.message}`;
    case 'provider':
      return `El proveedor de IA falló. ${error.message}`;
    case 'parse':
      return error.message;
    default:
      return `El backend respondió con un error (HTTP ${error.status}). ${error.message}`;
  }
}