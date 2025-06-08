import React, { useState } from 'react';
import { DEFAULT_PROFILE_IMAGE } from '../../assets/defaultProfilePicture';

interface ProfileImageProps {
  imageData?: Uint8Array | null;
  alt: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const ProfileImage: React.FC<ProfileImageProps> = ({
  imageData,
  alt,
  size = 'medium',
  className = '',
}) => {
  const [error, setError] = useState(false);

  let imageSrc = DEFAULT_PROFILE_IMAGE;

  if (imageData && !error) {
    try {
      const binary = Array.from(imageData)
        .map(byte => String.fromCharCode(byte))
        .join('');

      const base64 = btoa(binary);
      imageSrc = `data:image/jpeg;base64,${base64}`;
    } catch (e) {
      console.error('Błąd konwersji obrazu:', e);
    }
  }

  const handleError = () => {
    setError(true);
  };

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-20 h-20',
  };

  return (
    <img
      src={error ? DEFAULT_PROFILE_IMAGE : imageSrc}
      alt={alt}
      className={`rounded-full object-cover ${sizeClasses[size]} ${className}`}
      onError={handleError}
    />
  );
};
