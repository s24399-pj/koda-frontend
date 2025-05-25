export interface MessageInputProps {
    onSendMessage: (content: string) => void;
    isConnected: boolean;
}