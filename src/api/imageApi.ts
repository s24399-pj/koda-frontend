/**
 * Module for handling image uploads and processing
 * @module services/imageService
 */

import axios from 'axios';

/** Base API URL for image-related endpoints */
const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

/**
 * Interface for image upload response
 * @interface ImageUploadResponse
 */
export interface ImageUploadResponse {
  id: string;
  url: string;
  filename: string;
  size: number;
  contentType: string;
  sortOrder: number;
}

/**
 * Gets the authentication token from local storage
 * @function getAuthToken
 * @returns {string|null} Authentication token or null if not found
 */
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const possibleKeys = ['accessToken', 'authToken', 'token', 'auth_token'];

    for (const key of possibleKeys) {
      const token = localStorage.getItem(key);
      if (token) {
        return token;
      }
    }

    return null;
  }
  return null;
};

/**
 * Uploads multiple images for an offer
 * @async
 * @function uploadMultipleImages
 * @param {string} offerId - ID of the offer
 * @param {File[]} files - Array of image files to upload
 * @returns {Promise<ImageUploadResponse[]>} Upload responses
 * @throws {Error} Upload error
 */
export const uploadMultipleImages = async (
  offerId: string,
  files: File[]
): Promise<ImageUploadResponse[]> => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });

  try {
    const token = getAuthToken();

    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.post(`${API_BASE_URL}/images/${offerId}/upload`, formData, {
      headers,
      timeout: 30000,
      onUploadProgress: progressEvent => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          `HTTP ${error.response.status}: ${error.response.statusText}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error('No response from server. Check your internet connection.');
      } else {
        throw new Error(`Configuration error: ${error.message}`);
      }
    }

    throw new Error('Unknown error occurred while uploading images');
  }
};

/**
 * Uploads multiple images without associating them with an offer
 * @async
 * @function uploadMultipleImagesWithoutOffer
 * @param {File[]} files - Array of image files to upload
 * @returns {Promise<ImageUploadResponse[]>} Upload responses
 * @throws {Error} Upload error
 */
export const uploadMultipleImagesWithoutOffer = async (
  files: File[]
): Promise<ImageUploadResponse[]> => {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('images', file);
  });

  try {
    const token = getAuthToken();

    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.post(`${API_BASE_URL}/images/upload`, formData, {
      headers,
      timeout: 30000,
      onUploadProgress: progressEvent => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      },
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          `HTTP ${error.response.status}: ${error.response.statusText}`;
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error('No response from server. Check your internet connection.');
      } else {
        throw new Error(`Configuration error: ${error.message}`);
      }
    }

    throw new Error('Unknown error occurred while uploading images');
  }
};

/**
 * Deletes an image by ID
 * @async
 * @function deleteImage
 * @param {string} imageId - ID of the image to delete
 * @returns {Promise<void>} Promise resolved when the image is deleted
 * @throws {Error} Deletion error
 */
export const deleteImage = async (imageId: string): Promise<void> => {
  try {
    const token = getAuthToken();
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    await axios.delete(`${API_BASE_URL}/images/${imageId}`, {
      headers,
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Error while deleting image');
    }
    throw new Error('Network error while deleting image');
  }
};

/**
 * Validates an image file for upload
 * @function validateImageFile
 * @param {File} file - File to validate
 * @returns {string|null} Error message or null if valid
 */
export const validateImageFile = (file: File): string | null => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSizeInMB = 5;
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    return `Unsupported file format. Allowed formats: ${allowedTypes.join(', ')}`;
  }

  if (file.size > maxSizeInBytes) {
    return `File is too large. Maximum size: ${maxSizeInMB}MB`;
  }

  return null;
};

/**
 * Compresses an image file
 * @async
 * @function compressImage
 * @param {File} file - Image file to compress
 * @param {number} [maxWidth=1920] - Maximum width of the compressed image
 * @param {number} [quality=0.8] - Compression quality (0-1)
 * @returns {Promise<File>} Compressed image file
 * @throws {Error} Compression error
 */
export const compressImage = (
  file: File,
  maxWidth: number = 1920,
  quality: number = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      const newWidth = img.width * ratio;
      const newHeight = img.height * ratio;

      canvas.width = newWidth;
      canvas.height = newHeight;

      ctx?.drawImage(img, 0, 0, newWidth, newHeight);

      canvas.toBlob(
        blob => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Image compression error'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error('Image loading error'));
    img.src = URL.createObjectURL(file);
  });
};
