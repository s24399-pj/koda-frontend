import {render, screen} from '@testing-library/react'
import {describe, expect, test} from 'vitest'
import MessageList from '../MessageList'
import {ChatMessage} from '../../../types/chat/ChatMessage'
import {UserProfile} from '../../../types/user/UserProfile'
import {MessageListProps} from '../../../types/chat/MessageListProps'

describe('MessageList', () => {
    const mockCurrentUser: UserProfile = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com'
    }

    const mockMessages: ChatMessage[] = [
        {
            id: 'msg-1',
            senderId: 'user-1',
            senderName: 'John Doe',
            recipientId: 'user-2',
            recipientName: 'Jane Smith',
            content: 'Hello there!',
            createdAt: '2024-01-15T10:30:00Z',
            status: 'DELIVERED'
        },
        {
            id: 'msg-2',
            senderId: 'user-2',
            senderName: 'Jane Smith',
            recipientId: 'user-1',
            recipientName: 'John Doe',
            content: 'Hi! How are you?',
            createdAt: '2024-01-15T10:31:00Z',
            status: 'READ'
        },
        {
            id: 'msg-3',
            senderId: 'user-1',
            senderName: 'John Doe',
            recipientId: 'user-2',
            recipientName: 'Jane Smith',
            content: 'I am doing great, thanks!',
            createdAt: '2024-01-15T10:32:00Z',
            status: 'SENT'
        }
    ]

    const defaultProps: MessageListProps = {
        messages: mockMessages,
        currentUser: mockCurrentUser
    }

    test('renders empty state when no messages', () => {
        render(<MessageList messages={[]} currentUser={mockCurrentUser}/>)

        expect(screen.getByText('Brak wiadomości')).toBeInTheDocument()
        expect(screen.getByText('Rozpocznij konwersację wysyłając pierwszą wiadomość')).toBeInTheDocument()
        expect(screen.getByText('💬')).toBeInTheDocument()
    })

    test('renders all messages', () => {
        render(<MessageList {...defaultProps} />)

        expect(screen.getByText('Hello there!')).toBeInTheDocument()
        expect(screen.getByText('Hi! How are you?')).toBeInTheDocument()
        expect(screen.getByText('I am doing great, thanks!')).toBeInTheDocument()
    })

    test('applies correct CSS classes for sent messages', () => {
        render(<MessageList {...defaultProps} />)

        const sentMessage1 = screen.getByText('Hello there!').closest('.message')
        const sentMessage2 = screen.getByText('I am doing great, thanks!').closest('.message')

        expect(sentMessage1).toHaveClass('message', 'sent')
        expect(sentMessage2).toHaveClass('message', 'sent')
    })

    test('applies correct CSS classes for received messages', () => {
        render(<MessageList {...defaultProps} />)

        const receivedMessage = screen.getByText('Hi! How are you?').closest('.message')

        expect(receivedMessage).toHaveClass('message', 'received')
    })

    test('formats message timestamps correctly', () => {
        render(<MessageList {...defaultProps} />)

        const timeElements = screen.getAllByText(/\d{2}:\d{2}/)
        expect(timeElements).toHaveLength(3)

        timeElements.forEach(element => {
            expect(element).toHaveClass('message-time')
            expect(element.textContent).toMatch(/^\d{2}:\d{2}$/)
        })
    })

    test('treats all messages as received when currentUser is null', () => {
        render(<MessageList messages={mockMessages} currentUser={null}/>)

        const messages = screen.getAllByText(/Hello there!|Hi! How are you?|I am doing great, thanks!/)

        messages.forEach(messageText => {
            const messageElement = messageText.closest('.message')
            expect(messageElement).toHaveClass('message', 'received')
        })
    })

    test('handles single message correctly', () => {
        const singleMessage: ChatMessage[] = [mockMessages[0]]

        render(<MessageList messages={singleMessage} currentUser={mockCurrentUser}/>)

        expect(screen.getByText('Hello there!')).toBeInTheDocument()
        expect(screen.getAllByText(/\d{2}:\d{2}/)).toHaveLength(1)
    })

    test('handles messages with special characters', () => {
        const specialMessage: ChatMessage[] = [
            {
                id: 'msg-special',
                senderId: 'user-1',
                senderName: 'John Doe',
                recipientId: 'user-2',
                recipientName: 'Jane Smith',
                content: 'Hello! 😊 How are you? @#$%^&*()',
                createdAt: '2024-01-15T10:30:00Z',
                status: 'SENT'
            }
        ]

        render(<MessageList messages={specialMessage} currentUser={mockCurrentUser}/>)

        expect(screen.getByText('Hello! 😊 How are you? @#$%^&*()')).toBeInTheDocument()
    })

    test('handles very long messages', () => {
        const longMessage: ChatMessage[] = [
            {
                id: 'msg-long',
                senderId: 'user-1',
                senderName: 'John Doe',
                recipientId: 'user-2',
                recipientName: 'Jane Smith',
                content: 'This is a very long message that contains a lot of text to test how the component handles lengthy content without breaking the layout or functionality',
                createdAt: '2024-01-15T10:30:00Z',
                status: 'SENT'
            }
        ]

        render(<MessageList messages={longMessage} currentUser={mockCurrentUser}/>)

        expect(screen.getByText(/This is a very long message/)).toBeInTheDocument()
    })


    test('renders messages in correct order', () => {
        render(<MessageList {...defaultProps} />)

        const messageElements = screen.getAllByText(/Hello there!|Hi! How are you?|I am doing great, thanks!/)

        expect(messageElements[0]).toHaveTextContent('Hello there!')
        expect(messageElements[1]).toHaveTextContent('Hi! How are you?')
        expect(messageElements[2]).toHaveTextContent('I am doing great, thanks!')
    })

    test('handles different user IDs correctly', () => {
        const differentUser: UserProfile = {
            id: 'user-3',
            firstName: 'Alice',
            lastName: 'Johnson',
            email: 'alice@example.com'
        }

        render(<MessageList messages={mockMessages} currentUser={differentUser}/>)

        const messages = screen.getAllByText(/Hello there!|Hi! How are you?|I am doing great, thanks!/)

        messages.forEach(messageText => {
            const messageElement = messageText.closest('.message')
            expect(messageElement).toHaveClass('message', 'received')
        })
    })

    test('renders messages with different statuses', () => {
        const messagesWithDifferentStatuses: ChatMessage[] = [
            {...mockMessages[0], status: 'SENT'},
            {...mockMessages[1], status: 'DELIVERED'},
            {...mockMessages[2], status: 'READ'}
        ]

        render(<MessageList messages={messagesWithDifferentStatuses} currentUser={mockCurrentUser}/>)

        expect(screen.getByText('Hello there!')).toBeInTheDocument()
        expect(screen.getByText('Hi! How are you?')).toBeInTheDocument()
        expect(screen.getByText('I am doing great, thanks!')).toBeInTheDocument()
    })

    test('has correct DOM structure', () => {
        render(<MessageList {...defaultProps} />)

        const chatMessages = document.querySelector('.chat-messages')
        expect(chatMessages).toBeInTheDocument()

        const messages = document.querySelectorAll('.message')
        expect(messages).toHaveLength(3)

        messages.forEach(message => {
            expect(message.querySelector('.message-content')).toBeInTheDocument()
            expect(message.querySelector('.message-meta')).toBeInTheDocument()
            expect(message.querySelector('.message-time')).toBeInTheDocument()
        })
    })

    test('has messages end ref for scrolling', () => {
        const {container} = render(<MessageList {...defaultProps} />)

        const messagesEndDiv = container.querySelector('.chat-messages > div:last-child')
        expect(messagesEndDiv).toBeInTheDocument()
        expect(messagesEndDiv?.textContent).toBe('')
    })

    test('handles invalid date gracefully', () => {
        const invalidDateMessage: ChatMessage[] = [
            {
                id: 'msg-invalid',
                senderId: 'user-1',
                senderName: 'John Doe',
                recipientId: 'user-2',
                recipientName: 'Jane Smith',
                content: 'Test message',
                createdAt: 'invalid-date',
                status: 'SENT'
            }
        ]

        render(<MessageList messages={invalidDateMessage} currentUser={mockCurrentUser}/>)

        expect(screen.getByText('Test message')).toBeInTheDocument()
        const timeElement = screen.getByText(/Invalid Date|NaN/)
        expect(timeElement).toBeInTheDocument()
    })

    test('handles messages from users without currentUser match', () => {
        const messagesFromUnknownUser: ChatMessage[] = [
            {
                id: 'msg-unknown',
                senderId: 'unknown-user',
                senderName: 'Unknown User',
                recipientId: 'user-1',
                recipientName: 'John Doe',
                content: 'Message from unknown user',
                createdAt: '2024-01-15T10:30:00Z',
                status: 'SENT'
            }
        ]

        render(<MessageList messages={messagesFromUnknownUser} currentUser={mockCurrentUser}/>)

        const messageElement = screen.getByText('Message from unknown user').closest('.message')
        expect(messageElement).toHaveClass('message', 'received')
    })

    test('handles currentUser with undefined id', () => {
        const userWithoutId: UserProfile = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com'
        }

        render(<MessageList messages={mockMessages} currentUser={userWithoutId}/>)

        const messages = screen.getAllByText(/Hello there!|Hi! How are you?|I am doing great, thanks!/)

        messages.forEach(messageText => {
            const messageElement = messageText.closest('.message')
            expect(messageElement).toHaveClass('message', 'received')
        })
    })

})