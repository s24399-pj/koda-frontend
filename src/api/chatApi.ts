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

export interface Conversation {
    userId: string;
    userName: string;
    profilePicture?: string;
    lastMessage?: string;
    lastMessageDate?: string;
    unreadCount: number;
}

// Funkcja do sprawdzania ważności tokenu JWT
const isTokenValid = (): boolean => {
    const token = localStorage.getItem("accessToken");
    if (!token) return false;

    try {
        const payloadBase64 = token.split('.')[1];
        const payload = JSON.parse(atob(payloadBase64));
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp > currentTime;
    } catch (error) {
        console.error('Błąd podczas walidacji tokenu', error);
        return false;
    }
};

class ChatService {
    client: Client | null = null;
    private messageHandlers: ((message: ChatMessage) => void)[] = [];
    private isConnecting: boolean = false;
    private connectionAttempts: number = 0;

    async getAllConversations(): Promise<Conversation[]> {
        try {
            console.log('Pobieranie wszystkich konwersacji...');
            const response = await axiosAuthClient.get<Conversation[]>('/api/v1/chat/conversations');
            console.log(`Pobrano ${response.data.length} konwersacji`);
            return response.data;
        } catch (error) {
            console.error('Error fetching all conversations:', error);
            throw error; // Rzuć błąd dalej zamiast zwracać pustą tablicę
        }
    }

    async connect(): Promise<void> {
        const token = localStorage.getItem("accessToken");
        if (!token || !isTokenValid()) {
            throw new Error('Brak ważnego tokenu uwierzytelniającego');
        }

        if (this.client?.connected) {
            console.log('WebSocket już połączony');
            return Promise.resolve();
        }

        if (this.isConnecting) {
            console.log('Połączenie WebSocket w trakcie...');
            return new Promise((resolve, reject) => {
                const checkConnection = setInterval(() => {
                    if (this.client?.connected) {
                        clearInterval(checkConnection);
                        resolve();
                    }
                }, 500);

                setTimeout(() => {
                    clearInterval(checkConnection);
                    reject(new Error('Timeout podczas oczekiwania na połączenie WebSocket'));
                }, 10000);
            });
        }

        this.isConnecting = true;
        this.connectionAttempts++;

        return new Promise((resolve, reject) => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

                this.client = new Client({
                    webSocketFactory: () => new SockJS(`${apiUrl}/ws`),
                    connectHeaders: {
                        Authorization: `Bearer ${token}`
                    },
                    debug: function (str) {
                        console.log(`SockJS Debug: ${str}`);
                    },
                    reconnectDelay: 5000,
                    heartbeatIncoming: 4000,
                    heartbeatOutgoing: 4000,
                    onConnect: () => {
                        console.log('Connected to WebSocket successfully');
                        this.isConnecting = false;
                        this.connectionAttempts = 0;
                        this.subscribeToPersonalQueue();
                        resolve();
                    },
                    onStompError: (frame) => {
                        console.error('Broker reported error: ' + frame.headers['message']);
                        this.isConnecting = false;
                        reject(new Error(frame.headers['message']));
                    },
                    onWebSocketError: (event) => {
                        console.error('WebSocket error:', event);
                        this.isConnecting = false;
                        reject(new Error('WebSocket connection error'));
                    }
                });

                this.client.activate();
            } catch (error) {
                console.error('Error creating WebSocket client:', error);
                this.isConnecting = false;
                reject(error);
            }
        });
    }

    disconnect(): void {
        if (this.client) {
            console.log('Rozłączanie WebSocket...');
            this.client.deactivate();
            this.client = null;
            this.isConnecting = false;
        }
    }

    private subscribeToPersonalQueue(): void {
        if (!this.client || !this.client.connected) {
            console.error('Próba subskrypcji bez połączenia WebSocket');
            return;
        }

        try {
            console.log('Subskrypcja do /user/queue/messages...');
            this.client.subscribe('/user/queue/messages', (message: IMessage) => {
                console.log('Otrzymano wiadomość WebSocket:', message.body);
                try {
                    const chatMessage = JSON.parse(message.body) as ChatMessage;
                    this.messageHandlers.forEach(handler => handler(chatMessage));
                } catch (error) {
                    console.error('Błąd parsowania wiadomości WebSocket:', error);
                }
            });
            console.log('Subskrypcja do /user/queue/messages została utworzona pomyślnie');
        } catch (error) {
            console.error('Błąd podczas subskrypcji:', error);
        }
    }

    async sendMessage(recipientId: string, content: string): Promise<void> {
        if (!this.client || !this.client.connected) {
            console.error('Nie połączono z WebSocket, próba ponownego połączenia...');
            try {
                await this.connect();
            } catch (error) {
                throw new Error('Nie można połączyć z serwerem czatu');
            }
        }

        const chatMessage: Partial<ChatMessage> = {
            recipientId,
            content
        };

        console.log(`Wysyłanie wiadomości do ${recipientId}:`, content);

        this.client!.publish({
            destination: '/app/chat.sendMessage',
            body: JSON.stringify(chatMessage),
            headers: {'content-type': 'application/json'}
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
            console.log(`Pobieranie historii czatu z ${recipientId}...`);

            // Dodaj walidację tokenu przed zapytaniem
            if (!isTokenValid()) {
                throw new Error('Token wygasł - wymagane ponowne logowanie');
            }

            const response = await axiosAuthClient.get<ChatMessage[]>(`/api/v1/chat/messages?recipientId=${recipientId}`);
            console.log(`Pobrano ${response.data.length} wiadomości dla ${recipientId}:`, response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching chat history:', error);
            // Rzuć błąd dalej zamiast zwracać pustą tablicę
            throw error;
        }
    }

    isConnected(): boolean {
        return this.client?.connected || false;
    }
}

export const chatService = new ChatService();
export {isTokenValid};