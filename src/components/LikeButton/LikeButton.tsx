import React, { useState, useEffect } from 'react';
import { likedOfferApi } from '../../api/likedOfferApi';
import './LikeButton.scss';

interface LikeButtonProps {
  offerId: string;
  initialLiked?: boolean;
  onLikeToggle?: (isLiked: boolean) => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({ offerId, initialLiked = false, onLikeToggle }) => {
  const [liked, setLiked] = useState(initialLiked);
  const [isLoading, setIsLoading] = useState(false);

  const isUserLoggedIn = () => {
    const token = localStorage.getItem('accessToken');
    return !!token;
  };

  useEffect(() => {
    if (offerId && isUserLoggedIn()) {
      checkLikeStatus();
    }
  }, [offerId]);

  const checkLikeStatus = async () => {
    if (!offerId) return;

    try {
      const isLiked = await likedOfferApi.isOfferLiked(offerId);
      setLiked(isLiked);
    } catch (error) {
      console.error('Błąd podczas sprawdzania statusu polubienia:', error);
    }
  };

  const toggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!isUserLoggedIn()) {
      alert('Zaloguj się, aby dodać ofertę do ulubionych');
      return;
    }

    if (isLoading || !offerId) return;

    const newLikedState = !liked;
    setLiked(newLikedState);

    if (onLikeToggle) {
      onLikeToggle(newLikedState);
    }

    setIsLoading(true);

    try {
      if (newLikedState) {
        await likedOfferApi.likeOffer(offerId);
      } else {
        await likedOfferApi.unlikeOffer(offerId);
      }
    } catch (error) {
      console.error('Błąd podczas aktualizacji statusu polubienia:', error);

      setLiked(!newLikedState);

      if (onLikeToggle) {
        onLikeToggle(!newLikedState);
      }

      alert('Wystąpił błąd podczas aktualizacji statusu polubienia.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!offerId) {
    return null;
  }

  return (
    <button
      className={`like-button ${liked ? 'liked' : ''}`}
      onClick={toggleLike}
      disabled={isLoading}
      aria-label={liked ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
    >
      {isLoading ? (
        <svg width="20" height="20" viewBox="0 0 24 24">
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            opacity="0.25"
          />
          <path
            d="M12 2a10 10 0 0 1 10 10"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 12 12"
              to="360 12 12"
              dur="1s"
              repeatCount="indefinite"
            />
          </path>
        </svg>
      ) : liked ? (
        <svg width="20" height="20" fill="#3b82f6" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ) : (
        <svg
          width="20"
          height="20"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      )}
    </button>
  );
};

export default LikeButton;