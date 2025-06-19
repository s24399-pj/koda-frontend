import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {MemoryRouter, Route, Routes} from 'react-router-dom'
import ChatPage from '../ChatPage'
import {beforeEach, describe, expect, test, vi} from 'vitest'

const {
    mockConnect,
    mockDisconnect,
    mockGetAllConversations,
    mockGetChatHistory,
    mockOnMessageReceived,
    mockSendMessage,
    mockIsTokenValid,
    mockGetUserProfile,
    mockSearchUsers,
    mockNavigate,
    mockUseParams,
    mockUseLocation
} = vi.hoisted(() => ({
    mockConnect: vi.fn(),
    mockDisconnect: vi.fn(),
    mockGetAllConversations: vi.fn(),
    mockGetChatHistory: vi.fn(),
    mockOnMessageReceived: vi.fn(),
    mockSendMessage: vi.fn(),
    mockIsTokenValid: vi.fn(),
    mockGetUserProfile: vi.fn(),
    mockSearchUsers: vi.fn(),
    mockNavigate: vi.fn(),
    mockUseParams: vi.fn(),
    mockUseLocation: vi.fn()
}))

vi.mock('../../../api/chatApi', () => ({
    chatService: {
        connect: mockConnect,
        disconnect: mockDisconnect,
        getAllConversations: mockGetAllConversations,
        getChatHistory: mockGetChatHistory,
        onMessageReceived: mockOnMessageReceived,
        sendMessage: mockSendMessage,
    },
    isTokenValid: mockIsTokenValid,
}))

vi.mock('../../../api/useInternalApi', () => ({
    getUserProfile: mockGetUserProfile,
    searchUsers: mockSearchUsers,
}))

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        useParams: mockUseParams,
        useLocation: mockUseLocation
    }
})

vi.mock('../../components/Chat/SearchUsers.tsx', () => ({
    default: () => <div data-testid="SearchUsers">Search Users Component</div>
}))

vi.mock('../../components/Chat/ChatHeader.tsx', () => ({
    default: () => <div data-testid="ChatHeader">Chat Header Component</div>
}))

vi.mock('../../components/Chat/MessageList.tsx', () => ({
    default: () => <div data-testid="MessageList">Message List Component</div>
}))

vi.mock('../../components/Chat/MessageInput.tsx', () => ({
    default: () => <div data-testid="MessageInput">Message Input Component</div>
}))

vi.mock('../../components/Chat/ConversationList.tsx', () => ({
    default: () => <div data-testid="ConversationList">Conversation List Component</div>
}))

const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn(),
    length: 0
}

vi.stubGlobal('localStorage', localStorageMock)

describe('ChatPage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        mockConnect.mockReset()
        mockDisconnect.mockReset()
        mockGetAllConversations.mockReset()
        mockGetChatHistory.mockReset()
        mockOnMessageReceived.mockReset()
        mockSendMessage.mockReset()
        mockIsTokenValid.mockReset()
        mockGetUserProfile.mockReset()
        mockSearchUsers.mockReset()
        mockNavigate.mockReset()
        mockUseParams.mockReset()
        mockUseLocation.mockReset()

        mockOnMessageReceived.mockReturnValue(() => {})
        localStorageMock.removeItem.mockReset()

        mockUseParams.mockReturnValue({ recipientId: undefined })
        mockUseLocation.mockReturnValue({
            pathname: '/chat',
            state: null,
            search: '',
            hash: '',
            key: 'default'
        })
    })

    test('when token invalid shows authentication error and login button', async () => {
        mockIsTokenValid.mockReturnValue(false)

        render(
            <MemoryRouter initialEntries={['/chat/123']}>
                <Routes>
                    <Route path="/chat/:recipientId" element={<ChatPage/>}/>
                </Routes>
            </MemoryRouter>
        )

        expect(
            await screen.findByRole('heading', {name: /Authentication error/i})
        ).toBeInTheDocument()

        const btn = screen.getByRole('button', {name: /Login again/i})
        fireEvent.click(btn)

        expect(localStorageMock.removeItem).toHaveBeenCalledWith('accessToken')
        expect(mockNavigate).toHaveBeenCalledWith('/user/login', {
            state: { returnUrl: window.location.pathname }
        })
    })

    test('when token valid and no conversations shows welcome message', async () => {
        mockIsTokenValid.mockReturnValue(true)
        mockGetUserProfile.mockResolvedValue({
            id: "u1",
            firstName: 'Foo',
            lastName: 'Bar',
            email: 'foo@test.com',
            profilePictureBase64: '',
        })
        mockGetAllConversations.mockResolvedValue([])
        mockConnect.mockResolvedValue(undefined)

        render(
            <MemoryRouter initialEntries={['/chat']}>
                <Routes>
                    <Route path="/chat" element={<ChatPage/>}/>
                </Routes>
            </MemoryRouter>
        )

        await waitFor(() => {
            const chatPage = document.querySelector('.chat-page')
            expect(chatPage).toBeInTheDocument()
        }, { timeout: 2000 })

        expect(screen.getByPlaceholderText('Szukaj użytkowników...')).toBeInTheDocument()

        expect(
            screen.getByRole('heading', {name: /Witaj w czacie!/i})
        ).toBeInTheDocument()

        expect(
            screen.getByText(/Wybierz konwersację z listy lub wyszukaj użytkownika, aby rozpocząć rozmowę/i)
        ).toBeInTheDocument()

        expect(mockGetUserProfile).toHaveBeenCalled()
        expect(mockGetAllConversations).toHaveBeenCalled()
        expect(mockConnect).toHaveBeenCalled()
    }, 10000)
})