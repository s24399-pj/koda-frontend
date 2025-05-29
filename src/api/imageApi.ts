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
                console.log(`🔑 Found token at key: ${key}`);
                return token;
            }
        }

        console.warn('❌ No auth token found in localStorage');
        return null;
    }
    return null;
};


export const uploadMultipleImages = async (files: File[]): Promise<ImageUploadResponse[]> => {
    console.log('=== DEBUG API CONFIG ===');
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('Final upload URL:', `${API_BASE_URL}/images/upload`);
    console.log('Expected URL should be: http://localhost:8137/api/v1/images/upload');
    console.log('Environment variables:');
    console.log('VITE_API_URL:', import.meta.env?.VITE_API_URL);
    console.log('REACT_APP_API_URL:', process.env?.REACT_APP_API_URL);
    console.log('========================');

    console.log('=== DEBUG UPLOAD START ===');

    const formData = new FormData();
    files.forEach((file) => {
        formData.append('images', file);
    });

    try {
        const token = getAuthToken();
        console.log('🔑 Token retrieved:', token ? 'EXISTS' : 'MISSING');
        console.log('🔑 Token length:', token?.length || 0);
        console.log('🔑 Token starts with:', token?.substring(0, 20) + '...');

        const headers: Record<string, string> = {};

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
            console.log('✅ Authorization header set');
        } else {
            console.error('❌ NO TOKEN - Request will fail');
        }

        console.log('📤 Sending request to:', `${API_BASE_URL}/images/upload`);
        console.log('📤 Headers:', headers);

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

        console.log('✅ Upload successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Upload failed:', error);

        if (axios.isAxiosError(error)) {
            if (error.response) {
                const errorMessage = error.response.data?.message ||
                    error.response.data?.error ||
                    `HTTP ${error.response.status}: ${error.response.statusText}`;
                throw new Error(errorMessage);
            } else if (error.request) {
                throw new Error('Brak odpowiedzi z serwera. Sprawdź połączenie internetowe.');
            } else {
                throw new Error(`Błąd konfiguracji: ${error.message}`);
            }
        }

        throw new Error('Nieznany błąd podczas przesyłania zdjęć');
    }
};

/**
 * Usuwa zdjęcie z serwera
 */
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
            throw new Error(error.response.data.message || 'Błąd podczas usuwania zdjęcia');
        }
        throw new Error('Błąd sieci podczas usuwania zdjęcia');
    }
};

/**
 * Pomocnicza funkcja do walidacji obrazów
 */
export const validateImageFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSizeInMB = 5;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
        return `Nieobsługiwany format pliku. Dozwolone formaty: ${allowedTypes.join(', ')}`;
    }

    if (file.size > maxSizeInBytes) {
        return `Plik jest za duży. Maksymalny rozmiar: ${maxSizeInMB}MB`;
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
                        reject(new Error('Błąd kompresji obrazu'));
                    }
                },
                file.type,
                quality
            );
        };

        img.onerror = () => reject(new Error('Błąd ładowania obrazu'));
        img.src = URL.createObjectURL(file);
    });
};