// components/MessageList.tsx
import React, {useEffect, useRef} from 'react';
import {ChatMessage} from '../../api/chatApi';
import {UserProfile} from '../../types/user/UserProfile';

interface MessageListProps {
    messages: ChatMessage[];
    currentUser: UserProfile | null;
}

const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
};

const MessageList: React.FC<MessageListProps> = ({messages, currentUser}) => {
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [messages]);

    return (
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
                    <p>Rozpocznij konwersację</p>
                </div>
            )}
            <div ref={messagesEndRef}/>
        </div>
    );
};

export default MessageList;