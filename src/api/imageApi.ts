import axios from 'axios';

const API_BASE_URL = 'http://localhost:8137/api/v1';

export interface ImageUploadResponse {
    id: string;
    url: string;
    filename: string;
    size: number;
    contentType: string;
    sortOrder: number;
}

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

export const uploadMultipleImages = async (offerId: string, files: File[]): Promise<ImageUploadResponse[]> => {
    const formData = new FormData();
    files.forEach((file) => {
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
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(`📊 Upload progress: ${percentCompleted}%`);
                }
            }
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                const errorMessage = error.response.data?.message ||
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

export const uploadMultipleImagesWithoutOffer = async (files: File[]): Promise<ImageUploadResponse[]> => {
    const formData = new FormData();
    files.forEach((file) => {
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
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    console.log(`📊 Upload progress: ${percentCompleted}%`);
                }
            }
        });

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response) {
                const errorMessage = error.response.data?.message ||
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

export const deleteImage = async (imageId: string): Promise<void> => {
    try {
        const token = getAuthToken();
        const headers: Record<string, string> = {};

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        await axios.delete(`${API_BASE_URL}/images/${imageId}`, {
            headers
        });
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Error while deleting image');
        }
        throw new Error('Network error while deleting image');
    }
};

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

export const compressImage = (file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> => {
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
                (blob) => {
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