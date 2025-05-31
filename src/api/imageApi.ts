import axiosAuthClient from '../api/axiosAuthClient';
import { AxiosError } from 'axios';
import {ImageUploadResponse} from "../types/image/ImageUploadResponse.ts";

const API_URL = import.meta.env.VITE_API_URL + '/api/v1/images/';

export const uploadMultipleImages = async (offerId: string, files: File[]): Promise<ImageUploadResponse[]> => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append('images', file);
    });

    try {
        const response = await axiosAuthClient.post(`${API_URL}${offerId}/upload`, formData, {
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
        if (error instanceof AxiosError) {
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

export const uploadMultipleImagesWithoutOffer = async (files: File[]): Promise<ImageUploadResponse[]> => {
    const formData = new FormData();
    files.forEach((file) => {
        formData.append('images', file);
    });

    try {
        const response = await axiosAuthClient.post(`${API_URL}upload`, formData, {
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
        if (error instanceof AxiosError) {
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

export const deleteImage = async (imageId: string): Promise<void> => {
    try {
        await axiosAuthClient.delete(`${API_URL}${imageId}`);
    } catch (error) {
        if (error instanceof AxiosError && error.response) {
            throw new Error(error.response.data.message || 'Błąd podczas usuwania zdjęcia');
        }
        throw new Error('Błąd sieci podczas usuwania zdjęcia');
    }
};

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