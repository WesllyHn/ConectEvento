import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { uploadService, UploadedImage } from './uploadService';
import { API_BASE_URL } from './api';

global.fetch = vi.fn();

describe('uploadService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockUploadedImage: UploadedImage = {
    id: 'img-1',
    fileName: 'test-image.jpg',
    mimeType: 'image/jpeg',
    fileSize: 1024,
    createdAt: '2025-01-01T00:00:00.000Z',
    url: `${API_BASE_URL}/upload/img-1`,
  };

  describe('uploadImageBase64', () => {
    it('should upload an image successfully', async () => {
      const mockFile = new File(['test content'], 'test-image.jpg', { type: 'image/jpeg' });
      
      const mockFileReader: any = {
        readAsDataURL: vi.fn(),
        result: 'data:image/jpeg;base64,dGVzdCBjb250ZW50',
        onload: null,
        onerror: null,
      };

      vi.spyOn(global, 'FileReader').mockImplementation(() => {
        setTimeout(() => {
          if (mockFileReader.onload) {
            mockFileReader.onload();
          }
        }, 0);
        return mockFileReader;
      });

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: mockUploadedImage }),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const result = await uploadService.uploadImageBase64('supplier-1', mockFile);

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/upload/supplier-1`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('test-image.jpg'),
        })
      );

      expect(result).toEqual(mockUploadedImage);
    });

    it('should remove base64 prefix from data', async () => {
      const mockFile = new File(['test content'], 'test.png', { type: 'image/png' });
      
      const mockFileReader: any = {
        readAsDataURL: vi.fn(),
        result: 'data:image/png;base64,YWJjMTIz',
        onload: null,
        onerror: null,
      };

      vi.spyOn(global, 'FileReader').mockImplementation(() => {
        setTimeout(() => {
          if (mockFileReader.onload) {
            mockFileReader.onload();
          }
        }, 0);
        return mockFileReader;
      });

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: mockUploadedImage }),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      await uploadService.uploadImageBase64('supplier-1', mockFile);

      const callArgs = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);

      expect(body.data).not.toContain('data:');
      expect(body.data).not.toContain('base64,');
      expect(body.data).toBe('YWJjMTIz');
    });

    it('should handle upload errors with response status', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      const mockFileReader: any = {
        readAsDataURL: vi.fn(),
        result: 'data:image/jpeg;base64,dGVzdA==',
        onload: null,
        onerror: null,
      };

      vi.spyOn(global, 'FileReader').mockImplementation(() => {
        setTimeout(() => {
          if (mockFileReader.onload) {
            mockFileReader.onload();
          }
        }, 0);
        return mockFileReader;
      });

      const mockResponse = {
        ok: false,
        status: 400,
        text: vi.fn().mockResolvedValue('Bad Request'),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      await expect(
        uploadService.uploadImageBase64('supplier-1', mockFile)
      ).rejects.toThrow('Erro upload: 400 - Bad Request');
    });

    it('should handle FileReader errors', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      const mockFileReader: any = {
        readAsDataURL: vi.fn(),
        result: null,
        onload: null,
        onerror: null,
      };

      vi.spyOn(global, 'FileReader').mockImplementation(() => {
        setTimeout(() => {
          if (mockFileReader.onerror) {
            mockFileReader.onerror();
          }
        }, 0);
        return mockFileReader;
      });

      await expect(
        uploadService.uploadImageBase64('supplier-1', mockFile)
      ).rejects.toThrow('FileReader error');
    });

    it('should send correct payload structure', async () => {
      const mockFile = new File(['content'], 'my-image.png', { type: 'image/png' });
      
      const mockFileReader: any = {
        readAsDataURL: vi.fn(),
        result: 'data:image/png;base64,Y29udGVudA==',
        onload: null,
        onerror: null,
      };

      vi.spyOn(global, 'FileReader').mockImplementation(() => {
        setTimeout(() => {
          if (mockFileReader.onload) {
            mockFileReader.onload();
          }
        }, 0);
        return mockFileReader;
      });

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: mockUploadedImage }),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      await uploadService.uploadImageBase64('supplier-1', mockFile);

      const callArgs = vi.mocked(fetch).mock.calls[0];
      const body = JSON.parse(callArgs[1]?.body as string);

      expect(body).toEqual({
        fileName: 'my-image.png',
        mimeType: 'image/png',
        data: 'Y29udGVudA==',
      });
    });
  });

  describe('getSupplierImages', () => {
    it('should fetch supplier images successfully', async () => {
      const mockImages = [mockUploadedImage];
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: mockImages }),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const result = await uploadService.getSupplierImages('supplier-1');

      expect(fetch).toHaveBeenCalledWith(`${API_BASE_URL}/upload/supplier/supplier-1`);
      expect(result).toEqual(mockImages);
    });

    it('should handle fetch errors', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      await expect(
        uploadService.getSupplierImages('supplier-1')
      ).rejects.toThrow('Erro ao buscar imagens');
    });

    it('should return empty array when no images exist', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: [] }),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const result = await uploadService.getSupplierImages('supplier-1');

      expect(result).toEqual([]);
    });

    it('should handle network errors', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      await expect(
        uploadService.getSupplierImages('supplier-1')
      ).rejects.toThrow('Network error');
    });
  });

  describe('getImageUrl', () => {
    it('should return correct image URL', () => {
      const imageId = 'img-123';
      const result = uploadService.getImageUrl(imageId);

      expect(result).toBe(`${API_BASE_URL}/upload/${imageId}`);
    });

    it('should handle different image IDs', () => {
      const testCases = ['img-1', 'abc-def-123', 'photo_2024'];

      testCases.forEach((imageId) => {
        const result = uploadService.getImageUrl(imageId);
        expect(result).toBe(`${API_BASE_URL}/upload/${imageId}`);
      });
    });

    it('should work with empty string', () => {
      const result = uploadService.getImageUrl('');
      expect(result).toBe(`${API_BASE_URL}/upload/`);
    });
  });

  describe('fileToBase64 (private method testing through uploadImageBase64)', () => {
    it('should convert file to base64 with correct format', async () => {
      const mockFile = new File(['test data'], 'test.jpg', { type: 'image/jpeg' });
      
      const mockFileReader: any = {
        readAsDataURL: vi.fn(),
        result: 'data:image/jpeg;base64,dGVzdCBkYXRh',
        onload: null,
        onerror: null,
      };

      vi.spyOn(global, 'FileReader').mockImplementation(() => {
        setTimeout(() => {
          if (mockFileReader.onload) {
            mockFileReader.onload();
          }
        }, 0);
        return mockFileReader;
      });

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: mockUploadedImage }),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      await uploadService.uploadImageBase64('supplier-1', mockFile);

      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(mockFile);
    });

    it('should reject when result is not a string', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      const mockFileReader: any = {
        readAsDataURL: vi.fn(),
        result: new ArrayBuffer(8),
        onload: null,
        onerror: null,
      };

      vi.spyOn(global, 'FileReader').mockImplementation(() => {
        setTimeout(() => {
          if (mockFileReader.onload) {
            mockFileReader.onload();
          }
        }, 0);
        return mockFileReader;
      });

      await expect(
        uploadService.uploadImageBase64('supplier-1', mockFile)
      ).rejects.toThrow('Falha ao converter arquivo para base64');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete upload flow', async () => {
      const mockFile = new File(['image content'], 'profile.jpg', { type: 'image/jpeg' });
      
      const mockFileReader: any = {
        readAsDataURL: vi.fn(),
        result: 'data:image/jpeg;base64,aW1hZ2UgY29udGVudA==',
        onload: null,
        onerror: null,
      };

      vi.spyOn(global, 'FileReader').mockImplementation(() => {
        setTimeout(() => {
          if (mockFileReader.onload) {
            mockFileReader.onload();
          }
        }, 0);
        return mockFileReader;
      });

      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: mockUploadedImage }),
      };

      vi.mocked(fetch).mockResolvedValue(mockResponse as any);

      const uploadResult = await uploadService.uploadImageBase64('supplier-1', mockFile);

      expect(uploadResult).toEqual(mockUploadedImage);
      expect(uploadResult.id).toBe('img-1');
      expect(uploadResult.fileName).toBe('test-image.jpg');

      const imageUrl = uploadService.getImageUrl(uploadResult.id);
      expect(imageUrl).toBe(`${API_BASE_URL}/upload/${uploadResult.id}`);
    });

    it('should handle different file types', async () => {
      const fileTypes = [
        { name: 'image.png', type: 'image/png' },
        { name: 'photo.jpeg', type: 'image/jpeg' },
        { name: 'picture.webp', type: 'image/webp' },
      ];

      for (const fileType of fileTypes) {
        const mockFile = new File(['content'], fileType.name, { type: fileType.type });
        
        const mockFileReader: any = {
          readAsDataURL: vi.fn(),
          result: `data:${fileType.type};base64,Y29udGVudA==`,
          onload: null,
          onerror: null,
        };

        vi.spyOn(global, 'FileReader').mockImplementation(() => {
          setTimeout(() => {
            if (mockFileReader.onload) {
              mockFileReader.onload();
            }
          }, 0);
          return mockFileReader;
        });

        const mockResponse = {
          ok: true,
          json: vi.fn().mockResolvedValue({ 
            data: { ...mockUploadedImage, fileName: fileType.name, mimeType: fileType.type } 
          }),
        };

        vi.mocked(fetch).mockResolvedValue(mockResponse as any);

        const result = await uploadService.uploadImageBase64('supplier-1', mockFile);

        expect(result.fileName).toBe(fileType.name);
        expect(result.mimeType).toBe(fileType.type);
      }
    });
  });
});