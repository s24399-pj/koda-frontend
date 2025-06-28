/**
 * Component for uploading and managing images in the offer creation process
 * @module components/OfferCreation/ImageUpload
 */

import React, { useState, useCallback, useRef } from 'react';
import { validateImageFile, compressImage } from '../../api/imageApi';
import './ImageUpload.scss';
import { ImageUploadProps } from '../../types/image/ImageUploadProps.ts';

/**
 * Component for uploading, compressing and previewing images
 * Supports drag and drop, file selection and camera capture
 * @component
 * @param {ImageUploadProps} props - Component props
 * @returns {JSX.Element} The ImageUpload component
 */
const ImageUpload: React.FC<ImageUploadProps> = ({ formik }) => {
  /** State to track if a drag operation is active */
  const [dragActive, setDragActive] = useState(false);
  /** State to track if files are currently being processed */
  const [uploading, setUploading] = useState(false);
  /** State to control visibility of camera/gallery selection modal */
  const [showCameraOptions, setShowCameraOptions] = useState(false);

  /** Reference to the hidden file input element */
  const fileInputRef = useRef<HTMLInputElement>(null);
  /** Reference to the hidden camera input element */
  const cameraInputRef = useRef<HTMLInputElement>(null);

  /**
   * Processes files, validates them, compresses them and adds valid ones to formik values
   * @function handleFiles
   * @param {FileList} files - Files to process
   */
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
          alert('Możesz dodać maksymalnie 10 zdjęć');
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

  /**
   * Handles drag events to update UI state
   * @function handleDrag
   * @param {React.DragEvent} e - Drag event
   */
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  /**
   * Handles file drop events
   * @function handleDrop
   * @param {React.DragEvent} e - Drop event
   */
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

  /**
   * Handles file input change events
   * @function handleInputChange
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  /**
   * Opens the camera options modal when upload area is clicked
   * @function handleUploadAreaClick
   */
  const handleUploadAreaClick = useCallback(() => {
    setShowCameraOptions(true);
  }, []);

  /**
   * Triggers file selection dialog when gallery option is clicked
   * @function handleGalleryClick
   */
  const handleGalleryClick = useCallback(() => {
    fileInputRef.current?.click();
    setShowCameraOptions(false);
  }, []);

  /**
   * Triggers camera capture dialog when camera option is clicked
   * @function handleCameraClick
   */
  const handleCameraClick = useCallback(() => {
    cameraInputRef.current?.click();
    setShowCameraOptions(false);
  }, []);

  /**
   * Removes an image from the selected images array
   * @function removeImage
   * @param {number} index - Index of the image to remove
   */
  const removeImage = useCallback(
    (index: number) => {
      const currentFiles = formik.values.imageFiles || [];
      const newFiles = currentFiles.filter((_, i) => i !== index);
      formik.setFieldValue('imageFiles', newFiles);
    },
    [formik]
  );

  /** Array of currently selected image files */
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
            <p>Naciśnij lub przeciągnij zdjęcia</p>
            <small>Wspierane formaty: JPG, PNG, WEBP (max 5MB każde)</small>
          </div>
        )}
      </div>

      {showCameraOptions && (
        <div className="camera-options-overlay" onClick={() => setShowCameraOptions(false)}>
          <div className="camera-options-modal" onClick={e => e.stopPropagation()}>
            <h3>Dodaj zdjęcie</h3>
            <div className="camera-options-buttons">
              <button type="button" className="option-btn gallery-btn" onClick={handleGalleryClick}>
                <span className="option-icon">🖼️</span>
                <span>Z galerii</span>
              </button>

              <button type="button" className="option-btn camera-btn" onClick={handleCameraClick}>
                <span className="option-icon">📷</span>
                <span>Zrób zdjęcie</span>
              </button>
            </div>

            <button type="button" className="close-btn" onClick={() => setShowCameraOptions(false)}>
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

      <small className="image-count">{currentImages.length}/10 Zdjęć</small>
    </div>
  );
};

export default ImageUpload;
