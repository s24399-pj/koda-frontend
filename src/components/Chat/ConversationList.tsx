import React from 'react';
import {Conversation} from '../../api/chatApi';

const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyMCIgZmlsbD0iI2U5ZWNlZiIvPjxjaXJjbGUgY3g9IjEyOCIgY3k9IjExMCIgcj0iMzUiIGZpbGw9IiM2Yzc1N2QiLz48cGF0aCBkPSJNMTk4LDE4OGMwLTI1LjQtMzEuNC00Ni03MC00NnMtNzAsMjAuNi03MCw0NnMzMS40LDQ2LDcwLDQ2UzE5OCwyMTMuNCwxOTgsMTg4WiIgZmlsbD0iIzZjNzU3ZCIvPjwvc3ZnPg==";

interface ConversationListProps {
    conversations: Conversation[];
    activeRecipientId: string | null;
    onSelectConversation: (userId: string) => void;
}

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

const ConversationList: React.FC<ConversationListProps> = ({
                                                               conversations,
                                                               activeRecipientId,
                                                               onSelectConversation
                                                           }) => {
    return (
        <div className="conversations-list">
            <h3>Konwersacje</h3>
            {conversations.length > 0 ? (
                <ul>
                    {conversations.map((conversation) => (
                        <li
                            key={conversation.userId}
                            className={`conversation-item ${activeRecipientId === conversation.userId ? 'active' : ''}`}
                            onClick={() => onSelectConversation(conversation.userId)}
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
                <p className="no-conversations">Brak konwersacji. Wyszukaj użytkownika, aby rozpocząć czat.</p>
            )}
        </div>
    );
};

export default ConversationList;