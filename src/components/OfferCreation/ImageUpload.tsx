import React, { useState, useCallback, useRef } from 'react';
import { validateImageFile, compressImage } from '../../api/imageApi';
import './ImageUpload.scss';
import { ImageUploadProps } from '../../types/image/ImageUploadProps.ts';

const ImageUpload: React.FC<ImageUploadProps> = ({ formik }) => {
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showCameraOptions, setShowCameraOptions] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const handleFiles = useCallback(
        async (files: FileList) => {
            setUploading(true);
            const fileArray = Array.from(files);
            const validFiles: File[] = [];
            const errors: string[] = [];

            for (const file of fileArray) {
                const error = validateImageFile(file);
                if (error) {
                    errors.push(`${file.name}: ${error}`);
                } else {
                    try {
                        const compressedFile = await compressImage(file);
                        validFiles.push(compressedFile);
                    } catch (error) {
                        errors.push(`${file.name}: Compression error`);
                    }
                }
            }

            if (errors.length > 0) {
                alert('File validation errors:\n' + errors.join('\n'));
            }

            if (validFiles.length > 0) {
                const currentFiles = formik.values.imageFiles || [];
                const newFiles = [...currentFiles, ...validFiles];

                if (newFiles.length > 10) {
                    alert('You can add maximum 10 images');
                    const limitedFiles = newFiles.slice(0, 10);
                    formik.setFieldValue('imageFiles', limitedFiles);
                } else {
                    formik.setFieldValue('imageFiles', newFiles);
                }
            }

            setUploading(false);
        },
        [formik]
    );

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);

            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFiles(e.dataTransfer.files);
            }
        },
        [handleFiles]
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files[0]) {
                handleFiles(e.target.files);
            }
        },
        [handleFiles]
    );

    const handleUploadAreaClick = useCallback(() => {
        setShowCameraOptions(true);
    }, []);

    const handleGalleryClick = useCallback(() => {
        fileInputRef.current?.click();
        setShowCameraOptions(false);
    }, []);

    const handleCameraClick = useCallback(() => {
        cameraInputRef.current?.click();
        setShowCameraOptions(false);
    }, []);

    const removeImage = useCallback(
        (index: number) => {
            const currentFiles = formik.values.imageFiles || [];
            const newFiles = currentFiles.filter((_, i) => i !== index);
            formik.setFieldValue('imageFiles', newFiles);
        },
        [formik]
    );

    const currentImages = formik.values.imageFiles || [];

    return (
        <div className="image-upload-section">
            <label>Zdjęcia *</label>

            <div
                className={`upload-area ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleUploadAreaClick}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleInputChange}
                    style={{ display: 'none' }}
                    disabled={uploading}
                />

                <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="environment"
                    onChange={handleInputChange}
                    style={{ display: 'none' }}
                    disabled={uploading}
                />

                {uploading ? (
                    <div className="upload-spinner">
                        <div className="spinner"></div>
                        <p>Processing images...</p>
                    </div>
                ) : (
                    <div className="upload-content">
                        <div className="upload-icon">📸</div>
                        <p>Click or drag images here</p>
                        <small>Supported formats: JPG, PNG, WEBP (max 5MB each)</small>
                    </div>
                )}
            </div>

            {showCameraOptions && (
                <div className="camera-options-overlay" onClick={() => setShowCameraOptions(false)}>
                    <div className="camera-options-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Dodaj zdjęcie</h3>
                        <div className="camera-options-buttons">
                            <button
                                type="button"
                                className="option-btn gallery-btn"
                                onClick={handleGalleryClick}
                            >
                                <span className="option-icon">🖼️</span>
                                <span>Z galerii</span>
                            </button>

                            <button
                                type="button"
                                className="option-btn camera-btn"
                                onClick={handleCameraClick}
                            >
                                <span className="option-icon">📷</span>
                                <span>Zrób zdjęcie</span>
                            </button>
                        </div>

                        <button
                            type="button"
                            className="close-btn"
                            onClick={() => setShowCameraOptions(false)}
                        >
                            Anuluj
                        </button>
                    </div>
                </div>
            )}

            {currentImages.length > 0 && (
                <div className="image-preview-grid">
                    {currentImages.map((file, index) => (
                        <div key={index} className="image-preview-item">
                            <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className="preview-image"
                            />
                            <button type="button" className="remove-image-btn" onClick={() => removeImage(index)}>
                                ×
                            </button>
                            {index === 0 && <div className="primary-badge">Główne</div>}
                        </div>
                    ))}
                </div>
            )}

            {formik.touched.imageFiles && formik.errors.imageFiles && (
                <div className="error-text">{String(formik.errors.imageFiles)}</div>
            )}

            <small className="image-count">{currentImages.length}/10 images</small>
        </div>
    );
};

export default ImageUpload;