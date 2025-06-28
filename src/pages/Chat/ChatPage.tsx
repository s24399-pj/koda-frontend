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

/**
 * Main chat page component that provides real-time messaging functionality.
 * Manages WebSocket connections, conversations, messages, and user search.
 * Supports both desktop and mobile layouts with responsive sidebar.
 *
 * Features:
 * - Real-time messaging via WebSocket
 * - Conversation management and history
 * - User search and profile loading
 * - Mobile-responsive design
 * - Authentication handling and token validation
 *
 * @returns {JSX.Element} The rendered ChatPage component
 */
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

  /**
   * Redirects user to login page and clears authentication token.
   * Preserves current location to return after successful login.
   */
  const redirectToLogin = useCallback(() => {
    localStorage.removeItem('accessToken');
    navigate('/user/login', { state: { returnUrl: window.location.pathname } });
  }, [navigate]);

  /**
   * Establishes WebSocket connection for real-time messaging.
   * Handles authentication validation and connection errors.
   * Automatically redirects to login if token is invalid.
   */
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

  /**
   * Loads and sorts all user conversations from the API.
   * Sorts conversations by last message date in descending order.
   * Handles authentication errors by redirecting to login.
   *
   * @returns {Promise<Conversation[]>} Array of sorted conversations or empty array on error
   */
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

  /**
   * Loads chat message history for a specific recipient.
   * Sets loading state during API call and handles authentication errors.
   *
   * @param {string} recipientId - The ID of the message recipient
   * @returns {Promise<ChatMessage[]>} Array of chat messages or empty array on error
   */
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

  /**
   * Loads user profile for a recipient, with fallback to conversation data.
   * First attempts to use cached conversation data, then falls back to API call.
   * Creates basic profile object if all methods fail.
   *
   * @param {string} userId - The ID of the user whose profile to load
   * @returns {Promise<UserProfile>} The loaded user profile
   */
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

  /**
   * Toggles the mobile sidebar open/closed state.
   */
  const toggleMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(prev => !prev);
  }, []);

  /**
   * Closes the mobile sidebar.
   */
  const closeMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  /**
   * Effect hook to initialize chat functionality on component mount.
   * Validates authentication, loads user profile, connects WebSocket,
   * and handles new conversation creation from navigation state.
   */
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

  /**
   * Effect hook to handle recipient changes from URL parameters.
   * Loads recipient profile and messages when recipientId changes.
   */
  useEffect(() => {
    if (recipientId && isInitialized) {
      if (recipientId !== activeRecipientId) {
        setActiveRecipientId(recipientId);
        loadRecipientProfile(recipientId);
        loadMessages(recipientId);
      }
    }
  }, [recipientId, isInitialized, activeRecipientId, loadRecipientProfile, loadMessages]);

  /**
   * Effect hook to update active recipient from conversation data.
   * Updates recipient profile when conversations are loaded or active recipient changes.
   */
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

  /**
   * Effect hook to set up WebSocket message listener.
   * Subscribes to incoming messages when WebSocket is connected.
   */
  useEffect(() => {
    if (isWebSocketConnected) {
      const unsubscribe = chatService.onMessageReceived(handleNewMessage);
      return () => unsubscribe();
    }
  }, [isWebSocketConnected, currentUser, activeRecipientId]);

  /**
   * Handles incoming WebSocket messages.
   * Updates or adds new messages to the message list and updates conversations.
   *
   * @param {ChatMessage} message - The received chat message
   */
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

  /**
   * Updates conversation list based on new messages.
   * Creates new conversations for unknown users and updates last message data.
   * Sorts conversations by most recent message date.
   *
   * @param {ChatMessage[]} newMessages - Array of new messages to process
   */
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

  /**
   * Handles sending a new message via WebSocket.
   * Validates connection state, creates temporary message, and sends via chat service.
   * Updates conversations and refreshes conversation list after sending.
   *
   * @param {string} content - The message content to send
   */
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

  /**
   * Handles conversation selection from the conversation list.
   * Clears search state, updates active recipient, navigates to conversation,
   * loads recipient profile and messages, and closes mobile sidebar.
   *
   * @param {string} userId - The ID of the user to start conversation with
   */
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

  /**
   * Handles user search functionality.
   * Clears results if query is empty, otherwise searches users via API.
   * Filters out current user from search results.
   */
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
