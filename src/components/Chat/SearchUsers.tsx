import React from 'react';
import {UserProfile} from '../../types/user/UserProfile';

const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyMCIgZmlsbD0iI2U5ZWNlZiIvPjxjaXJjbGUgY3g9IjEyOCIgY3k9IjExMCIgcj0iMzUiIGZpbGw9IiM2Yzc1N2QiLz48cGF0aCBkPSJNMTk4LDE4OGMwLTI1LjQtMzEuNC00Ni03MC00NnMtNzAsMjAuNi03MCw0NnMzMS40LDQ2LDcwLDQ2UzE5OCwyMTMuNCwxOTgsMTg4WiIgZmlsbD0iIzZjNzU3ZCIvPjwvc3ZnPg==";

interface SearchUsersProps {
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    onSearch: () => Promise<void>;
    searchResults: UserProfile[];
    onSelectUser: (userId: string) => void;
    onCancel: () => void;
    isSearching: boolean;
}

const SearchUsers: React.FC<SearchUsersProps> = ({
                                                     searchQuery,
                                                     onSearchQueryChange,
                                                     onSearch,
                                                     searchResults,
                                                     onSelectUser,
                                                     onCancel,
                                                     isSearching
                                                 }) => {
    return (
        <>
            <div className="chat-search">
                <input
                    type="text"
                    placeholder="Szukaj użytkowników..."
                    value={searchQuery}
                    onChange={(e) => onSearchQueryChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                />
                <button onClick={onSearch} className="search-button">
                    <i className="fas fa-search"></i>
                </button>
            </div>

            {isSearching && searchResults.length > 0 && (
                <div className="search-results">
                    <h3>Wyniki wyszukiwania</h3>
                    <ul>
                        {searchResults.map((user) => (
                            <li key={user.id} onClick={() => user.id && onSelectUser(user.id)}>
                                <div className="user-avatar">
                                    <img
                                        src={user.profilePictureBase64 || DEFAULT_AVATAR}
                                        alt={`${user.firstName} ${user.lastName}`}
                                        onError={(e) => {
                                            const target = e.currentTarget as HTMLImageElement;
                                            target.src = DEFAULT_AVATAR;
                                        }}
                                    />
                                </div>
                                <div className="user-info">
                                    <span className="user-name">{user.firstName} {user.lastName}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <button className="back-button" onClick={onCancel}>
                        Powrót do konwersacji
                    </button>
                </div>
            )}
        </>
    );
};

export default SearchUsers;