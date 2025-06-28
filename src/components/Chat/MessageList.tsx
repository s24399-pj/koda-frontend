/**
 * Component for displaying a list of chat messages
 * @module components/chat/MessageList
 */

import React, { useRef } from 'react';
import { MessageListProps } from '../../types/chat/MessageListProps.ts';

/**
 * Formats a date string to display time in a message
 * @function formatMessageDate
 * @param {string} dateString - ISO date string to format
 * @returns {string} Formatted time string (HH:MM)
 */
const formatMessageDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
};

/**
 * Component displaying a scrollable list of chat messages
 * @component
 * @param {MessageListProps} props - Component props
 * @returns {JSX.Element} The MessageList component
 */
const MessageList: React.FC<MessageListProps> = ({ messages, currentUser }) => {
  /**
   * Reference to the end of messages list for auto-scrolling
   * @type {React.RefObject<HTMLDivElement>}
   */
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Display empty state when there are no messages
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
      {messages.map(message => {
        /**
         * Determines if the message was sent by the current user
         * @type {boolean}
         */
        const isCurrentUser = currentUser?.id === message.senderId;

        return (
          <div key={message.id} className={`message ${isCurrentUser ? 'sent' : 'received'}`}>
            <div className="message-content">
              <p>{message.content}</p>
            </div>
            <div className="message-meta">
              <span className="message-time">{formatMessageDate(message.createdAt)}</span>
            </div>
          </div>
        );
      })}
      {/* Empty div at the bottom for auto-scrolling */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
