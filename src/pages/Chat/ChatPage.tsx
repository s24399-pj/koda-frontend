import React, {useCallback, useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import './ChatPage.scss';
import './ChatError.scss';
import {getUserProfile, searchUsers} from '../../api/useInternalApi';
import {UserProfile} from '../../types/user/UserProfile';
import {ChatMessage, chatService, Conversation, isTokenValid} from "../../api/chatApi";
import {ConnectionStatus, ConnectionStatusComponent} from "../../components/Chat/ConnectionStatus.tsx";
import SearchUsers from "../../components/Chat/SearchUsers.tsx";
import ChatHeader from "../../components/Chat/ChatHeader.tsx";
import MessageList from "../../components/Chat/MessageList.tsx";
import MessageInput from "../../components/Chat/MessageInput.tsx";
import ConversationList from "../../components/Chat/ConversationList.tsx";

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
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);

    const redirectToLogin = useCallback(() => {
        localStorage.removeItem("accessToken");
        navigate('/user/login', {state: {returnUrl: window.location.pathname}});
    }, [navigate]);

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
        } catch (error) {
            console.error('Błąd podczas łączenia z WebSocket:', error);
            const errorMessage = error instanceof Error ? error.message : "Nie udało się połączyć z serwerem czatu.";
            setConnectionError(errorMessage);
            setConnectionStatus(ConnectionStatus.DISCONNECTED);

            if (errorMessage.includes('token')) {
                setTimeout(redirectToLogin, 3000);
            }
        }
    }, [redirectToLogin]);

    // Ładowanie konwersacji niezależnie od WebSocket
    const loadConversations = useCallback(async () => {
        console.log("Rozpoczęto ładowanie konwersacji");
        try {
            const allConversations = await chatService.getAllConversations();
            console.log("Pobrano konwersacje z API:", allConversations);
            setConversations(allConversations);
            return allConversations;
        } catch (error) {
            console.error("Błąd podczas ładowania konwersacji:", error);
            if ((error as any).response?.status === 401) {
                redirectToLogin();
            }
            return [];
        }
    }, [redirectToLogin]);

    // KLUCZOWA ZMIANA: Ładowanie wiadomości niezależnie od WebSocket
    const loadMessages = useCallback(async (recipientId: string) => {
        console.log(`Ładowanie wiadomości dla odbiorcy ${recipientId}`);
        setIsLoadingMessages(true);

        try {
            const chatHistory = await chatService.getChatHistory(recipientId);
            console.log(`Pobrano ${chatHistory.length} wiadomości dla ${recipientId}:`, chatHistory);
            setMessages(chatHistory);
            return chatHistory;
        } catch (error) {
            console.error('Error loading chat history:', error);
            if ((error as any).response?.status === 401) {
                redirectToLogin();
            } else {
                setMessages([]);
                // Pokaż błąd użytkownikowi
                setConnectionError("Nie udało się załadować historii wiadomości.");
            }
            return [];
        } finally {
            setIsLoadingMessages(false);
        }
    }, [redirectToLogin]);

    const loadRecipientProfile = useCallback(async (userId: string) => {
        try {
            console.log(`Ładowanie profilu dla ${userId}`);
            const profile = await getUserProfile(userId);
            console.log(`Pobrano profil dla ${userId}:`, profile);
            setActiveRecipient(profile);
            return profile;
        } catch (error) {
            console.error('Error loading recipient profile:', error);
            if ((error as any).response?.status === 401) {
                redirectToLogin();
            }
            return null;
        }
    }, [redirectToLogin]);

    // Główny effect inicjalizujący
    useEffect(() => {
        if (!isTokenValid()) {
            setConnectionError("Brak tokenu uwierzytelniającego. Zaloguj się ponownie.");
            setConnectionStatus(ConnectionStatus.DISCONNECTED);
            return;
        }

        const initializeChat = async () => {
            try {
                // Załaduj profil użytkownika
                const profile = await getUserProfile();
                setCurrentUser(profile);

                // Załaduj konwersacje niezależnie od WebSocket
                await loadConversations();

                // Połącz z WebSocket (może się nie udać, ale nie blokuje reszty)
                connectWebSocket().catch(error => {
                    console.warn('WebSocket connection failed, but chat history will still work:', error);
                });

                // Obsługa nowej konwersacji ze strony oferty
                if (state?.sellerInfo && state.sellerInfo.isNewConversation && recipientId) {
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

                    navigate(location.pathname, {replace: true});
                }

                setIsInitialized(true);
            } catch (error) {
                console.error('Error initializing chat:', error);
                setConnectionError("Wystąpił błąd podczas inicjalizacji czatu.");

                if ((error as any).response?.status === 401) {
                    setTimeout(redirectToLogin, 3000);
                }
            }
        };

        initializeChat();

        return () => {
            chatService.disconnect();
        };
    }, [connectWebSocket, redirectToLogin, location, state, navigate, recipientId, loadConversations]);

    // Effect dla zmiany recipientId - teraz działa niezależnie od WebSocket
    useEffect(() => {
        if (recipientId && isInitialized) {
            console.log("Ładowanie profilu i wiadomości dla recipientId:", recipientId);
            setActiveRecipientId(recipientId);
            loadRecipientProfile(recipientId);
            loadMessages(recipientId);
        }
    }, [recipientId, isInitialized, loadRecipientProfile, loadMessages]);

    // Effect do nasłuchiwania nowych wiadomości - tylko dla WebSocket
    useEffect(() => {
        if (connectionStatus === ConnectionStatus.CONNECTED) {
            const unsubscribe = chatService.onMessageReceived(handleNewMessage);
            return () => unsubscribe();
        }
    }, [connectionStatus, currentUser, activeRecipientId]);

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

    const handleSendMessage = async (content: string) => {
        if (!activeRecipientId || !activeRecipient || !currentUser || !currentUser.id) return;

        // Sprawdź czy WebSocket jest połączony
        if (connectionStatus !== ConnectionStatus.CONNECTED) {
            alert('Brak połączenia z serwerem. Sprawdź połączenie internetowe i spróbuj ponownie.');
            return;
        }

        try {
            console.log(`Wysyłanie wiadomości do ${activeRecipientId}: ${content}`);

            const tempId = `temp-${Date.now()}`;
            const newMessage: ChatMessage = {
                id: tempId,
                senderId: currentUser.id,
                senderName: `${currentUser.firstName} ${currentUser.lastName}`,
                recipientId: activeRecipientId,
                recipientName: `${activeRecipient.firstName} ${activeRecipient.lastName}`,
                content: content,
                createdAt: new Date().toISOString(),
                status: 'SENT'
            };

            setMessages(prev => [...prev, newMessage]);
            updateConversationsFromMessages([newMessage]);

            await chatService.sendMessage(activeRecipientId, content);

            // Po wysłaniu wiadomości odśwież listę konwersacji
            setTimeout(() => {
                loadConversations();
            }, 1000);
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Nie udało się wysłać wiadomości. Sprawdź połączenie i spróbuj ponownie.');
        }
    };

    const handleSelectConversation = (userId: string) => {
        if (userId === activeRecipientId) return;

        console.log(`Wybrano konwersację z ${userId}`);
        setActiveRecipientId(userId);
        navigate(`/chat/${userId}`);

        // Załaduj profil i wiadomości natychmiast
        loadRecipientProfile(userId);
        loadMessages(userId);

        setIsSearching(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            setIsSearching(true);
            const results = await searchUsers(searchQuery);
            if (currentUser) {
                const filteredResults = results.filter(user => user.id !== currentUser.id);
                setSearchResults(filteredResults);
            } else {
                setSearchResults(results);
            }
        } catch (error) {
            console.error('Error searching users:', error);
        }
    };

    if (connectionError && connectionStatus === ConnectionStatus.DISCONNECTED && !isInitialized) {
        const isTokenError = connectionError.includes('token');
        return (
            <div className="chat-error">
                <h3>{isTokenError ? 'Błąd uwierzytelniania' : 'Problem z połączeniem'}</h3>
                <p>{connectionError}</p>
                <button onClick={isTokenError ? redirectToLogin : connectWebSocket}>
                    {isTokenError ? 'Zaloguj się ponownie' : 'Połącz ponownie'}
                </button>
            </div>
        );
    }

    return (
        <div className="chat-page">
            <div className="chat-sidebar">
                <ConnectionStatusComponent
                    status={connectionStatus}
                    onReconnect={connectWebSocket}
                />

                <SearchUsers
                    searchQuery={searchQuery}
                    onSearchQueryChange={setSearchQuery}
                    onSearch={handleSearch}
                    searchResults={searchResults}
                    onSelectUser={handleSelectConversation}
                    onCancel={() => {
                        setIsSearching(false);
                        setSearchQuery('');
                        setSearchResults([]);
                    }}
                    isSearching={isSearching}
                />

                {!isSearching && (
                    <ConversationList
                        conversations={conversations}
                        activeRecipientId={activeRecipientId}
                        onSelectConversation={handleSelectConversation}
                    />
                )}
            </div>

            <div className="chat-main">
                {activeRecipientId && activeRecipient ? (
                    <>
                        <ChatHeader recipient={activeRecipient}/>
                        {isLoadingMessages ? (
                            <div className="loading-messages">
                                <p>Ładowanie wiadomości...</p>
                            </div>
                        ) : (
                            <MessageList messages={messages} currentUser={currentUser}/>
                        )}
                        <MessageInput
                            onSendMessage={handleSendMessage}
                            connectionStatus={connectionStatus}
                        />
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