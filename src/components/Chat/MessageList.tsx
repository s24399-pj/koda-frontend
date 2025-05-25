import React, {useRef} from 'react';
import {MessageListProps} from "../../types/chat/MessageListProps.ts";

const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pl-PL', {hour: '2-digit', minute: '2-digit'});
};

const MessageList: React.FC<MessageListProps> = ({messages, currentUser}) => {
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    if (messages.length === 0) {
        return (
            <div className="chat-messages">
                <div className="no-messages">
                    <div className="no-messages-content">
                        <div className="no-messages-icon">💬</div>
                        <h4>Brak wiadomości</h4>
                        <p>Rozpocznij konwersację wysyłając pierwszą wiadomość</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-messages">
            {messages.map((message) => {
                const isCurrentUser = currentUser?.id === message.senderId;
                return (
                    <div
                        key={message.id}
                        className={`message ${isCurrentUser ? 'sent' : 'received'}`}
                    >
                        <div className="message-content">
                            <p>{message.content}</p>
                        </div>
                        <div className="message-meta">
                            <span className="message-time">
                                {formatMessageDate(message.createdAt)}
                            </span>
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef}/>
        </div>
    );
};

export default MessageList;