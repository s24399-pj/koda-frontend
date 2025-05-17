import React, { useEffect, useState } from 'react';
import './ChatUserList.scss';
import { getUserProfile } from '../../api/useInternalApi';
import { UserProfile } from '../../types/user/UserProfile';
import {ChatMessage, chatService} from "../../api/chatApi.ts";

// Default avatar
const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyMCIgZmlsbD0iI2U5ZWNlZiIvPjxjaXJjbGUgY3g9IjEyOCIgY3k9IjExMCIgcj0iMzUiIGZpbGw9IiM2Yzc1N2QiLz48cGF0aCBkPSJNMTk4LDE4OGMwLTI1LjQtMzEuNC00Ni03MC00NnMtNzAsMjAuNi03MCw0NnMzMS40LDQ2LDcwLDQ2UzE5OCwyMTMuNCwxOTgsMTg4WiIgZmlsbD0iIzZjNzU3ZCIvPjwvc3ZnPg==";

// Interfejs dla kontaktów czatu
interface ChatContact {
    userId: string;
    userName: string;
    profilePicture?: string;
    lastMessage?: string;
    lastMessageDate?: string;
    unreadCount: number;
}

interface ChatUserListProps {
    onSelectUser: (userId: string) => void;
    activeUserId?: string;
}

const ChatUserList: React.FC<ChatUserListProps> = ({ onSelectUser, activeUserId }) => {
    const [contacts, setContacts] = useState<ChatContact[]>([]);
    const [unreadMessages, setUnreadMessages] = useState<ChatMessage[]>([]);
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const token = localStorage.getItem('token') || '';

    useEffect(() => {
        const initialize = async () => {
            try {
                setIsLoading(true);

                // Pobierz profil użytkownika
                const profile = await getUserProfile();
                setCurrentUser(profile);

                // Połącz z WebSocket jeśli jeszcze nie połączono
                if (!chatService.client) {
                    await chatService.connect(token);
                }

                // Pobierz nieprzeczytane wiadomości
                const unread = await chatService.getUnreadMessages();
                setUnreadMessages(unread);

                // Ustaw handler dla nowych wiadomości
                const unsubscribe = chatService.onMessageReceived(handleNewMessage);

                // Zaktualizuj listę kontaktów
                updateContactsFromMessages(unread);

                setIsLoading(false);

                return () => {
                    unsubscribe();
                };
            } catch (error) {
                console.error('Error initializing chat user list:', error);
                setIsLoading(false);
            }
        };

        initialize();
    }, [token]);

    // Obsługa nowych wiadomości
    const handleNewMessage = (message: ChatMessage) => {
        // Dodaj wiadomość do nieprzeczytanych jeśli to wiadomość przychodzaca
        if (message.recipientId === currentUser?.id) {
            setUnreadMessages(prev => {
                const exists = prev.some(m => m.id === message.id);
                if (!exists) {
                    return [...prev, message];
                }
                return prev;
            });

            // Jeśli wiadomość nie jest jeszcze oznaczona jako dostarczona, oznacz ją
            if (message.status === 'SENT') {
                chatService.markMessageAsDelivered(message.id);
            }

            // Jeśli wiadomość jest od aktualnie wybranego użytkownika, oznacz ją jako przeczytaną
            if (message.senderId === activeUserId) {
                chatService.markMessageAsRead(message.id);
            }
        }

        // Zaktualizuj listę kontaktów
        updateContactsFromMessages([message]);
    };

    // Aktualizuj listę kontaktów na podstawie wiadomości
    const updateContactsFromMessages = (messages: ChatMessage[]) => {
        if (!currentUser) return;

        setContacts(prevContacts => {
            const updatedContacts = [...prevContacts];

            messages.forEach(message => {
                const isCurrentUserSender = message.senderId === currentUser.id;
                const contactUserId = isCurrentUserSender ? message.recipientId : message.senderId;
                const contactUserName = isCurrentUserSender ? message.recipientName : message.senderName;

                // Znajdź istniejący kontakt lub utwórz nowy
                let contact = updatedContacts.find(c => c.userId === contactUserId);

                if (!contact) {
                    contact = {
                        userId: contactUserId,
                        userName: contactUserName,
                        unreadCount: 0,
                    };
                    updatedContacts.push(contact);
                }

                // Aktualizuj informacje o ostatniej wiadomości
                if (!contact.lastMessageDate || new Date(message.createdAt) > new Date(contact.lastMessageDate)) {
                    contact.lastMessage = message.content;
                    contact.lastMessageDate = message.createdAt;

                    // Aktualizuj liczbę nieprzeczytanych wiadomości
                    if (!isCurrentUserSender && message.status !== 'READ') {
                        contact.unreadCount = (contact.unreadCount || 0) + 1;
                    }
                }
            });

            // Sortuj kontakty według daty ostatniej wiadomości (najnowsze na górze)
            return updatedContacts.sort((a, b) => {
                if (!a.lastMessageDate) return 1;
                if (!b.lastMessageDate) return -1;
                return new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime();
            });
        });
    };

    // Formatuj datę ostatniej wiadomości
    const formatLastMessageDate = (dateString: string | undefined) => {
        if (!dateString) return '';

        const date = new Date(dateString);
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);

        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Wczoraj';
        } else {
            return date.toLocaleDateString();
        }
    };

    // Obsługa kliknięcia na kontakt
    const handleContactClick = (userId: string) => {
        onSelectUser(userId);

        // Oznacz wiadomości od tego użytkownika jako przeczytane
        unreadMessages.forEach(message => {
            if (message.senderId === userId && message.status !== 'READ') {
                chatService.markMessageAsRead(message.id);
            }
        });

        // Zaktualizuj liczbę nieprzeczytanych wiadomości
        setContacts(prev =>
            prev.map(contact =>
                contact.userId === userId
                    ? { ...contact, unreadCount: 0 }
                    : contact
            )
        );
    };

    if (isLoading) {
        return <div className="chat-users-loading">Ładowanie kontaktów...</div>;
    }

    return (
        <div className="chat-users-list">
            <h3>Konwersacje</h3>
            {contacts.length > 0 ? (
                <ul>
                    {contacts.map(contact => (
                        <li
                            key={contact.userId}
                            className={`contact-item ${activeUserId === contact.userId ? 'active' : ''}`}
                            onClick={() => handleContactClick(contact.userId)}
                        >
                            <div className="contact-avatar">
                                <img
                                    src={contact.profilePicture || DEFAULT_AVATAR}
                                    alt={contact.userName}
                                    onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                                />
                                {contact.unreadCount > 0 && (
                                    <span className="unread-badge">{contact.unreadCount}</span>
                                )}
                            </div>
                            <div className="contact-info">
                                <div className="contact-header">
                                    <span className="contact-name">{contact.userName}</span>
                                    <span className="last-message-time">
                    {formatLastMessageDate(contact.lastMessageDate)}
                  </span>
                                </div>
                                {contact.lastMessage && (
                                    <p className="last-message">{contact.lastMessage}</p>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="no-contacts">
                    Brak aktywnych konwersacji. Rozpocznij nową konwersację, wyszukując użytkownika.
                </p>
            )}
        </div>
    );
};

export default ChatUserList;