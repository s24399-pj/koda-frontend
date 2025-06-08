import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axiosAuthClient from './axiosAuthClient.ts';
import { ChatMessage } from '../types/chat/ChatMessage.ts';
import { Conversation } from '../types/chat/Conversation.ts';

const isTokenValid = (): boolean => {
  const token = localStorage.getItem('accessToken');
  if (!token) return false;

  try {
    const payloadBase64 = token.split('.')[1];
    const payload = JSON.parse(atob(payloadBase64));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch (error) {
    console.error('Error validating token', error);
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
      console.log('Fetching all conversations...');
      const response = await axiosAuthClient.get<Conversation[]>('/api/v1/chat/conversations');
      console.log(`Fetched ${response.data.length} conversations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all conversations:', error);
      throw error;
    }
  }

  async connect(): Promise<void> {
    const token = localStorage.getItem('accessToken');
    if (!token || !isTokenValid()) {
      throw new Error('No valid authentication token');
    }

    if (this.client?.connected) {
      console.log('WebSocket already connected');
      return Promise.resolve();
    }

    if (this.isConnecting) {
      console.log('WebSocket connection in progress...');
      return new Promise((resolve, reject) => {
        const checkConnection = setInterval(() => {
          if (this.client?.connected) {
            clearInterval(checkConnection);
            resolve();
          }
        }, 500);

        setTimeout(() => {
          clearInterval(checkConnection);
          reject(new Error('Timeout waiting for WebSocket connection'));
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
            Authorization: `Bearer ${token}`,
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
          onStompError: frame => {
            console.error('Broker reported error: ' + frame.headers['message']);
            this.isConnecting = false;
            reject(new Error(frame.headers['message']));
          },
          onWebSocketError: event => {
            console.error('WebSocket error:', event);
            this.isConnecting = false;
            reject(new Error('WebSocket connection error'));
          },
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
      console.log('Disconnecting WebSocket...');
      this.client.deactivate();
      this.client = null;
      this.isConnecting = false;
    }
  }

  private subscribeToPersonalQueue(): void {
    if (!this.client || !this.client.connected) {
      console.error('Attempting to subscribe without WebSocket connection');
      return;
    }

    try {
      console.log('Subscribing to /user/queue/messages...');
      this.client.subscribe('/user/queue/messages', (message: IMessage) => {
        console.log('Received WebSocket message:', message.body);
        try {
          const chatMessage = JSON.parse(message.body) as ChatMessage;
          this.messageHandlers.forEach(handler => handler(chatMessage));
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });
      console.log('Successfully subscribed to /user/queue/messages');
    } catch (error) {
      console.error('Error during subscription:', error);
    }
  }

  async sendMessage(recipientId: string, content: string): Promise<void> {
    if (!this.client || !this.client.connected) {
      console.error('Not connected to WebSocket, attempting to reconnect...');
      try {
        await this.connect();
      } catch (error) {
        throw new Error('Cannot connect to chat server');
      }
    }

    const chatMessage: Partial<ChatMessage> = {
      recipientId,
      content,
    };

    console.log(`Sending message to ${recipientId}:`, content);

    this.client!.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify(chatMessage),
      headers: { 'content-type': 'application/json' },
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
      console.log(`Fetching chat history with ${recipientId}...`);

      if (!isTokenValid()) {
        throw new Error('Token expired - re-authentication required');
      }

      const response = await axiosAuthClient.get<ChatMessage[]>(
        `/api/v1/chat/messages?recipientId=${recipientId}`
      );
      console.log(`Fetched ${response.data.length} messages for ${recipientId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.client?.connected || false;
  }
}

export const chatService = new ChatService();
export { isTokenValid };
