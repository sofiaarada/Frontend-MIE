const API_BASE = import.meta.env.VITE_API_URL ?? '';

/** Resuelve rutas de imagen relativas (/uploads/...) hacia la URL absoluta del backend. */
export function urlImagen(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('/uploads') && API_BASE) return `${API_BASE}${url}`;
  if (/^(https?:)?\/\//.test(url)) return url;
  return url.startsWith('/') ? url : `/${url}`;
}