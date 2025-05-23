// components/MessageInput.tsx
import React, {useState} from 'react';
import {ConnectionStatus} from './ConnectionStatus';

interface MessageInputProps {
    onSendMessage: (content: string) => void;
    connectionStatus: ConnectionStatus;
}

const MessageInput: React.FC<MessageInputProps> = ({onSendMessage, connectionStatus}) => {
    const [messageText, setMessageText] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageText.trim()) return;

        onSendMessage(messageText);
        setMessageText('');
    };

    return (
        <form className="message-form" onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Napisz wiadomość..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                disabled={connectionStatus !== ConnectionStatus.CONNECTED}
            />
            <button
                type="submit"
                disabled={!messageText.trim() || connectionStatus !== ConnectionStatus.CONNECTED}
            >
                <i className="fas fa-paper-plane"></i>
            </button>
        </form>
    );
};

export default MessageInput;