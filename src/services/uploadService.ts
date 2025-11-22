import { API_BASE_URL } from './api';

export interface UploadedImage {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
  url?: string;
}

class UploadService {
  async uploadImageBase64(supplierId: string, file: File): Promise<UploadedImage> {
    const base64 = await this.fileToBase64(file);
    const base64NoPrefix = base64.replace(/^data:.*;base64,/, '');

    const payload = {
      fileName: file.name,
      mimeType: file.type,
      data: base64NoPrefix,
    };

    const response = await fetch(`${API_BASE_URL}/upload/${supplierId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Erro upload: ${response.status} - ${text}`);
    }

    const json = await response.json();
    return json.data;
  }

  async getSupplierImages(supplierId: string): Promise<UploadedImage[]> {
    const response = await fetch(`${API_BASE_URL}/upload/supplier/${supplierId}`);
    if (!response.ok) throw new Error('Erro ao buscar imagens');
    const json = await response.json();
    return json.data;
  }

  getImageUrl(imageId: string): string {
    return `${API_BASE_URL}/upload/${imageId}`;
  }

  async deleteImage(imageId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/upload/${imageId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Erro ao deletar imagem: ${response.status} - ${text}`);
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') resolve(reader.result);
        else reject(new Error('Falha ao converter arquivo para base64'));
      };
      reader.onerror = () => reject(new Error('FileReader error'));
      reader.readAsDataURL(file);
    });
  }
}

export const uploadService = new UploadService();