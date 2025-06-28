/**
 * Component for searching and displaying user search results in a chat interface
 * @module components/chat/SearchUsers
 */

import React from 'react';
import './SearchUsers.scss';
import { DEFAULT_PROFILE_IMAGE } from '../../assets/defaultProfilePicture.ts';
import { SearchUsersProps } from '../../types/chat/SearchUsersProps.ts';

/**
 * Component for searching users and displaying search results
 * @component
 * @param {SearchUsersProps} props - Component props
 * @returns {JSX.Element} The SearchUsers component
 */
const SearchUsers: React.FC<SearchUsersProps> = ({
  searchQuery,
  onSearchQueryChange,
  onSearch,
  searchResults,
  onSelectUser,
  onCancel,
  isSearching,
  activeUserId,
}) => {
  /**
   * Handles keyboard events for the search input
   * @function handleKeyDown
   * @param {React.KeyboardEvent} e - Keyboard event
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchQuery.trim()) {
        onSearch();
      }
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <>
      <div className="chat-search">
        <input
          type="text"
          placeholder="Szukaj użytkowników..."
          value={searchQuery}
          onChange={e => onSearchQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={() => searchQuery.trim() && onSearch()}
          className="search-button"
          disabled={!searchQuery.trim()}
          title="Szukaj użytkowników"
          aria-label="Szukaj użytkowników"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>
      </div>
      {isSearching && (
        <div className="search-results">
          <div className="search-header">
            <h3>Wyniki dla "{searchQuery}"</h3>
            <button className="close-search-button" onClick={onCancel}>
              ✕
            </button>
          </div>
          {searchResults.length > 0 ? (
            <ul>
              {searchResults.map(user => (
                <li
                  key={user.id}
                  onClick={() => user.id && onSelectUser(user.id)}
                  className={activeUserId === user.id ? 'active-user' : ''}
                >
                  <div className="user-avatar">
                    <img
                      src={DEFAULT_PROFILE_IMAGE}
                      alt={user.fullName}
                      onError={e => {
                        /**
                         * Handles image loading error by setting default profile image
                         * @param {React.SyntheticEvent<HTMLImageElement, Event>} e - Image error event
                         */
                        const target = e.currentTarget as HTMLImageElement;
                        target.src = DEFAULT_PROFILE_IMAGE;
                      }}
                    />
                  </div>
                  <div className="user-info">
                    <span className="user-name">{user.fullName}</span>
                    {activeUserId === user.id && (
                      <span className="active-indicator">Aktywna rozmowa</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-search-results">
              <div className="no-results-icon">🔍</div>
              <h4>Brak wyników</h4>
              <p>Nie znaleziono użytkowników dla "{searchQuery}"</p>
            </div>
          )}
          <button className="back-button" onClick={onCancel}>
            ← Powrót do konwersacji
          </button>
        </div>
      )}
    </>
  );
};

export default SearchUsers;