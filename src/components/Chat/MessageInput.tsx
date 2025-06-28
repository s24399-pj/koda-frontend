/**
 * Component for entering and sending chat messages
 * @module components/chat/MessageInput
 */

import React, { useEffect, useRef, useState } from 'react';
import { MessageInputProps } from '../../types/chat/MessageInputProps.ts';

/**
 * Input component for sending messages in a chat interface
 * @component
 * @param {MessageInputProps} props - Component props
 * @returns {JSX.Element} The MessageInput component
 */
const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isConnected }) => {
  /** Current message text */
  const [message, setMessage] = useState<string>('');

  /** Whether a message is currently being sent */
  const [isSending, setIsSending] = useState<boolean>(false);

  /** Reference to the input element for focus management */
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Focus the input field when connection is established
   */
  useEffect(() => {
    if (isConnected && inputRef.current) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [isConnected]);

  /**
   * Handles form submission to send a message
   * @async
   * @function handleSubmit
   * @param {React.FormEvent} e - Form submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || !isConnected || isSending) {
      return;
    }

    setIsSending(true);
    try {
      await onSendMessage(trimmedMessage);
      setMessage('');
      if (inputRef.current) {
        inputRef.current?.focus({ preventScroll: true });
      }
    } catch (error) {
      // Error handling is managed by the parent component
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Handles keyboard events to submit on Enter
   * @function handleKeyPress
   * @param {React.KeyboardEvent} e - Keyboard event
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  /**
   * Updates message state on input change
   * @function handleInputChange
   * @param {React.ChangeEvent<HTMLInputElement>} e - Input change event
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  /**
   * Whether the send button should be disabled
   * @type {boolean}
   */
  const isDisabled = !isConnected || isSending || !message.trim();

  return (
    <form className="message-form" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="text"
        value={message}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder={!isConnected ? 'Łączenie z serwerem...' : 'Napisz wiadomość...'}
        disabled={!isConnected}
        maxLength={1000}
        autoComplete="off"
        aria-label="Napisz wiadomość"
      />
      <button
        type="submit"
        disabled={isDisabled}
        aria-label={isSending ? 'Wysyłanie...' : 'Wyślij wiadomość'}
        title={
          !isConnected
            ? 'Brak połączenia z serwerem'
            : isSending
              ? 'Wysyłanie...'
              : 'Wyślij wiadomość'
        }
      >
        {isSending ? <div className="sending-spinner">⟳</div> : <span>➤</span>}
      </button>
      {!isConnected && (
        <div className="connection-warning">
          <span className="warning-icon">⚠️</span>
          <span>Brak połączenia z serwerem</span>
        </div>
      )}
    </form>
  );
};

export default MessageInput;
