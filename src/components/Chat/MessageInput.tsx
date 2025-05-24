import React, {useEffect, useRef, useState} from 'react';

interface MessageInputProps {
    onSendMessage: (content: string) => void;
    isConnected: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({onSendMessage, isConnected}) => {
    const [message, setMessage] = useState<string>('');
    const [isSending, setIsSending] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isConnected && inputRef.current) {
            inputRef.current?.focus({preventScroll: true});
        }
    }, [isConnected]);

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

            // Focus input after sending
            if (inputRef.current) {
                inputRef.current?.focus({preventScroll: true});
            }
        } catch (error) {
            // Error is handled by parent component
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
    };

    const isDisabled = !isConnected || isSending || !message.trim();

    return (
        <form className="message-form" onSubmit={handleSubmit}>
            <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={
                    !isConnected
                        ? "Łączenie z serwerem..."
                        : "Napisz wiadomość..."
                }
                disabled={!isConnected}
                maxLength={1000}
                autoComplete="off"
                aria-label="Napisz wiadomość"
            />
            <button
                type="submit"
                disabled={isDisabled}
                aria-label={isSending ? "Wysyłanie..." : "Wyślij wiadomość"}
                title={
                    !isConnected
                        ? "Brak połączenia z serwerem"
                        : isSending
                            ? "Wysyłanie..."
                            : "Wyślij wiadomość"
                }
            >
                {isSending ? (
                    <div className="sending-spinner">⟳</div>
                ) : (
                    <span>➤</span>
                )}
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