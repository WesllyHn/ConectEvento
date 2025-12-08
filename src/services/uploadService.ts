import { apiRequest, API_BASE_URL } from './api';

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

    const response = await apiRequest(`/upload/${supplierId}`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return response.data;
  }

  async getSupplierImages(supplierId: string): Promise<UploadedImage[]> {
    const response = await apiRequest(`/upload/supplier/${supplierId}`);
    return response.data;
  }

  getImageUrl(imageId: string): string {
    return `${API_BASE_URL}/upload/${imageId}`;
  }

  async deleteImage(imageId: string): Promise<void> {
    await apiRequest(`/upload/${imageId}`, {
      method: 'DELETE',
    });
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