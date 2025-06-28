import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './ChatPage.scss';
import './ChatError.scss';
import { getUserProfile, searchUsers } from '../../api/useInternalApi';
import { UserProfile } from '../../types/user/UserProfile';
import SearchUsers from '../../components/Chat/SearchUsers.tsx';
import MessageList from '../../components/Chat/MessageList.tsx';
import MessageInput from '../../components/Chat/MessageInput.tsx';
import ConversationList from '../../components/Chat/ConversationList.tsx';
import { UserMiniDto } from '../../types/user/UserMiniDto.ts';
import { LocationState } from '../../types/chat/LocationState.ts';
import { ChatMessage } from '../../types/chat/ChatMessage.ts';
import { Conversation } from '../../types/chat/Conversation.ts';
import { chatService, isTokenValid } from '../../api/chatApi.ts';
import { DEFAULT_PROFILE_IMAGE } from '../../assets/defaultProfilePicture.ts';

const ChatPage: React.FC = () => {
  const { recipientId } = useParams<{ recipientId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeRecipientId, setActiveRecipientId] = useState<string | null>(recipientId || null);
  const [activeRecipient, setActiveRecipient] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<UserMiniDto[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState<boolean>(false);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const redirectToLogin = useCallback(() => {
    localStorage.removeItem('accessToken');
    navigate('/user/login', { state: { returnUrl: window.location.pathname } });
  }, [navigate]);

  const connectWebSocket = useCallback(async () => {
    if (!isTokenValid()) {
      setConnectionError('Authentication token missing. Log in again.');
      return;
    }

    try {
      setConnectionError(null);
      await chatService.connect();
      setIsWebSocketConnected(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to connect to chat server.';
      setConnectionError(errorMessage);
      setIsWebSocketConnected(false);

      if (errorMessage.includes('token')) {
        setTimeout(redirectToLogin, 3000);
      }
    }
  }, [redirectToLogin]);

  const loadConversations = useCallback(async () => {
    try {
      const allConversations = await chatService.getAllConversations();
      const sortedConversations = allConversations.sort((a, b) => {
        if (!a.lastMessageDate) return 1;
        if (!b.lastMessageDate) return -1;
        return new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime();
      });
      setConversations(sortedConversations);
      return sortedConversations;
    } catch (error) {
      if ((error as any).response?.status === 401) {
        redirectToLogin();
      }
      return [];
    }
  }, [redirectToLogin]);

  const loadMessages = useCallback(
    async (recipientId: string) => {
      setIsLoadingMessages(true);
      try {
        const chatHistory = await chatService.getChatHistory(recipientId);
        setMessages(chatHistory);
        return chatHistory;
      } catch (error) {
        if ((error as any).response?.status === 401) {
          redirectToLogin();
        } else {
          setMessages([]);
          setConnectionError('Failed to load messages history');
        }
        return [];
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [redirectToLogin]
  );

  const loadRecipientProfile = useCallback(
    async (userId: string) => {
      const conversation = conversations.find(conv => conv.userId === userId);
      if (conversation) {
        const profileFromConversation: UserProfile = {
          id: userId,
          firstName: conversation.userName.split(' ')[0] || 'User',
          lastName: conversation.userName.split(' ').slice(1).join(' ') || '',
          email: '',
          profilePictureBase64: conversation.profilePicture,
        };
        setActiveRecipient(profileFromConversation);
        return profileFromConversation;
      }

      try {
        const profile = await getUserProfile(userId);
        setActiveRecipient(profile);
        return profile;
      } catch (error) {
        console.error('Failed to load user profile:', error);
        const basicProfile: UserProfile = {
          id: userId,
          firstName: 'User',
          lastName: '',
          email: '',
          profilePictureBase64: undefined,
        };
        setActiveRecipient(basicProfile);
        return basicProfile;
      }
    },
    [conversations]
  );

  const toggleMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(prev => !prev);
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  useEffect(() => {
    if (!isTokenValid()) {
      setConnectionError('Authentication token missing. Log in again.');
      return;
    }

    const initializeChat = async () => {
      try {
        const profile = await getUserProfile();
        setCurrentUser(profile);

        await loadConversations();

        connectWebSocket().catch(() => {});

        if (state?.sellerInfo && state.sellerInfo.isNewConversation && recipientId) {
          const sellerInfo = state.sellerInfo;

          const newRecipient: UserProfile = {
            id: sellerInfo.id,
            firstName: sellerInfo.firstName,
            lastName: sellerInfo.lastName,
            email: sellerInfo.email,
            profilePictureBase64: sellerInfo.profilePicture,
          };
          setActiveRecipient(newRecipient);

          const newConversation: Conversation = {
            userId: sellerInfo.id,
            userName: `${sellerInfo.firstName} ${sellerInfo.lastName}`,
            profilePicture: sellerInfo.profilePicture,
          };

          setConversations(prev => {
            const exists = prev.some(conv => conv.userId === sellerInfo.id);
            if (!exists) {
              return [newConversation, ...prev];
            }
            return prev;
          });

          navigate(location.pathname, { replace: true });
        }

        setIsInitialized(true);
      } catch (error) {
        setConnectionError('An error occurred during chat initialization.');

        if ((error as any).response?.status === 401) {
          setTimeout(redirectToLogin, 3000);
        }
      }
    };

    initializeChat();

    return () => {
      chatService.disconnect();
    };
  }, [
    connectWebSocket,
    redirectToLogin,
    location,
    state,
    navigate,
    recipientId,
    loadConversations,
  ]);

  useEffect(() => {
    if (recipientId && isInitialized) {
      if (recipientId !== activeRecipientId) {
        setActiveRecipientId(recipientId);
        loadRecipientProfile(recipientId);
        loadMessages(recipientId);
      }
    }
  }, [recipientId, isInitialized, activeRecipientId, loadRecipientProfile, loadMessages]);

  useEffect(() => {
    if (activeRecipientId && conversations.length > 0) {
      const conversation = conversations.find(conv => conv.userId === activeRecipientId);
      if (conversation) {
        setActiveRecipient(prev => {
          if (!prev || prev.id !== activeRecipientId || !prev.profilePictureBase64) {
            return {
              id: activeRecipientId,
              firstName: conversation.userName.split(' ')[0] || 'User',
              lastName: conversation.userName.split(' ').slice(1).join(' ') || '',
              email: '',
              profilePictureBase64: conversation.profilePicture,
            };
          }
          return prev;
        });
      }
    }
  }, [conversations, activeRecipientId]);

  useEffect(() => {
    if (isWebSocketConnected) {
      const unsubscribe = chatService.onMessageReceived(handleNewMessage);
      return () => unsubscribe();
    }
  }, [isWebSocketConnected, currentUser, activeRecipientId]);

  const handleNewMessage = (message: ChatMessage) => {
    setMessages(prevMessages => {
      const exists = prevMessages.some(m => m.id === message.id);
      if (exists) {
        return prevMessages.map(m => (m.id === message.id ? message : m));
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
        const conversationUserName = isCurrentUserSender
          ? message.recipientName
          : message.senderName;

        let conversation = updatedConversations.find(c => c.userId === conversationUserId);

        if (!conversation) {
          conversation = {
            userId: conversationUserId,
            userName: conversationUserName,
          };
          updatedConversations.push(conversation);
        }

        if (
          !conversation.lastMessageDate ||
          new Date(message.createdAt) > new Date(conversation.lastMessageDate)
        ) {
          conversation.lastMessage = message.content;
          conversation.lastMessageDate = message.createdAt;
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

    if (!isWebSocketConnected) {
      alert('No connection to the server. Check your Internet connection and try again.');
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const newMessage: ChatMessage = {
      id: tempId,
      senderId: currentUser.id,
      senderName: `${currentUser.firstName} ${currentUser.lastName}`,
      recipientId: activeRecipientId,
      recipientName: `${activeRecipient.firstName} ${activeRecipient.lastName}`,
      content: content,
      createdAt: new Date().toISOString(),
      status: 'SENT',
    };

    setMessages(prev => [...prev, newMessage]);
    updateConversationsFromMessages([newMessage]);

    await chatService.sendMessage(activeRecipientId, content);

    setTimeout(() => {
      loadConversations();
    }, 1000);
  };

  const handleSelectConversation = (userId: string) => {
    setIsSearching(false);
    setSearchQuery('');
    setSearchResults([]);

    setActiveRecipientId(userId);
    navigate(`/chat/${userId}`, { replace: true });

    loadRecipientProfile(userId);
    loadMessages(userId);

    setTimeout(() => {
      closeMobileSidebar();
    }, 300);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const results = await searchUsers(searchQuery);
    if (currentUser) {
      const filteredResults = results.filter(user => user.id !== currentUser.id);
      setSearchResults(filteredResults);
    } else {
      setSearchResults(results);
    }
  };

  if (connectionError && !isInitialized) {
    const isTokenError = connectionError.includes('token');
    return (
      <div className="chat-error">
        <h3>{isTokenError ? 'Authentication error' : 'Connection problem'}</h3>
        <p>{connectionError}</p>
        <button onClick={isTokenError ? redirectToLogin : connectWebSocket}>
          {isTokenError ? 'Login again' : 'Try again'}
        </button>
      </div>
    );
  }

  return (
    <>
      {isMobileSidebarOpen && (
        <div className="mobile-sidebar-overlay" onClick={closeMobileSidebar}></div>
      )}

      <div className="chat-page">
        <div className={`chat-sidebar ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
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
            activeUserId={activeRecipientId || undefined}
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
              <div className="chat-header">
                <button
                  className={`mobile-hamburger ${isMobileSidebarOpen ? 'active' : ''}`}
                  onClick={toggleMobileSidebar}
                  aria-label="Toggle chat list"
                >
                  <div className="hamburger-line"></div>
                  <div className="hamburger-line"></div>
                  <div className="hamburger-line"></div>
                </button>

                <div className="recipient-info">
                  <div className="recipient-avatar">
                    <img
                      src={activeRecipient.profilePictureBase64 || DEFAULT_PROFILE_IMAGE}
                      alt={`${activeRecipient.firstName} ${activeRecipient.lastName}`}
                      onError={e => {
                        (e.target as HTMLImageElement).src = DEFAULT_PROFILE_IMAGE;
                      }}
                    />
                  </div>
                  <div className="recipient-details">
                    <h3>{`${activeRecipient.firstName} ${activeRecipient.lastName}`}</h3>
                  </div>
                </div>
              </div>

              {isLoadingMessages ? (
                <div className="loading-messages">
                  <div className="loading-spinner"></div>
                  <p>Ładowanie wiadomości...</p>
                </div>
              ) : (
                <MessageList messages={messages} currentUser={currentUser} />
              )}
              <MessageInput onSendMessage={handleSendMessage} isConnected={isWebSocketConnected} />
            </>
          ) : (
            <div className="no-conversation-selected">
              <button
                className={`mobile-hamburger welcome-hamburger ${isMobileSidebarOpen ? 'active' : ''}`}
                onClick={toggleMobileSidebar}
                aria-label="Toggle chat list"
              >
                <div className="hamburger-line"></div>
                <div className="hamburger-line"></div>
                <div className="hamburger-line"></div>
              </button>

              <div className="welcome-content">
                <h3>Witaj w czacie!</h3>
                <p>Wybierz konwersację z listy lub wyszukaj użytkownika, aby rozpocząć rozmowę</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatPage;