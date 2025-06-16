import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {MemoryRouter, Route, Routes} from 'react-router-dom'
import ChatPage from '../ChatPage'
import {chatService, isTokenValid} from "../../../api/chatApi.ts";
import {getUserProfile} from "../../../api/useInternalApi.ts";
import {beforeEach, describe, expect, test, vi} from 'vitest'


vi.mock('../../api/chatApi', () => ({
    chatService: {
        connect: vi.fn(),
        disconnect: vi.fn(),
        getAllConversations: vi.fn(),
        getChatHistory: vi.fn(),
        onMessageReceived: vi.fn().mockReturnValue(() => {
        }),
        sendMessage: vi.fn(),
    },
    isTokenValid: vi.fn(),
}))

vi.mock('../../api/useInternalApi', () => ({
    getUserProfile: vi.fn(),
    searchUsers: vi.fn(),
}))

vi.mock('../SearchUsers', () => () => <div data-testid="SearchUsers"/>)
vi.mock('../ChatHeader', () => () => <div data-testid="ChatHeader"/>)
vi.mock('../MessageList', () => () => <div data-testid="MessageList"/>)
vi.mock('../MessageInput', () => () => <div data-testid="MessageInput"/>)
vi.mock('../ConversationList', () => () => <div data-testid="ConversationList"/>)

describe('<ChatPage />', () => {
    beforeEach(() => {
        vi.resetAllMocks()
    })

    test('when token invalid shows authentication error and login button', async () => {
        ;(isTokenValid as unknown as vi.Mock).mockReturnValue(false)

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
        expect(chatService.connect).toHaveBeenCalled()
    })

    test('when token valid and no conversations shows welcome message', async () => {
        ;(isTokenValid as unknown as vi.Mock).mockReturnValue(true)
        ;(getUserProfile as unknown as vi.Mock).mockResolvedValue({
            id: "u1",
            firstName: 'Foo',
            lastName: 'Bar',
            email: '',
            profilePictureBase64: '',
        })
        ;(chatService.getAllConversations as unknown as vi.Mock).mockResolvedValue([])

        render(
            <MemoryRouter initialEntries={['/chat']}>
                <Routes>
                    <Route path="/chat" element={<ChatPage/>}/>
                </Routes>
            </MemoryRouter>
        )

        await waitFor(() => {
            expect(screen.getByTestId('SearchUsers')).toBeInTheDocument()
            expect(
                screen.getByRole('heading', {name: /Witaj w czacie!/i})
            ).toBeInTheDocument()
            expect(
                screen.getByText(/Wybierz konwersację z listy lub wyszukaj użytkownika/i)
            ).toBeInTheDocument()
        })
    })
})
