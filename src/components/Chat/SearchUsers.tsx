import React from 'react';
import {UserMiniDto} from '../../types/user/UserMiniDto';
import './SearchUsers.scss';

const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyMCIgZmlsbD0iI2U5ZWNlZiIvPjxjaXJjbGUgY3g9IjEyOCIgY3k9IjExMCIgcj0iMzUiIGZpbGw9IiM2Yzc1N2QiLz48cGF0aCBkPSJNMTk4LDE4OGMwLTI1LjQtMzEuNC00Ni03MC00NnMtNzAsMjAuNi03MCw0NnMzMS40LDQ2LDcwLDQ2UzE5OCwyMTMuNCwxOTgsMTg4WiIgZmlsbD0iIzZjNzU3ZCIvPjwvc3ZnPg==";

interface SearchUsersProps {
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    onSearch: () => Promise<void>;
    searchResults: UserMiniDto[];
    onSelectUser: (userId: string) => void;
    onCancel: () => void;
    isSearching: boolean;
    activeUserId?: string;
}

const SearchUsers: React.FC<SearchUsersProps> = ({
                                                     searchQuery,
                                                     onSearchQueryChange,
                                                     onSearch,
                                                     searchResults,
                                                     onSelectUser,
                                                     onCancel,
                                                     isSearching,
                                                     activeUserId
                                                 }) => {
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
                    onChange={(e) => onSearchQueryChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button
                    onClick={() => searchQuery.trim() && onSearch()}
                    className="search-button"
                    disabled={!searchQuery.trim()}
                    title="Szukaj użytkowników"
                    aria-label="Szukaj użytkowników"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35"/>
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
                            {searchResults.map((user) => (
                                <li
                                    key={user.id}
                                    onClick={() => user.id && onSelectUser(user.id)}
                                    className={activeUserId === user.id ? 'active-user' : ''}
                                >
                                    <div className="user-avatar">
                                        <img
                                            src={DEFAULT_AVATAR}
                                            alt={user.fullName}
                                            onError={(e) => {
                                                const target = e.currentTarget as HTMLImageElement;
                                                target.src = DEFAULT_AVATAR;
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