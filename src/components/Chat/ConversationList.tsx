/**
 * Component for displaying a list of conversations in a chat interface
 * @module components/chat/ConversationList
 */

import React, { useMemo } from 'react';
import { DEFAULT_PROFILE_IMAGE } from '../../assets/defaultProfilePicture.ts';
import { ConversationListProps } from '../../types/chat/ConversationListProps.ts';

/**
 * Formats a date string for display in conversation list
 * @function formatConversationDate
 * @param {string|undefined} dateString - ISO date string to format
 * @returns {string} Formatted date string: time for today, "Yesterday" for yesterday,
 *                   day and month for this year, or full date for previous years
 */
const formatConversationDate = (dateString: string | undefined) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  } else if (isYesterday) {
    return 'Wczoraj';
  } else if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
  } else {
    return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' });
  }
};

/**
 * Truncates a message to specified length and adds ellipsis if needed
 * @function truncateMessage
 * @param {string} message - The message to truncate
 * @param {number} [maxLength=45] - Maximum length before truncation
 * @returns {string} Truncated message with ellipsis if needed
 */
const truncateMessage = (message: string, maxLength: number = 45) => {
  if (!message) return '';
  return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
};

/**
 * Component displaying a list of conversations with users
 * @component
 * @param {ConversationListProps} props - Component props
 * @returns {JSX.Element} The ConversationList component
 */
const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeRecipientId,
  onSelectConversation,
}) => {
  /**
   * Memoized sorted conversations with most recent first
   * @type {Array}
   */
  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      if (!a.lastMessageDate && !b.lastMessageDate) return 0;
      if (!a.lastMessageDate) return 1;
      if (!b.lastMessageDate) return -1;

      return new Date(b.lastMessageDate).getTime() - new Date(a.lastMessageDate).getTime();
    });
  }, [conversations]);

  /**
   * Handles clicking on a conversation item
   * @function handleConversationClick
   * @param {string} userId - ID of the selected user
   * @param {React.MouseEvent} event - Click event
   */
  const handleConversationClick = (userId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    onSelectConversation(userId);
  };

  /**
   * Handles image loading errors by replacing with default image
   * @function handleImageError
   * @param {React.SyntheticEvent<HTMLImageElement>} event - Image error event
   */
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const target = event.currentTarget;
    target.src = DEFAULT_PROFILE_IMAGE;
  };

  return (
    <div className="conversations-list">
      <h3>Wiadomości</h3>
      {sortedConversations.length > 0 ? (
        <ul>
          {sortedConversations.map(conversation => (
            <li
              key={conversation.userId}
              className={`conversation-item ${activeRecipientId === conversation.userId ? 'active' : ''}`}
              onClick={e => handleConversationClick(conversation.userId, e)}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectConversation(conversation.userId);
                }
              }}
            >
              <div className="user-avatar">
                <img
                  src={conversation.profilePicture || DEFAULT_PROFILE_IMAGE}
                  alt={`${conversation.userName} avatar`}
                  onError={handleImageError}
                  loading="lazy"
                />
              </div>
              <div className="conversation-info">
                <div className="conversation-header">
                  <span className="user-name" title={conversation.userName}>
                    {conversation.userName}
                  </span>
                  <span className="last-message-time">
                    {formatConversationDate(conversation.lastMessageDate)}
                  </span>
                </div>
                <p className="last-message" title={conversation.lastMessage || ''}>
                  {conversation.lastMessage
                    ? truncateMessage(conversation.lastMessage)
                    : 'Rozpocznij konwersację'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="no-conversations">
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <h4>Brak konwersacji</h4>
            <p>Wyszukaj użytkownika, aby rozpocząć pierwszy czat</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationList;