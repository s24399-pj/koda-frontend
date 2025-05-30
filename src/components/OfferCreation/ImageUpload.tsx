import React, {useState, useCallback} from 'react';
import {FormikProps} from 'formik';
import {OfferFormValues} from '../../types/offer/OfferTypes';
import {validateImageFile, compressImage} from '../../api/imageApi';
import './ImageUpload.scss';

interface ImageUploadProps {
    formik: FormikProps<OfferFormValues>;
}

const ImageUpload: React.FC<ImageUploadProps> = ({formik}) => {
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);

    const handleFiles = useCallback(async (files: FileList) => {
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
                    errors.push(`${file.name}: Błąd kompresji`);
                }
            }
        }

        if (errors.length > 0) {
            alert('Błędy walidacji plików:\n' + errors.join('\n'));
        }

        if (validFiles.length > 0) {
            const currentFiles = formik.values.imageFiles || [];
            const newFiles = [...currentFiles, ...validFiles];

            if (newFiles.length > 10) {
                alert('Możesz dodać maksymalnie 10 zdjęć');
                const limitedFiles = newFiles.slice(0, 10);
                formik.setFieldValue('imageFiles', limitedFiles);
            } else {
                formik.setFieldValue('imageFiles', newFiles);
            }
        }

        setUploading(false);
    }, [formik]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    }, [handleFiles]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    }, [handleFiles]);

    const removeImage = useCallback((index: number) => {
        const currentFiles = formik.values.imageFiles || [];
        const newFiles = currentFiles.filter((_, i) => i !== index);
        formik.setFieldValue('imageFiles', newFiles);
    }, [formik]);

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
                onClick={() => document.getElementById('file-input')?.click()}
            >
                <input
                    id="file-input"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleInputChange}
                    style={{display: 'none'}}
                    disabled={uploading}
                />

                {uploading ? (
                    <div className="upload-spinner">
                        <div className="spinner"></div>
                        <p>Przetwarzanie zdjęć...</p>
                    </div>
                ) : (
                    <div className="upload-content">
                        <div className="upload-icon">📸</div>
                        <p>Kliknij lub przeciągnij zdjęcia tutaj</p>
                        <small>Obsługiwane formaty: JPG, PNG, WEBP (max 5MB każde)</small>
                    </div>
                )}
            </div>

            {currentImages.length > 0 && (
                <div className="image-preview-grid">
                    {currentImages.map((file, index) => (
                        <div key={index} className="image-preview-item">
                            <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className="preview-image"
                            />
                            <button
                                type="button"
                                className="remove-image-btn"
                                onClick={() => removeImage(index)}
                            >
                                ×
                            </button>
                            {index === 0 && (
                                <div className="primary-badge">Główne</div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {(formik.touched.imageFiles && formik.errors.imageFiles) && (
                <div className="error-text">{String(formik.errors.imageFiles)}</div>
            )}

            <small className="image-count">
                {currentImages.length}/10 zdjęć
            </small>
        </div>
    );
};

export default ImageUpload;