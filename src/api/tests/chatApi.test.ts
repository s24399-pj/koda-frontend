import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { ChatMessage } from '../../types/chat/ChatMessage';
import { Conversation } from '../../types/chat/Conversation';

const mockAxiosGet = vi.fn();
vi.mock('../axiosAuthClient', () => ({
  default: {
    get: mockAxiosGet,
  },
}));

const mockSockJS = vi.fn();
vi.mock('sockjs-client', () => ({
  default: mockSockJS,
}));

const mockClient = {
  connected: false,
  activate: vi.fn(),
  deactivate: vi.fn(),
  subscribe: vi.fn(),
  publish: vi.fn(),
};

const MockedClient = vi.fn(() => mockClient);
vi.mock('@stomp/stompjs', () => ({
  Client: MockedClient,
}));

vi.stubGlobal('localStorage', {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
});

describe('ChatService', () => {
  const mockApiUrl = 'http://test-api.com';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_API_URL', mockApiUrl);
    console.log = vi.fn();
    console.error = vi.fn();
    mockClient.connected = false;
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isTokenValid', () => {
    test('should return false when no token exists', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      const { isTokenValid } = await import('../chatApi');

      expect(isTokenValid()).toBe(false);
      expect(localStorage.getItem).toHaveBeenCalledWith('accessToken');
    });

    test('should return true for valid token', async () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const mockToken = `header.${btoa(JSON.stringify({ exp: futureExp }))}.signature`;
      vi.mocked(localStorage.getItem).mockReturnValue(mockToken);

      const { isTokenValid } = await import('../chatApi');

      expect(isTokenValid()).toBe(true);
    });

    test('should return false for expired token', async () => {
      const pastExp = Math.floor(Date.now() / 1000) - 3600;
      const mockToken = `header.${btoa(JSON.stringify({ exp: pastExp }))}.signature`;
      vi.mocked(localStorage.getItem).mockReturnValue(mockToken);

      const { isTokenValid } = await import('../chatApi');

      expect(isTokenValid()).toBe(false);
    });

    test('should return false for malformed token', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue('invalid-token');

      const { isTokenValid } = await import('../chatApi');

      expect(isTokenValid()).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Error validating token', expect.any(Error));
    });
  });

  describe('getAllConversations', () => {
    test('should fetch all conversations successfully', async () => {
      const mockConversations: Conversation[] = [
        {
          userId: '1',
          userName: 'User 1',
          profilePicture: 'avatar1.jpg',
          lastMessage: 'Hello',
          lastMessageDate: new Date().toISOString(),
        },
        {
          userId: '2',
          userName: 'User 2',
          lastMessage: 'Hi',
          lastMessageDate: new Date().toISOString(),
        },
      ];

      mockAxiosGet.mockResolvedValueOnce({ data: mockConversations });

      const { chatService } = await import('../chatApi');
      const result = await chatService.getAllConversations();

      expect(mockAxiosGet).toHaveBeenCalledWith('/api/v1/chat/conversations');
      expect(result).toEqual(mockConversations);
      expect(console.log).toHaveBeenCalledWith('Fetching all conversations...');
      expect(console.log).toHaveBeenCalledWith('Fetched 2 conversations');
    });

    test('should handle error when fetching conversations', async () => {
      const mockError = new Error('Network error');
      mockAxiosGet.mockRejectedValueOnce(mockError);

      const { chatService } = await import('../chatApi');

      await expect(chatService.getAllConversations()).rejects.toThrow('Network error');
      expect(console.error).toHaveBeenCalledWith('Error fetching all conversations:', mockError);
    });
  });

  describe('connect', () => {
    test('should connect successfully with valid token', async () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const validToken = `header.${btoa(JSON.stringify({ exp: futureExp }))}.signature`;

      vi.mocked(localStorage.getItem).mockReturnValue(validToken);
      mockSockJS.mockReturnValue({});

      const { chatService } = await import('../chatApi');

      const connectPromise = chatService.connect();

      const calls = (MockedClient as any).mock.calls;
      if (calls && calls.length > 0 && calls[0] && calls[0][0]) {
        const clientConstructor = calls[0][0];
        if (clientConstructor.onConnect) {
          clientConstructor.onConnect();
        }
      }

      await connectPromise;

      expect(MockedClient).toHaveBeenCalledWith({
        webSocketFactory: expect.any(Function),
        connectHeaders: {
          Authorization: `Bearer ${validToken}`,
        },
        debug: expect.any(Function),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: expect.any(Function),
        onStompError: expect.any(Function),
        onWebSocketError: expect.any(Function),
      });

      expect(mockClient.activate).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith('Connected to WebSocket successfully');
    });

    test('should throw error when no token exists', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const { chatService } = await import('../chatApi');

      await expect(chatService.connect()).rejects.toThrow('No valid authentication token');
    });

    test('should handle connection error', async () => {
      const validToken = `header.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))}.signature`;
      vi.mocked(localStorage.getItem).mockReturnValue(validToken);

      const { chatService } = await import('../chatApi');

      const connectPromise = chatService.connect();

      const calls = (MockedClient as any).mock.calls;
      if (calls && calls.length > 0 && calls[0] && calls[0][0]) {
        const clientConstructor = calls[0][0];
        if (clientConstructor.onWebSocketError) {
          clientConstructor.onWebSocketError(new Event('error'));
        }
      }

      await expect(connectPromise).rejects.toThrow('WebSocket connection error');
    });
  });

  describe('disconnect', () => {
    test('should disconnect when client exists', async () => {
      const { chatService } = await import('../chatApi');
      chatService.client = mockClient as any;

      chatService.disconnect();

      expect(console.log).toHaveBeenCalledWith('Disconnecting WebSocket...');
      expect(mockClient.deactivate).toHaveBeenCalled();
      expect(chatService.client).toBeNull();
    });

    test('should handle disconnect when no client exists', async () => {
      const { chatService } = await import('../chatApi');
      chatService.client = null;

      chatService.disconnect();

      expect(mockClient.deactivate).not.toHaveBeenCalled();
    });
  });

  describe('sendMessage', () => {
    test('should send message when connected', async () => {
      const { chatService } = await import('../chatApi');
      chatService.client = mockClient as any;
      mockClient.connected = true;

      await chatService.sendMessage('recipient-123', 'Hello World');

      expect(mockClient.publish).toHaveBeenCalledWith({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify({
          recipientId: 'recipient-123',
          content: 'Hello World',
        }),
        headers: { 'content-type': 'application/json' },
      });
    });

    test('should reconnect and send when not connected', async () => {
      const validToken = `header.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))}.signature`;
      vi.mocked(localStorage.getItem).mockReturnValue(validToken);

      const { chatService } = await import('../chatApi');
      chatService.client = mockClient as any;
      mockClient.connected = false;

      const sendPromise = chatService.sendMessage('recipient-123', 'Hello');

      const calls = (MockedClient as any).mock.calls;
      if (calls && calls.length > 0 && calls[0] && calls[0][0]) {
        const clientConstructor = calls[0][0];
        if (clientConstructor.onConnect) {
          clientConstructor.onConnect();
        }
      }
      mockClient.connected = true;

      await sendPromise;

      expect(console.error).toHaveBeenCalledWith(
        'Not connected to WebSocket, attempting to reconnect...'
      );
      expect(mockClient.publish).toHaveBeenCalled();
    });
  });

  describe('getChatHistory', () => {
    test('should fetch chat history successfully', async () => {
      const validToken = `header.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))}.signature`;
      vi.mocked(localStorage.getItem).mockReturnValue(validToken);

      const mockMessages: ChatMessage[] = [
        {
          id: '1',
          senderId: 'user1',
          senderName: 'User One',
          recipientId: 'user2',
          recipientName: 'User Two',
          content: 'Hello',
          createdAt: new Date().toISOString(),
          status: 'SENT',
        },
        {
          id: '2',
          senderId: 'user2',
          senderName: 'User Two',
          recipientId: 'user1',
          recipientName: 'User One',
          content: 'Hi',
          createdAt: new Date().toISOString(),
          status: 'DELIVERED',
        },
      ];

      mockAxiosGet.mockResolvedValueOnce({ data: mockMessages });

      const { chatService } = await import('../chatApi');
      const result = await chatService.getChatHistory('user2');

      expect(mockAxiosGet).toHaveBeenCalledWith('/api/v1/chat/messages?recipientId=user2');
      expect(result).toEqual(mockMessages);
    });

    test('should throw error when token is invalid', async () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const { chatService } = await import('../chatApi');

      await expect(chatService.getChatHistory('user2')).rejects.toThrow(
        'Token expired - re-authentication required'
      );
    });
  });

  describe('onMessageReceived', () => {
    test('should add and remove message handlers', async () => {
      const { chatService } = await import('../chatApi');
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      const unsubscribe1 = chatService.onMessageReceived(handler1);
      const unsubscribe2 = chatService.onMessageReceived(handler2);

      expect((chatService as any)['messageHandlers']).toHaveLength(2);

      unsubscribe1();
      expect((chatService as any)['messageHandlers']).toHaveLength(1);

      unsubscribe2();
      expect((chatService as any)['messageHandlers']).toHaveLength(0);
    });
  });

  describe('isConnected', () => {
    test('should return true when connected', async () => {
      const { chatService } = await import('../chatApi');
      chatService.client = mockClient as any;
      mockClient.connected = true;

      expect(chatService.isConnected()).toBe(true);
    });

    test('should return false when not connected', async () => {
      const { chatService } = await import('../chatApi');
      chatService.client = mockClient as any;
      mockClient.connected = false;

      expect(chatService.isConnected()).toBe(false);
    });

    test('should return false when client is null', async () => {
      const { chatService } = await import('../chatApi');
      chatService.client = null;

      expect(chatService.isConnected()).toBe(false);
    });
  });
});
