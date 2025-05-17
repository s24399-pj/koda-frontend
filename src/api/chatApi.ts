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
        // Pobranie części payload z tokenu JWT
        const payloadBase64 = token.split('.')[1];
        const payload = JSON.parse(atob(payloadBase64));

        // Sprawdzenie czy token nie wygasł
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
    private maxConnectionAttempts: number = 3;
    private reconnectTimer: number | null = null;

    // Metoda do ustawienia ID bieżącego użytkownika
    setCurrentUserId(userId: string) {
        console.log("Ustawiono ID bieżącego użytkownika:", userId);
    }

    async getAllConversations(): Promise<Conversation[]> {
        try {
            console.log('Pobieranie wszystkich konwersacji...');
            const response = await axiosAuthClient.get<Conversation[]>('/api/chat/conversations');
            console.log(`Pobrano ${response.data.length} konwersacji`);
            return response.data;
        } catch (error) {
            console.error('Error fetching all conversations:', error);

            if ((error as any).response?.status === 401) {
                console.error('Token wygasł podczas pobierania konwersacji');
                throw new Error('Token wygasł. Zaloguj się ponownie.');
            }

            return [];
        }
    }

    async connect(): Promise<void> {
        // Sprawdź token przed próbą połączenia
        const token = localStorage.getItem("accessToken");
        if (!token) {
            throw new Error('Brak tokenu uwierzytelniającego. Zaloguj się ponownie.');
        }

        // Jeśli token jest nieprawidłowy, rzuć błąd
        if (!isTokenValid()) {
            localStorage.removeItem("accessToken");
            throw new Error('Token wygasł. Zaloguj się ponownie.');
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

                // Timeout po 10 sekundach
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
                // Użyj zmiennej środowiskowej zamiast sztywno zakodowanego URL
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

                console.log(`Łączenie z WebSocket: ${apiUrl}/ws`);

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
                        console.error('Additional details: ' + frame.body);
                        this.isConnecting = false;

                        if (this.connectionAttempts < this.maxConnectionAttempts) {
                            console.log(`Próba ponownego połączenia ${this.connectionAttempts}/${this.maxConnectionAttempts}`);
                            this.connect().then(resolve).catch(reject);
                        } else {
                            reject(new Error(frame.headers['message']));
                        }
                    },
                    onWebSocketError: (event) => {
                        console.error('WebSocket error:', event);
                        this.isConnecting = false;

                        if (this.connectionAttempts < this.maxConnectionAttempts) {
                            console.log(`Próba ponownego połączenia po błędzie ${this.connectionAttempts}/${this.maxConnectionAttempts}`);
                            this.connect().then(resolve).catch(reject);
                        } else {
                            reject(new Error('WebSocket connection error'));
                        }
                    },
                    onWebSocketClose: (event) => {
                        console.warn('WebSocket connection closed:', event);
                        this.isConnecting = false;

                        // Sprawdź czy token wygasł po rozłączeniu
                        if (!isTokenValid()) {
                            console.error('Token wygasł po rozłączeniu WebSocket');
                            // Przekieruj do strony logowania
                            localStorage.removeItem("accessToken");
                            window.location.href = '/user/login';
                        }
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

            // Wyczyść timer reconnect
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }
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

                    // Automatycznie oznacz jako dostarczone
                    this.markMessageAsDelivered(chatMessage.id);
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
        // Sprawdź token przed wysłaniem wiadomości
        if (!isTokenValid()) {
            throw new Error('Token wygasł. Zaloguj się ponownie.');
        }

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
            // Upewnij się, że recipientId jest poprawnym UUID
            if (!recipientId || !this.isValidUUID(recipientId)) {
                console.error(`Nieprawidłowy format recipientId: ${recipientId}`);
                return [];
            }

            console.log(`Pobieranie historii czatu z ${recipientId}...`);
            console.log(`URL zapytania: /api/chat/messages?recipientId=${recipientId}`);

            const response = await axiosAuthClient.get<ChatMessage[]>(`/api/chat/messages?recipientId=${recipientId}`);
            console.log(`Pobrano ${response.data.length} wiadomości:`, response.data);

            // Dodatkowe logowanie dla diagnozy
            if (response.data.length > 0) {
                console.log('Przykładowa wiadomość:', response.data[0]);
            } else {
                console.warn('Brak wiadomości w historii czatu!');
            }

            return response.data;
        } catch (error) {
            console.error('Error fetching chat history:', error);

            if ((error as any).response) {
                console.error('Status błędu:', (error as any).response.status);
                console.error('Dane błędu:', (error as any).response.data);
            }

            if ((error as any).response?.status === 401) {
                console.error('Token wygasł podczas pobierania historii czatu');
                throw new Error('Token wygasł. Zaloguj się ponownie.');
            }

            return [];
        }
    }

    async getUnreadMessages(): Promise<ChatMessage[]> {
        try {
            console.log('Pobieranie nieprzeczytanych wiadomości...');
            const response = await axiosAuthClient.get<ChatMessage[]>('/api/chat/messages/unread');
            console.log(`Pobrano ${response.data.length} nieprzeczytanych wiadomości`);
            return response.data;
        } catch (error) {
            console.error('Error fetching unread messages:', error);

            if ((error as any).response?.status === 401) {
                console.error('Token wygasł podczas pobierania nieprzeczytanych wiadomości');
                throw new Error('Token wygasł. Zaloguj się ponownie.');
            }

            return [];
        }
    }

    async markMessageAsDelivered(messageId: string): Promise<void> {
        try {
            console.log(`Oznaczanie wiadomości ${messageId} jako dostarczonej...`);
            await axiosAuthClient.put(`/api/chat/messages/${messageId}/delivered`);
        } catch (error) {
            console.error('Error marking message as delivered:', error);
        }
    }

    async markMessageAsRead(messageId: string): Promise<void> {
        try {
            console.log(`Oznaczanie wiadomości ${messageId} jako przeczytanej...`);
            await axiosAuthClient.put(`/api/chat/messages/${messageId}/read`);
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    }

    isConnected(): boolean {
        return this.client?.connected || false;
    }

    // Ustawia automatyczne próby ponownego połączenia co określony czas
    startReconnectScheduler(interval: number = 30000): void {
        this.stopReconnectScheduler();

        this.reconnectTimer = window.setInterval(async () => {
            if (!this.isConnected() && isTokenValid()) {
                console.log('Automatyczna próba ponownego połączenia...');
                try {
                    await this.connect();
                    console.log('Automatyczne ponowne połączenie udane');
                } catch (error) {
                    console.error('Błąd podczas automatycznego ponownego połączenia:', error);
                }
            }
        }, interval);
    }

    stopReconnectScheduler(): void {
        if (this.reconnectTimer) {
            clearInterval(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    // Pomocnicza funkcja do sprawdzania, czy string jest poprawnym UUID
    private isValidUUID(uuid: string): boolean {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }
}

export const chatService = new ChatService();
export {isTokenValid};