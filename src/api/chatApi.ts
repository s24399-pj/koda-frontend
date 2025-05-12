import {Client, IMessage} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axiosAuthClient from "./axiosAuthClient.ts";

export interface ChatMessage {
    id: string;
    senderId: string;
    senderName: string;
    recipientId: string;
    recipientName: string;
    content: string;
    createdAt: string;
    status: 'SENT' | 'DELIVERED' | 'READ';
}

class ChatService {
    private client: Client | null = null;
    private messageHandlers: ((message: ChatMessage) => void)[] = [];

    connect(token: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client = new Client({
                webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
                connectHeaders: {
                    Authorization: `Bearer ${token}`
                },
                debug: function (str) {
                    console.log(str);
                },
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
                onConnect: () => {
                    console.log('Connected to WebSocket');
                    this.subscribeToPersonalQueue();
                    resolve();
                },
                onStompError: (frame) => {
                    console.error('Broker reported error: ' + frame.headers['message']);
                    console.error('Additional details: ' + frame.body);
                    reject(new Error(frame.headers['message']));
                }
            });

            this.client.activate();
        });
    }

    disconnect(): void {
        if (this.client) {
            this.client.deactivate();
            this.client = null;
        }
    }

    private subscribeToPersonalQueue(): void {
        if (!this.client) {
            return;
        }

        this.client.subscribe('/user/queue/messages', (message: IMessage) => {
            const chatMessage = JSON.parse(message.body) as ChatMessage;
            this.messageHandlers.forEach(handler => handler(chatMessage));

            // Automatycznie oznacz jako dostarczone
            this.markMessageAsDelivered(chatMessage.id);
        });
    }

    sendMessage(recipientId: string, content: string): void {
        if (!this.client) {
            throw new Error('Not connected to WebSocket');
        }

        const chatMessage: Partial<ChatMessage> = {
            recipientId,
            content
        };

        this.client.publish({
            destination: '/app/chat.sendMessage',
            body: JSON.stringify(chatMessage)
        });
    }

    onMessageReceived(handler: (message: ChatMessage) => void): () => void {
        this.messageHandlers.push(handler);

        return () => {
            this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
        };
    }

    async getChatHistory(recipientId: string): Promise<ChatMessage[]> {
        try {
            const response = await axiosAuthClient.get(`/api/chat/messages?recipientId=${recipientId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching chat history:', error);
            return [];
        }
    }

    async getUnreadMessages(): Promise<ChatMessage[]> {
        try {
            const response = await axiosAuthClient.get('/api/chat/messages/unread');
            return response.data;
        } catch (error) {
            console.error('Error fetching unread messages:', error);
            return [];
        }
    }

    async markMessageAsDelivered(messageId: string): Promise<void> {
        try {
            await axiosAuthClient.put(`/api/chat/messages/${messageId}/delivered`);
        } catch (error) {
            console.error('Error marking message as delivered:', error);
        }
    }

    async markMessageAsRead(messageId: string): Promise<void> {
        try {
            await axiosAuthClient.put(`/api/chat/messages/${messageId}/read`);
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    }
}

export const chatService = new ChatService();