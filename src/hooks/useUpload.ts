import { useState, useCallback } from 'react';
import apiClient from '@/lib/api/client';

export interface UploadOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  onProgress?: (progress: number) => void;
}

export interface UploadResult {
  url: string;
  name: string;
  size: number;
  type: string;
}

export interface UseUploadReturn {
  upload: (file: File, endpoint?: string, options?: UploadOptions) => Promise<UploadResult>;
  uploadMultiple: (files: File[], endpoint?: string, options?: UploadOptions) => Promise<UploadResult[]>;
  isUploading: boolean;
  progress: number;
  error: Error | null;
}

export function useUpload(): UseUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const validateFile = useCallback((file: File, options?: UploadOptions) => {
    const { maxSize, allowedTypes } = options || {};

    if (maxSize && file.size > maxSize) {
      throw new Error(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
    }

    if (allowedTypes && allowedTypes.length > 0) {
      const fileType = file.type;
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      
      const isAllowed = allowedTypes.some(type => {
        if (type.includes('/')) {
          return fileType === type || fileType.match(new RegExp(type.replace('*', '.*')));
        }
        return fileExtension === type.replace('.', '');
      });

      if (!isAllowed) {
        throw new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
      }
    }
  }, []);

  const upload = useCallback(
    async (file: File, endpoint: string = '/api/uploads/image', options?: UploadOptions): Promise<UploadResult> => {
      try {
        setIsUploading(true);
        setProgress(0);
        setError(null);

        // Validate file
        validateFile(file, options);

        // Create form data
        const formData = new FormData();
        formData.append('file', file);

        // Upload with progress tracking
        const xhr = new XMLHttpRequest();

        return new Promise((resolve, reject) => {
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const percentComplete = (e.loaded / e.total) * 100;
              setProgress(percentComplete);
              options?.onProgress?.(percentComplete);
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve(response.file || response);
              } catch (err) {
                reject(new Error('Invalid server response'));
              }
            } else {
              try {
                const error = JSON.parse(xhr.responseText);
                reject(new Error(error.message || 'Upload failed'));
              } catch {
                reject(new Error('Upload failed'));
              }
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('Network error occurred'));
          });

          xhr.addEventListener('abort', () => {
            reject(new Error('Upload cancelled'));
          });

          xhr.open('POST', endpoint);
          xhr.send(formData);
        });
      } catch (err) {
        const uploadError = err instanceof Error ? err : new Error('Upload failed');
        setError(uploadError);
        throw uploadError;
      } finally {
        setIsUploading(false);
        setProgress(0);
      }
    },
    [validateFile]
  );

  const uploadMultiple = useCallback(
    async (files: File[], endpoint: string = '/api/uploads/image', options?: UploadOptions): Promise<UploadResult[]> => {
      try {
        setIsUploading(true);
        setError(null);

        // Validate all files first
        files.forEach(file => validateFile(file, options));

        // Upload files in parallel
        const uploadPromises = files.map(async (file, index) => {
          const progressHandler = options?.onProgress
            ? (fileProgress: number) => {
                const totalProgress = ((index + fileProgress / 100) / files.length) * 100;
                setProgress(totalProgress);
                options.onProgress!(totalProgress);
              }
            : undefined;

          return upload(file, endpoint, {
            ...options,
            onProgress: progressHandler,
          });
        });

        const results = await Promise.all(uploadPromises);
        return results;
      } catch (err) {
        const uploadError = err instanceof Error ? err : new Error('Upload failed');
        setError(uploadError);
        throw uploadError;
      } finally {
        setIsUploading(false);
        setProgress(0);
      }
    },
    [upload, validateFile]
  );

  return {
    upload,
    uploadMultiple,
    isUploading,
    progress,
    error,
  };
}

export default useUpload;