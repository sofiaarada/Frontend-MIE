import { apiClient } from './api/client';

const toDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
  reader.onload = () => resolve(String(reader.result));
  reader.readAsDataURL(file);
});

export const uploadService = {
  async subirImagen(file: File): Promise<string> {
    if (!file.type.startsWith('image/')) throw new Error('Seleccioná un archivo de imagen.');
    if (file.size > 5 * 1024 * 1024) throw new Error('La imagen no puede superar 5 MB.');
    const { data } = await apiClient.post<{ url: string }>('/api/uploads', { dataUrl: await toDataUrl(file) });
    return new URL(data.url, apiClient.defaults.baseURL).toString();
  },
  async borrarImagen(url: string): Promise<void> {
    const name = url.split('/').pop();
    if (name) await apiClient.delete(`/api/uploads/${encodeURIComponent(name)}`);
  },
};
