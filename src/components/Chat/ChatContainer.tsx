import React, {useEffect, useState} from 'react';
import ChatUserList from './ChatUserList';
import ChatConversation from './ChatConversation';
import './ChatContainer.scss';
import {UserProfile} from '../../types/user/UserProfile';
import {useNavigate} from "react-router-dom";
import {getUserProfile, searchUsers} from "../../api/useInternalApi.ts";

const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyMCIgZmlsbD0iI2U5ZWNlZiIvPjxjaXJjbGUgY3g9IjEyOCIgY3k9IjExMCIgcj0iMzUiIGZpbGw9IiM2Yzc1N2QiLz48cGF0aCBkPSJNMTk4LDE4OGMwLTI1LjQtMzEuNC00Ni03MC00NnMtNzAsMjAuNi03MCw0NnMzMS40LDQ2LDcwLDQ2UzE5OCwyMTMuNCwxOTgsMTg4WiIgZmlsbD0iIzZjNzU3ZCIvPjwvc3ZnPg==";

const ChatContainer: React.FC = () => {
    const navigate = useNavigate();
    const [activeUserId, setActiveUserId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);

    useEffect(() => {
        const pathname = window.location.pathname;
        const match = pathname.match(/\/chat\/(.+)/);
        if (match && match[1]) {
            setActiveUserId(match[1]);
        }
    }, []);

    const handleSelectUser = (userId: string | undefined) => {
        if (!userId) return;

        console.log("ChatContainer: Wybrano użytkownika:", userId);
        setActiveUserId(userId);
        navigate(`/chat/${userId}`);
    }

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        try {
            setIsSearching(true);
            const results = await searchUsers(searchQuery);
            const currentUser = await getUserProfile();
            const filteredResults = results.filter(user => user.id !== currentUser.id);
            setSearchResults(filteredResults);
        } catch (error) {
            console.error('Error searching users:', error);
            setIsSearching(false);
        }
    };

    const handleSearchResultClick = (userId: string | undefined) => {
        if (!userId) return;

        setActiveUserId(userId);
        navigate(`/chat/${userId}`);
        setIsSearching(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    return (
        <div className="chat-container">
            <div className="chat-sidebar">
                <div className="chat-search">
                    <input
                        type="text"
                        placeholder="Szukaj użytkowników..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button onClick={handleSearch} className="search-button">
                        <i className="fas fa-search"></i>
                    </button>
                </div>

                {isSearching && searchResults.length > 0 ? (
                    <div className="search-results">
                        <h3>Wyniki wyszukiwania</h3>
                        <ul>
                            {searchResults.map((user) => (
                                <li key={user.id} onClick={() => user.id && handleSearchResultClick(user.id)}>
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
                        <button
                            className="back-button"
                            onClick={() => {
                                setIsSearching(false);
                                setSearchQuery('');
                                setSearchResults([]);
                            }}
                        >
                            Powrót do konwersacji
                        </button>
                    </div>
                ) : (
                    <ChatUserList onSelectUser={handleSelectUser} activeUserId={activeUserId || undefined}/>
                )}
            </div>

            <div className="chat-main">
                {activeUserId ? (
                    <ChatConversation recipientId={activeUserId}/>
                ) : (
                    <div className="no-conversation-selected">
                        <h3>Wybierz konwersację lub wyszukaj użytkownika, aby rozpocząć czat</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatContainer;