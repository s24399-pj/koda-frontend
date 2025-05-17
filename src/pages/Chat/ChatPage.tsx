// ChatPage.tsx
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import './ChatPage.scss';
import './ChatError.scss';
import {getUserProfile, searchUsers} from '../../api/useInternalApi';
import {UserProfile} from '../../types/user/UserProfile';
import {ChatMessage, chatService, isTokenValid} from "../../api/chatApi";

const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyMCIgZmlsbD0iI2U5ZWNlZiIvPjxjaXJjbGUgY3g9IjEyOCIgY3k9IjExMCIgcj0iMzUiIGZpbGw9IiM2Yzc1N2QiLz48cGF0aCBkPSJNMTk4LDE4OGMwLTI1LjQtMzEuNC00Ni03MC00NnMtNzAsMjAuNi03MCw0NnMzMS40LDQ2LDcwLDQ2UzE5OCwyMTMuNCwxOTgsMTg4WiIgZmlsbD0iIzZjNzU3ZCIvPjwvc3ZnPg==";

interface Conversation {
    userId: string;
    userName: string;
    profilePicture?: string;
    lastMessage?: string;
    lastMessageDate?: string;
    unreadCount: number;
}

enum ConnectionStatus {
    CONNECTED = 'connected',
    CONNECTING = 'connecting',
    DISCONNECTED = 'disconnected'
}

interface LocationState {
    sellerInfo?: {
        id: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
        email: string;
        isNewConversation: boolean;
    };
    returnUrl?: string;
}

const ChatPage: React.FC = () => {
    const {recipientId} = useParams<{ recipientId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LocationState;

    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [activeRecipientId, setActiveRecipientId] = useState<string | null>(recipientId || null);
    const [activeRecipient, setActiveRecipient] = useState<UserProfile | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [messageText, setMessageText] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const [newConversationInitialized, setNewConversationInitialized] = useState<boolean>(false);

    useEffect(() => {
        if (!isTokenValid()) {
            setConnectionError("Brak tokenu uwierzytelniającego. Zaloguj się ponownie.");
            setConnectionStatus(ConnectionStatus.DISCONNECTED);
        }
    }, []);

    useEffect(() => {
        const pathname = window.location.pathname;
        const match = pathname.match(/\/chat\/(.+)/);
        if (match && match[1] && match[1] !== activeRecipientId) {
            const newRecipientId = match[1];
            console.log("URL wskazuje na nowego odbiorcę:", newRecipientId);
            setActiveRecipientId(newRecipientId);
            if (connectionStatus === ConnectionStatus.CONNECTED) {
                loadRecipientProfile(newRecipientId);
                loadMessages(newRecipientId);
            }
        }
    }, [location.pathname, connectionStatus]);

    const connectWebSocket = useCallback(async () => {
        if (!isTokenValid()) {
            setConnectionError("Brak tokenu uwierzytelniającego. Zaloguj się ponownie.");
            setConnectionStatus(ConnectionStatus.DISCONNECTED);
            return;
        }

        try {
            setConnectionStatus(ConnectionStatus.CONNECTING);
            setConnectionError(null);
            await chatService.connect();
            setConnectionStatus(ConnectionStatus.CONNECTED);

            chatService.startReconnectScheduler(30000);

            loadUnreadMessages();
        } catch (error) {
            console.error('Błąd podczas łączenia z WebSocket:', error);
            const errorMessage = error instanceof Error ? error.message : "Nie udało się połączyć z serwerem czatu.";
            setConnectionError(errorMessage);
            setConnectionStatus(ConnectionStatus.DISCONNECTED);

            if (errorMessage.includes('token') || errorMessage.includes('Token')) {
                setTimeout(() => {
                    redirectToLogin();
                }, 3000);
            }
        }
    }, []);

    const redirectToLogin = useCallback(() => {
        localStorage.removeItem("accessToken");
        navigate('/user/login', {state: {returnUrl: window.location.pathname}});
    }, [navigate]);

    useEffect(() => {
        if (!isTokenValid()) {
            setConnectionError("Brak tokenu uwierzytelniającego. Zaloguj się ponownie.");
            setConnectionStatus(ConnectionStatus.DISCONNECTED);
            return;
        }

        const loadCurrentUser = async () => {
            try {
                const profile = await getUserProfile();
                setCurrentUser(profile);

                if (profile && profile.id) {
                    chatService.setCurrentUserId(profile.id);
                }

                await connectWebSocket();

                try {
                    const allConversations = await chatService.getAllConversations();
                    setConversations(allConversations);
                    console.log("Załadowano wszystkie konwersacje:", allConversations.length);
                } catch (error) {
                    console.error("Błąd podczas ładowania konwersacji:", error);
                }

                const unsubscribe = chatService.onMessageReceived(handleNewMessage);

                if (isInitialLoad && recipientId) {
                    console.log("Odświeżenie strony z recipientId:", recipientId);
                    setIsInitialLoad(false);
                    loadRecipientProfile(recipientId);
                    loadMessages(recipientId);
                }

                if (state?.sellerInfo && state.sellerInfo.isNewConversation) {
                    const sellerInfo = state.sellerInfo;
                    const newRecipient: UserProfile = {
                        id: sellerInfo.id,
                        firstName: sellerInfo.firstName,
                        lastName: sellerInfo.lastName,
                        email: sellerInfo.email,
                        profilePictureBase64: sellerInfo.profilePicture
                    };

                    setActiveRecipient(newRecipient);

                    const newConversation: Conversation = {
                        userId: sellerInfo.id,
                        userName: `${sellerInfo.firstName} ${sellerInfo.lastName}`,
                        profilePicture: sellerInfo.profilePicture,
                        unreadCount: 0
                    };

                    setConversations(prev => {
                        const exists = prev.some(conv => conv.userId === sellerInfo.id);
                        if (!exists) {
                            return [newConversation, ...prev];
                        }
                        return prev;
                    });

                    setNewConversationInitialized(true);
                    console.log("Nowa konwersacja zainicjalizowana ze strony oferty:", sellerInfo.id);

                    navigate(location.pathname, {replace: true});
                }

                return () => {
                    unsubscribe();
                    chatService.disconnect();
                    chatService.stopReconnectScheduler();
                };
            } catch (error) {
                console.error('Error initializing chat:', error);
                setConnectionError("Wystąpił błąd podczas inicjalizacji czatu.");
                setConnectionStatus(ConnectionStatus.DISCONNECTED);

                if ((error as any).response?.status === 401) {
                    setConnectionError("Token wygasł. Zaloguj się ponownie.");
                    setTimeout(redirectToLogin, 3000);
                }
            }
        };
        loadCurrentUser();
    }, [connectWebSocket, redirectToLogin, navigate, state, location.pathname, recipientId, isInitialLoad]);

    useEffect(() => {
        const checkConnection = setInterval(() => {
            if (chatService.isConnected()) {
                setConnectionStatus(ConnectionStatus.CONNECTED);
            } else if (connectionStatus === ConnectionStatus.CONNECTED) {
                setConnectionStatus(ConnectionStatus.DISCONNECTED);
                setConnectionError("Utracono połączenie z serwerem czatu.");

                if (!isTokenValid()) {
                    setConnectionError("Token wygasł. Zaloguj się ponownie.");
                    setTimeout(redirectToLogin, 3000);
                }
            }
        }, 30000);

        return () => clearInterval(checkConnection);
    }, [connectionStatus, redirectToLogin]);

    useEffect(() => {
        const chatElement = document.querySelector('.chat-page') as HTMLElement;
        if (chatElement) {
            chatElement.style.marginTop = '70px';
            chatElement.style.height = 'calc(100vh - 70px)';
        }

        const connectionStatus = document.querySelector('.connection-status') as HTMLElement;
        if (connectionStatus) {
            connectionStatus.style.zIndex = '10';
            connectionStatus.style.position = 'relative';
        }

        return () => {
            if (chatElement) {
                chatElement.style.marginTop = '';
                chatElement.style.height = '';
            }
        };
    }, []);

    useEffect(() => {
        if (activeRecipientId && isTokenValid() && !isInitialLoad && connectionStatus === ConnectionStatus.CONNECTED) {
            loadRecipientProfile(activeRecipientId);
            loadMessages(activeRecipientId);
            navigate(`/chat/${activeRecipientId}`);
        }
    }, [activeRecipientId, navigate, isInitialLoad, connectionStatus]);

    useEffect(() => {
        if (activeRecipient && !newConversationInitialized) {
            const existingConversation = conversations.find(conv => conv.userId === activeRecipient.id);

            if (!existingConversation && activeRecipient.id) {
                const newConversation: Conversation = {
                    userId: activeRecipient.id,
                    userName: `${activeRecipient.firstName} ${activeRecipient.lastName}`,
                    profilePicture: activeRecipient.profilePictureBase64,
                    unreadCount: 0
                };

                setConversations(prev => [newConversation, ...prev]);
                setNewConversationInitialized(true);
                console.log("Nowa konwersacja zainicjalizowana:", activeRecipient.id);
            }
        }
    }, [activeRecipient, conversations, newConversationInitialized]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadUnreadMessages = async () => {
        if (!isTokenValid()) {
            setConnectionError("Token wygasł. Zaloguj się ponownie.");
            setTimeout(redirectToLogin, 3000);
            return;
        }

        try {
            const unreadMessages = await chatService.getUnreadMessages();
            console.log("Załadowano nieprzeczytane wiadomości:", unreadMessages.length);

            updateConversationsFromMessages(unreadMessages);
        } catch (error) {
            console.error('Error loading unread messages:', error);

            if ((error as any).response?.status === 401 || error instanceof Error && error.message.includes('Token')) {
                setConnectionError("Token wygasł. Zaloguj się ponownie.");
                setTimeout(redirectToLogin, 3000);
            }
        }
    };

    const loadMessages = async (recipientId: string) => {
        if (connectionStatus !== ConnectionStatus.CONNECTED) {
            console.warn('Próba załadowania wiadomości bez połączenia WebSocket');
            return;
        }

        if (!isTokenValid()) {
            setConnectionError("Token wygasł. Zaloguj się ponownie.");
            setTimeout(redirectToLogin, 3000);
            return;
        }

        try {
            console.log("Ładowanie historii czatu dla:", recipientId);
            const chatHistory = await chatService.getChatHistory(recipientId);
            console.log("Załadowano wiadomości:", chatHistory.length);

            if (chatHistory.length === 0) {
                console.warn("Brak wiadomości w historii czatu dla:", recipientId);
            }

            setMessages(chatHistory);

            markMessagesAsRead(chatHistory);
            updateConversationsFromMessages(chatHistory);
        } catch (error) {
            console.error('Error loading chat history:', error);
            setMessages([]);

            if ((error as any).response?.status === 401 || error instanceof Error && error.message.includes('Token')) {
                setConnectionError("Token wygasł. Zaloguj się ponownie.");
                setTimeout(redirectToLogin, 3000);
            }
        }
    };

    const loadRecipientProfile = async (userId: string) => {
        if (!isTokenValid()) {
            setConnectionError("Token wygasł. Zaloguj się ponownie.");
            setTimeout(redirectToLogin, 3000);
            return;
        }

        try {
            console.log("Ładowanie profilu odbiorcy:", userId);
            const profile = await getUserProfile(userId);
            console.log("Załadowano profil odbiorcy:", profile);
            setActiveRecipient(profile);
            setNewConversationInitialized(false);
        } catch (error) {
            console.error('Error loading recipient profile:', error);

            if ((error as any).response?.status === 401) {
                setConnectionError("Token wygasł. Zaloguj się ponownie.");
                setTimeout(redirectToLogin, 3000);
            }
        }
    };

    const handleNewMessage = (message: ChatMessage) => {
        console.log("Otrzymano nową wiadomość:", message);

        setMessages(prevMessages => {
            const exists = prevMessages.some(m => m.id === message.id);
            if (exists) {
                return prevMessages.map(m => m.id === message.id ? message : m);
            } else {
                return [...prevMessages, message];
            }
        });

        if (message.recipientId === currentUser?.id && message.status === 'SENT') {
            chatService.markMessageAsDelivered(message.id);
        }

        if (message.recipientId === currentUser?.id && message.senderId === activeRecipientId) {
            chatService.markMessageAsRead(message.id);
        }

        updateConversationsFromMessages([message]);
    };

    const updateConversationsFromMessages = (newMessages: ChatMessage[]) => {
        if (!currentUser) return;

        setConversations(prevConversations => {
            const updatedConversations = [...prevConversations];

            newMessages.forEach(message => {
                const isCurrentUserSender = message.senderId === currentUser.id;
                const conversationUserId = isCurrentUserSender ? message.recipientId : message.senderId;
                const conversationUserName = isCurrentUserSender ? message.recipientName : message.senderName;

                let conversation = updatedConversations.find(c => c.userId === conversationUserId);

                if (!conversation) {
                    console.log("Tworzenie nowej konwersacji dla:", conversationUserId);
                    conversation = {
                        userId: conversationUserId,
                        userName: conversationUserName,
                        unreadCount: 0,
                    };
                    updatedConversations.push(conversation);
                }

                if (!conversation.lastMessageDate || new Date(message.createdAt) > new Date(conversation.lastMessageDate)) {
                    conversation.lastMessage = message.content;
                    conversation.lastMessageDate = message.createdAt;

                    if (!isCurrentUserSender && message.status !== 'READ') {
                        conversation.unreadCount = (conversation.unreadCount || 0) + 1;
                    }
                }
            });

            return updatedConversations.sort((a, b) => {
                if (!a.lastMessageDate) return 1;
                if (!b.lastMessageDate) return -1;
                return new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime();
            });
        });
    };

    const markMessagesAsRead = (messages: ChatMessage[]) => {
        if (!currentUser) return;

        messages.forEach(message => {
            if (message.recipientId === currentUser.id && message.status !== 'READ') {
                chatService.markMessageAsRead(message.id);
            }
        });
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();

        if (!messageText.trim() || !activeRecipientId || !activeRecipient) return;

        if (!isTokenValid()) {
            setConnectionError("Token wygasł. Zaloguj się ponownie.");
            setTimeout(redirectToLogin, 3000);
            return;
        }

        if (connectionStatus !== ConnectionStatus.CONNECTED) {
            alert('Nie można wysłać wiadomości - brak połączenia z serwerem czatu. Spróbuj odświeżyć stronę.');
            return;
        }

        try {
            console.log("Wysyłanie wiadomości do:", activeRecipientId);

            const tempId = `temp-${Date.now()}`;
            const newMessage: ChatMessage = {
                id: tempId,
                senderId: currentUser?.id || '',
                senderName: `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`,
                recipientId: activeRecipientId,
                recipientName: `${activeRecipient.firstName} ${activeRecipient.lastName}`,
                content: messageText,
                createdAt: new Date().toISOString(),
                status: 'SENT'
            };

            setMessages(prev => [...prev, newMessage]);
            updateConversationsFromMessages([newMessage]);

            chatService.sendMessage(activeRecipientId, messageText);
            setMessageText('');
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Nie udało się wysłać wiadomości. Sprawdź połączenie i spróbuj ponownie.');

            if (error instanceof Error && error.message.includes('Token')) {
                setConnectionError("Token wygasł. Zaloguj się ponownie.");
                setTimeout(redirectToLogin, 3000);
            }
        }
    };

    const handleSelectConversation = (userId: string) => {
        console.log("Wybrano konwersację:", userId);

        if (userId === activeRecipientId) {
            console.log("Ta konwersacja jest już aktywna");
            return;
        }

        setActiveRecipientId(userId);

        if (connectionStatus === ConnectionStatus.CONNECTED) {
            loadRecipientProfile(userId);
            loadMessages(userId);
        }

        navigate(`/chat/${userId}`);

        setIsSearching(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        if (!isTokenValid()) {
            setConnectionError("Token wygasł. Zaloguj się ponownie.");
            setTimeout(redirectToLogin, 3000);
            return;
        }

        try {
            setIsSearching(true);
            console.log("Wyszukiwanie użytkowników:", searchQuery);
            const results = await searchUsers(searchQuery);
            console.log("Znaleziono użytkowników:", results.length);
            const filteredResults = results.filter(user => user.id !== currentUser?.id);
            setSearchResults(filteredResults);
        } catch (error) {
            console.error('Error searching users:', error);

            if ((error as any).response?.status === 401) {
                setConnectionError("Token wygasł. Zaloguj się ponownie.");
                setTimeout(redirectToLogin, 3000);
            }
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    };

    const formatMessageDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    };

    const formatConversationDate = (dateString: string | undefined) => {
        if (!dateString) return '';

        const date = new Date(dateString);
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);

        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Wczoraj';
        } else {
            return date.toLocaleDateString();
        }
    };

    const handleReconnectButton = () => {
        if (!isTokenValid()) {
            redirectToLogin();
        } else {
            connectWebSocket();
        }
    };

    if (connectionError && connectionStatus === ConnectionStatus.DISCONNECTED) {
        const isTokenError = connectionError.includes('token') || connectionError.includes('Token');
        return (
            <div className="chat-error">
                <h3>{isTokenError ? 'Błąd uwierzytelniania' : 'Problem z połączeniem'}</h3>
                <p>{connectionError}</p>
                <button onClick={handleReconnectButton}>
                    {isTokenError ? 'Zaloguj się ponownie' : 'Połącz ponownie'}
                </button>
            </div>
        );
    }

    return (
        <div className="chat-page">
            <div className="chat-sidebar">
                <div className={`connection-status ${connectionStatus}`}>
                    <span className="icon">
                        {connectionStatus === ConnectionStatus.CONNECTED && '✓'}
                        {connectionStatus === ConnectionStatus.CONNECTING && '⟳'}
                        {connectionStatus === ConnectionStatus.DISCONNECTED && '✗'}
                    </span>
                    <span>
                        {connectionStatus === ConnectionStatus.CONNECTED && 'Połączono'}
                        {connectionStatus === ConnectionStatus.CONNECTING && 'Łączenie...'}
                        {connectionStatus === ConnectionStatus.DISCONNECTED && 'Rozłączono'}
                    </span>
                    {connectionStatus === ConnectionStatus.DISCONNECTED && (
                        <button
                            className="reconnect-button"
                            onClick={() => connectWebSocket()}
                        >
                            Połącz
                        </button>
                    )}
                </div>

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
                                <li key={user.id} onClick={() => user.id && handleSelectConversation(user.id)}>
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
                    <div className="conversations-list">
                        <h3>Konwersacje</h3>
                        {conversations.length > 0 ? (
                            <ul>
                                {conversations.map((conversation) => (
                                    <li
                                        key={conversation.userId}
                                        className={`conversation-item ${activeRecipientId === conversation.userId ? 'active' : ''}`}
                                        onClick={() => handleSelectConversation(conversation.userId)}
                                    >
                                        <div className="user-avatar">
                                            <img
                                                src={conversation.profilePicture || DEFAULT_AVATAR}
                                                alt={conversation.userName}
                                                onError={(e) => {
                                                    const target = e.currentTarget as HTMLImageElement;
                                                    target.src = DEFAULT_AVATAR;
                                                }}
                                            />
                                            {conversation.unreadCount > 0 && (
                                                <span className="unread-badge">{conversation.unreadCount}</span>
                                            )}
                                        </div>
                                        <div className="conversation-info">
                                            <div className="conversation-header">
                                                <span className="user-name">{conversation.userName}</span>
                                                <span className="last-message-time">
                                                    {formatConversationDate(conversation.lastMessageDate)}
                                                </span>
                                            </div>
                                            <p className="last-message">{conversation.lastMessage || "Rozpocznij konwersację"}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="no-conversations">Brak konwersacji. Wyszukaj użytkownika, aby rozpocząć
                                czat.</p>
                        )}
                    </div>
                )}
            </div>

            <div className="chat-main">
                {activeRecipientId && activeRecipient ? (
                    <>
                        <div className="chat-header">
                            <div className="recipient-info">
                                <div className="recipient-avatar">
                                    <img
                                        src={activeRecipient.profilePictureBase64 || DEFAULT_AVATAR}
                                        alt={`${activeRecipient.firstName} ${activeRecipient.lastName}`}
                                        onError={(e) => {
                                            const target = e.currentTarget as HTMLImageElement;
                                            target.src = DEFAULT_AVATAR;
                                        }}
                                    />
                                </div>
                                <div className="recipient-details">
                                    <h3>{activeRecipient.firstName} {activeRecipient.lastName}</h3>
                                </div>
                            </div>
                        </div>

                        <div className="chat-messages">
                            {messages.length > 0 ? (
                                messages.map((message) => {
                                    const isCurrentUser = currentUser?.id === message.senderId;
                                    return (
                                        <div
                                            key={message.id}
                                            className={`message ${isCurrentUser ? 'sent' : 'received'}`}
                                        >
                                            <div className="message-content">
                                                <p>{message.content}</p>
                                                <div className="message-meta">
                                                    <span
                                                        className="message-time">{formatMessageDate(message.createdAt)}</span>
                                                    {isCurrentUser && (
                                                        <span className="message-status">
                                                            {message.status === 'READ' ? (
                                                                <i className="fas fa-check-double"></i>
                                                            ) : message.status === 'DELIVERED' ? (
                                                                <i className="fas fa-check"></i>
                                                            ) : (
                                                                <i className="fas fa-clock"></i>
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="no-messages">
                                    <p>Rozpocznij konwersację
                                        z {activeRecipient.firstName} {activeRecipient.lastName}</p>
                                </div>
                            )}
                            <div ref={messagesEndRef}/>
                        </div>

                        <form className="message-form" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder="Napisz wiadomość..."
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                disabled={connectionStatus !== ConnectionStatus.CONNECTED}
                            />
                            <button
                                type="submit"
                                disabled={!messageText.trim() || connectionStatus !== ConnectionStatus.CONNECTED}
                            >
                                <i className="fas fa-paper-plane"></i>
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="no-conversation-selected">
                        <h3>Wybierz konwersację lub wyszukaj użytkownika, aby rozpocząć czat</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;