import React, { useState, useRef } from 'react';
import { FormikProps } from 'formik';
import { OfferFormValues } from '../../types/offer/OfferTypes';
import { uploadMultipleImages, deleteImage, validateImageFile } from '../../api/imageApi';

interface UploadedImage {
    id: string;
    url: string;
    filename: string;
    size: number;
    preview: string;
    sortOrder: number;
}

interface ImageUploadProps {
    formik: FormikProps<OfferFormValues>;
    maxImages?: number;
    maxSizePerImage?: number;
    acceptedFormats?: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
                                                     formik,
                                                     maxImages = 10,
                                                     maxSizePerImage = 5,
                                                     acceptedFormats = ['image/jpeg', 'image/png', 'image/webp']
                                                 }) => {
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getApiUrl = (): string => {
        return 'http://localhost:8137';
    };

    const validateFile = (file: File): string | null => {
        return validateImageFile(file);
    };

    const handleFiles = async (files: FileList) => {
        setUploadError(null);
        const fileArray = Array.from(files);

        if (images.length + fileArray.length > maxImages) {
            setUploadError(`Możesz dodać maksymalnie ${maxImages} zdjęć`);
            return;
        }

        // Walidacja plików
        for (const file of fileArray) {
            const error = validateFile(file);
            if (error) {
                setUploadError(error);
                return;
            }
        }

        setIsUploading(true);
        setUploadProgress(0);

        try {
            setUploadProgress(25);

            // Przesłanie zdjęć na serwer
            const uploadedImages = await uploadMultipleImages(fileArray);
            setUploadProgress(75);

            // Konwersja do formatu używanego przez komponent
            const newImages: UploadedImage[] = uploadedImages.map((uploaded, index) => ({
                id: uploaded.id,
                url: uploaded.url,
                filename: uploaded.filename,
                size: uploaded.size,
                preview: `${getApiUrl()}${uploaded.url}`,
                sortOrder: images.length + index
            }));

            setUploadProgress(100);

            const allImages = [...images, ...newImages];
            setImages(allImages);

            // Aktualizuj formik z ID zdjęć
            const imageIds = allImages.map(img => img.id);
            formik.setFieldValue('images', imageIds);

        } catch (error) {
            console.error('Błąd podczas przesyłania zdjęć:', error);
            setUploadError(error instanceof Error ? error.message : 'Błąd podczas przesyłania zdjęć');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFiles(files);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFiles(files);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeImage = async (id: string) => {
        setUploadError(null);

        try {
            await deleteImage(id);
            const newImages = images.filter(img => img.id !== id);
            setImages(newImages);
            const imageIds = newImages.map(img => img.id);
            formik.setFieldValue('images', imageIds);
        } catch (error) {
            console.error('Błąd podczas usuwania zdjęcia:', error);
            setUploadError(error instanceof Error ? error.message : 'Błąd podczas usuwania zdjęcia');
        }
    };

    const moveImage = (fromIndex: number, toIndex: number) => {
        const newImages = [...images];
        const [movedImage] = newImages.splice(fromIndex, 1);
        newImages.splice(toIndex, 0, movedImage);

        newImages.forEach((img, index) => {
            img.sortOrder = index;
        });

        setImages(newImages);
        const imageIds = newImages.map(img => img.id);
        formik.setFieldValue('images', imageIds);
    };

    const setMainImage = (id: string) => {
        const imageIndex = images.findIndex(img => img.id === id);
        if (imageIndex > 0) {
            moveImage(imageIndex, 0);
        }
    };

    const handleDropZoneClick = () => {
        if (!isUploading && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="image-upload-container">
            <div className="form-group">
                <label>Zdjęcia pojazdu *</label>

                <div
                    className={`image-drop-zone ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={handleDropZoneClick}
                    role="button"
                    tabIndex={0}
                    aria-label="Obszar przesyłania zdjęć"
                >
                    <div className="drop-zone-content">
                        {isUploading ? (
                            <>
                                <div className="upload-spinner"></div>
                                <p>Przesyłanie zdjęć... {uploadProgress}%</p>
                                <div className="upload-progress-bar">
                                    <div
                                        className="upload-progress-fill"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            </>
                        ) : (
                            <>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                    <circle cx="8.5" cy="8.5" r="1.5"/>
                                    <polyline points="21,15 16,10 5,21"/>
                                </svg>
                                <p>Przeciągnij zdjęcia tutaj lub kliknij aby wybrać</p>
                                <small>
                                    Maksymalnie {maxImages} zdjęć, każde do {maxSizePerImage}MB
                                    <br />
                                    Obsługiwane formaty: JPG, PNG, WebP
                                </small>
                            </>
                        )}
                    </div>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedFormats.join(',')}
                    multiple
                    onChange={handleFileSelect}
                    disabled={isUploading}
                    style={{ display: 'none' }}
                />

                {uploadError && (
                    <div className="error-text">{uploadError}</div>
                )}

                {formik.touched.images && formik.errors.images && (
                    <div className="error-text">{String(formik.errors.images)}</div>
                )}

                <small>
                    Pierwsze zdjęcie będzie zdjęciem głównym ogłoszenia. Wymagane jest co najmniej jedno zdjęcie.
                </small>
            </div>

            {images.length > 0 && (
                <div className="uploaded-images">
                    <h4>Dodane zdjęcia ({images.length}/{maxImages})</h4>
                    <div className="images-grid">
                        {images.map((image, index) => (
                            <div key={image.id} className="image-item">
                                <div className="image-preview">
                                    <img src={image.preview} alt={`Zdjęcie ${index + 1}`} />

                                    {index === 0 && (
                                        <div className="main-image-badge">Główne</div>
                                    )}

                                    <div className="image-actions">
                                        {index !== 0 && (
                                            <button
                                                type="button"
                                                className="action-btn main-btn"
                                                onClick={() => setMainImage(image.id)}
                                                title="Ustaw jako główne"
                                                aria-label="Ustaw jako główne zdjęcie"
                                            >
                                                ⭐
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            className="action-btn remove-btn"
                                            onClick={() => removeImage(image.id)}
                                            title="Usuń zdjęcie"
                                            aria-label="Usuń zdjęcie"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>

                                <div className="image-info">
                                    <small>{image.filename}</small>
                                    <small>{(image.size / 1024 / 1024).toFixed(2)} MB</small>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;