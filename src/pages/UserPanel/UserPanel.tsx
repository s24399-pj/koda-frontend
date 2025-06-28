import React, { useEffect, useState } from 'react';
import { UserProfile } from '../../types/user/UserProfile';
import './UserPanel.scss';
import { getUserProfile } from '../../api/useInternalApi';
import UserOffers from '../../components/UserOffers/UserOffers';

const DEFAULT_AVATAR =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyMCIgZmlsbD0iI2U5ZWNlZiIvPjxjaXJjbGUgY3g9IjEyOCIgY3k9IjExMCIgcj0iMzUiIGZpbGw9IiM2Yzc1N2QiLz48cGF0aCBkPSJNMTk4LDE4OGMwLTI1LjQtMzEuNC00Ni03MC00NnMtNzAsMjAuNi03MCw0NnMzMS40LDQ2LDcwLDQ2UzE5OCwyMTMuNCwxOTgsMTg4WiIgZmlsbD0iIzZjNzU3ZCIvPjwvc3ZnPg==';

const UserPanel: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string>(DEFAULT_AVATAR);
  const [activeTab, setActiveTab] = useState<'profile' | 'offers' | 'settings'>('profile');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const profile = await getUserProfile();
        setUserProfile(profile);

        if (profile.profilePictureBase64) {
          setProfileImage(profile.profilePictureBase64);
        }

        if (profile.id) {
          localStorage.setItem('userId', profile.id);
        }
      } catch (err) {
        setError('Nie udało się pobrać danych użytkownika.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleProfileImageError = () => {
    setProfileImage(DEFAULT_AVATAR);
  };

  const handleTabChange = (tab: 'profile' | 'offers' | 'settings') => {
    setActiveTab(tab);
  };

  if (loading) {
    return <div className="user-panel-loading">Ładowanie danych użytkownika...</div>;
  }

  if (error) {
    return <div className="user-panel-error">{error}</div>;
  }

  return (
    <div className="user-panel-container">
      <div className="user-panel-sidebar">
        <div className="user-profile-header">
          <div className="profile-image-container">
            <img
              src={profileImage}
              alt="Zdjęcie profilowe"
              className="profile-image"
              onError={handleProfileImageError}
            />
          </div>
          <h2 className="user-name">
            {userProfile?.firstName} {userProfile?.lastName}
          </h2>
          <p className="user-email">{userProfile?.email}</p>
          <p className="user-phone">{userProfile?.phoneNumber}</p>
        </div>

        <nav className="user-navigation">
          <ul>
            <li
              className={activeTab === 'profile' ? 'active' : ''}
              onClick={() => handleTabChange('profile')}
            >
              Mój Profil
            </li>
            <li
              className={activeTab === 'offers' ? 'active' : ''}
              onClick={() => handleTabChange('offers')}
            >
              Moje Ogłoszenia
            </li>
            <li
              className={activeTab === 'settings' ? 'active' : ''}
              onClick={() => handleTabChange('settings')}
            >
              Ustawienia Konta
            </li>
          </ul>
        </nav>
      </div>

      <div className="user-panel-content">
        {activeTab === 'profile' && (
          <div className="profile-section">
            <h3>Informacje o profilu</h3>
            <div className="profile-details">
              <div className="detail-group">
                <label>Imię:</label>
                <p>{userProfile?.firstName || 'Nie ustawiono'}</p>
              </div>
              <div className="detail-group">
                <label>Nazwisko:</label>
                <p>{userProfile?.lastName || 'Nie ustawiono'}</p>
              </div>
              <div className="detail-group">
                <label>Email:</label>
                <p>{userProfile?.email}</p>
                <label>Numer telefonu:</label>
                <p>{userProfile?.phoneNumber}</p>
              </div>
            </div>
            <button className="edit-profile-btn">Edytuj profil</button>
          </div>
        )}

        {activeTab === 'offers' && <UserOffers />}

        {activeTab === 'settings' && (
          <div className="settings-section">
            <h3>Ustawienia konta</h3>
            <div className="settings-options">
              <div className="settings-group">
                <h4>Zmiana hasła</h4>
                <form className="password-change-form">
                  <div className="form-group">
                    <label htmlFor="current-password">Obecne hasło</label>
                    <input
                      type="password"
                      id="current-password"
                      name="current-password"
                      placeholder="Wprowadź obecne hasło"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="new-password">Nowe hasło</label>
                    <input
                      type="password"
                      id="new-password"
                      name="new-password"
                      placeholder="Wprowadź nowe hasło"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirm-password">Potwierdź hasło</label>
                    <input
                      type="password"
                      id="confirm-password"
                      name="confirm-password"
                      placeholder="Potwierdź nowe hasło"
                    />
                  </div>
                  <button type="submit" className="change-password-btn">
                    Zmień hasło
                  </button>
                </form>
              </div>

              <div className="settings-group">
                <h4>Zdjęcie profilowe</h4>
                <div className="profile-image-upload">
                  <div className="current-profile-image">
                    <img
                      src={profileImage}
                      alt="Aktualne zdjęcie profilowe"
                      onError={handleProfileImageError}
                    />
                  </div>
                  <div className="upload-controls">
                    <label htmlFor="profile-image-upload" className="upload-btn">
                      Wybierz nowe zdjęcie
                    </label>
                    <input
                      type="file"
                      id="profile-image-upload"
                      name="profile-image-upload"
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    <button className="remove-image-btn">Usuń zdjęcie</button>
                  </div>
                </div>
              </div>

              <div className="settings-group">
                <h4>Usuń konto</h4>
                <p className="danger-text">
                  Usunięcie konta spowoduje trwałe usunięcie wszystkich Twoich danych, w tym
                  ogłoszeń, profilu i preferencji. Tej operacji nie można cofnąć.
                </p>
                <button className="delete-account-btn">Usuń konto</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPanel;