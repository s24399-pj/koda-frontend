import React, { useEffect, useState, useRef } from 'react';
import './ChatConversation.scss';
import { getUserProfile } from '../../api/useInternalApi';
import { UserProfile } from '../../types/user/UserProfile';
import {ChatMessage, chatService} from "../../api/chatApi.ts";

// Default avatar
const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyMCIgZmlsbD0iI2U5ZWNlZiIvPjxjaXJjbGUgY3g9IjEyOCIgY3k9IjExMCIgcj0iMzUiIGZpbGw9IiM2Yzc1N2QiLz48cGF0aCBkPSJNMTk4LDE4OGMwLTI1LjQtMzEuNC00Ni03MC00NnMtNzAsMjAuNi03MCw0NnMzMS40LDQ2LDcwLDQ2UzE5OCwyMTMuNCwxOTgsMTg4WiIgZmlsbD0iIzZjNzU3ZCIvPjwvc3ZnPg==";

interface ChatConversationProps {
    recipientId: string;
}

const ChatConversation: React.FC<ChatConversationProps> = ({ recipientId }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [recipient, setRecipient] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [messageText, setMessageText] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initialize = async () => {
            try {
                setIsLoading(true);

                // Pobierz profil użytkownika i odbiorcy
                const userProfile = await getUserProfile();
                setCurrentUser(userProfile);

                const recipientProfile = await getUserProfile(recipientId);
                setRecipient(recipientProfile);

                // Pobierz historię czatu
                await loadChatHistory();

                // Ustaw handler dla nowych wiadomości
                const unsubscribe = chatService.onMessageReceived(handleNewMessage);

                setIsLoading(false);

                return () => {
                    unsubscribe();
                };
            } catch (error) {
                console.error('Error initializing chat conversation:', error);
                setIsLoading(false);
            }
        };

        initialize();
    }, [recipientId]);

    // Efekt do automatycznego przewijania do ostatniej wiadomości
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Pobierz historię czatu z wybranym użytkownikiem
    const loadChatHistory = async () => {
        try {
            const chatHistory = await chatService.getChatHistory(recipientId);
            setMessages(chatHistory);

            // Oznacz wiadomości jako przeczytane
            chatHistory.forEach(message => {
                if (message.recipientId === currentUser?.id && message.status !== 'READ') {
                    chatService.markMessageAsRead(message.id);
                }
            });
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    };

    // Obsługa nowej wiadomości
    const handleNewMessage = (message: ChatMessage) => {
        // Sprawdź, czy wiadomość należy do tej konwersacji
        if ((message.senderId === recipientId && message.recipientId === currentUser?.id) ||
            (message.senderId === currentUser?.id && message.recipientId === recipientId)) {

            // Dodaj nową wiadomość do listy
            setMessages(prevMessages => {
                // Sprawdź czy wiadomość już istnieje w liście
                const exists = prevMessages.some(m => m.id === message.id);
                if (exists) {
                    return prevMessages.map(m => m.id === message.id ? message : m);
                } else {
                    return [...prevMessages, message];
                }
            });

            // Jeśli wiadomość jest do nas, oznacz ją jako przeczytaną
            if (message.recipientId === currentUser?.id && message.status !== 'READ') {
                chatService.markMessageAsRead(message.id);
            }
        }
    };

    // Obsługa wysyłania wiadomości
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();

        if (!messageText.trim() || !recipientId) return;

        try {
            chatService.sendMessage(recipientId, messageText);
            setMessageText('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    // Automatyczne przewijanie do ostatniej wiadomości
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Format daty wiadomości
    const formatMessageDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (isLoading) {
        return <div className="chat-conversation-loading">Ładowanie konwersacji...</div>;
    }

    return (
        <div className="chat-conversation">
            <div className="chat-header">
                <div className="recipient-info">
                    <div className="recipient-avatar">
                        <img
                            src={recipient?.profilePictureBase64 || DEFAULT_AVATAR}
                            alt={recipient ? `${recipient.firstName} ${recipient.lastName}` : 'Użytkownik'}
                            onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                        />
                    </div>
                    <div className="recipient-details">
                        <h3>{recipient ? `${recipient.firstName} ${recipient.lastName}` : 'Użytkownik'}</h3>
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
                                        <span className="message-time">{formatMessageDate(message.createdAt)}</span>
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
                        <p>Rozpocznij konwersację z {recipient?.firstName} {recipient?.lastName}</p>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form className="message-form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    placeholder="Napisz wiadomość..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                />
                <button type="submit" disabled={!messageText.trim()}>
                    <i className="fas fa-paper-plane"></i>
                </button>
            </form>
        </div>
    );
};

export default ChatConversation;