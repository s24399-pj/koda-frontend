import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import './ChatIconIndicator.scss';
import {chatService} from '../../api/chatApi';

const ChatIconIndicator: React.FC = () => {
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const token = localStorage.getItem('token') || '';

    useEffect(() => {
        // Inicjalizuj połączenie WebSocket jeśli jeszcze nie nawiązano
        const initializeChat = async () => {
            try {
                if (!chatService.client) {
                    await chatService.connect(token);
                }

                // Pobierz nieprzeczytane wiadomości
                const unreadMessages = await chatService.getUnreadMessages();
                setUnreadCount(unreadMessages.length);

                // Ustaw handler dla nowych wiadomości
                const unsubscribe = chatService.onMessageReceived(handleNewMessage);

                return () => {
                    unsubscribe();
                };
            } catch (error) {
                console.error('Error initializing chat indicator:', error);
            }
        };

        initializeChat();
    }, [token]);

    // Obsługa nowej wiadomości
    const handleNewMessage = (message: any) => {
        // Sprawdź czy wiadomość jest do nas i nie została jeszcze przeczytana
        if (message.recipientId === localStorage.getItem('userId') && message.status !== 'READ') {
            setUnreadCount(prev => prev + 1);

            // Oznacz wiadomość jako dostarczoną
            chatService.markMessageAsDelivered(message.id);
        }

        // Jeśli wiadomość została oznaczona jako przeczytana, zmniejsz licznik
        if (message.status === 'READ') {
            setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
        }
    };

    return (
        <Link to="/chat" className="chat-icon-indicator">
            <i className="fas fa-comments"></i>
            {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </Link>
    );
};

export default ChatIconIndicator;