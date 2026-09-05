import axios from 'axios';

/** Extrae el mensaje legible de un error, priorizando el mensaje del servidor. */
export function mensajeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const msg = error.response?.data?.error?.message;
    if (typeof msg === 'string' && msg) return msg;
    if (error.code === 'ERR_NETWORK') return 'No se pudo conectar con el servidor.';
  }
  return error instanceof Error ? error.message : 'Ocurrió un error inesperado.';
}