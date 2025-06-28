/**
 * Module for handling real-time chat functionality
 * @module services/chatService
 */

import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axiosAuthClient from './axiosAuthClient.ts';
import { ChatMessage } from '../types/chat/ChatMessage.ts';
import { Conversation } from '../types/chat/Conversation.ts';

/**
 * Checks if the current access token is valid
 * @function isTokenValid
 * @returns {boolean} Whether the token is valid and not expired
 */
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

/**
 * Service for handling real-time chat functionality
 * @class ChatService
 */
class ChatService {
  /** STOMP client for WebSocket communication */
  client: Client | null = null;
  
  /** Array of message handler callbacks */
  private messageHandlers: ((message: ChatMessage) => void)[] = [];
  
  /** Flag indicating if a connection attempt is in progress */
  private isConnecting: boolean = false;
  
  /** Number of connection attempts made */
  private connectionAttempts: number = 0;

  /**
   * Fetches all conversations for the current user
   * @async
   * @method getAllConversations
   * @returns {Promise<Conversation[]>} List of conversations
   * @throws {Error} Error fetching conversations
   */
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

  /**
   * Establishes WebSocket connection for real-time messaging
   * @async
   * @method connect
   * @returns {Promise<void>} Promise resolved when connected
   * @throws {Error} Connection error
   */
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

  /**
   * Disconnects the WebSocket connection
   * @method disconnect
   */
  disconnect(): void {
    if (this.client) {
      console.log('Disconnecting WebSocket...');
      this.client.deactivate();
      this.client = null;
      this.isConnecting = false;
    }
  }

  /**
   * Subscribes to the personal message queue
   * @private
   * @method subscribeToPersonalQueue
   */
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

  /**
   * Sends a message to another user
   * @async
   * @method sendMessage
   * @param {string} recipientId - ID of the message recipient
   * @param {string} content - Message content
   * @returns {Promise<void>} Promise resolved when the message is sent
   * @throws {Error} Error sending message
   */
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

  /**
   * Registers a handler for incoming messages
   * @method onMessageReceived
   * @param {function} handler - Function to call when a message is received
   * @returns {function} Function to unregister the handler
   */
  onMessageReceived(handler: (message: ChatMessage) => void): () => void {
    this.messageHandlers.push(handler);

    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  /**
   * Gets chat history with a specific user
   * @async
   * @method getChatHistory
   * @param {string} recipientId - ID of the other user
   * @returns {Promise<ChatMessage[]>} Chat history
   * @throws {Error} Error fetching chat history
   */
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

  /**
   * Checks if the WebSocket is currently connected
   * @method isConnected
   * @returns {boolean} Connection status
   */
  isConnected(): boolean {
    return this.client?.connected || false;
  }
}

/**
 * Singleton instance of the ChatService
 * @const chatService
 */
export const chatService = new ChatService();

export { isTokenValid };