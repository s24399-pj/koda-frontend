import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import MessageInput from '../MessageInput'
import { MessageInputProps } from '../../../types/chat/MessageInputProps'

describe('MessageInput', () => {
    const mockOnSendMessage = vi.fn()

    const defaultProps: MessageInputProps = {
        onSendMessage: mockOnSendMessage,
        isConnected: true
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    test('renders message input form', () => {
        render(<MessageInput {...defaultProps} />)

        expect(screen.getByRole('textbox')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /wyślij wiadomość/i })).toBeInTheDocument()
    })

    test('displays correct placeholder when connected', () => {
        render(<MessageInput {...defaultProps} />)

        expect(screen.getByPlaceholderText('Napisz wiadomość...')).toBeInTheDocument()
    })

    test('displays connection placeholder when disconnected', () => {
        render(<MessageInput {...defaultProps} isConnected={false} />)

        expect(screen.getByPlaceholderText('Łączenie z serwerem...')).toBeInTheDocument()
    })

    test('disables input when disconnected', () => {
        render(<MessageInput {...defaultProps} isConnected={false} />)

        const input = screen.getByRole('textbox')
        expect(input).toBeDisabled()
    })

    test('shows connection warning when disconnected', () => {
        render(<MessageInput {...defaultProps} isConnected={false} />)

        expect(screen.getByText('Brak połączenia z serwerem')).toBeInTheDocument()
        expect(screen.getByText('⚠️')).toBeInTheDocument()
    })

    test('hides connection warning when connected', () => {
        render(<MessageInput {...defaultProps} isConnected={true} />)

        expect(screen.queryByText('Brak połączenia z serwerem')).not.toBeInTheDocument()
    })

    test('updates input value when typing', async () => {
        const user = userEvent.setup()
        render(<MessageInput {...defaultProps} />)

        const input = screen.getByRole('textbox')
        await user.type(input, 'Hello world')

        expect(input).toHaveValue('Hello world')
    })

    test('disables submit button when input is empty', () => {
        render(<MessageInput {...defaultProps} />)

        const submitButton = screen.getByRole('button', { name: /wyślij wiadomość/i })
        expect(submitButton).toBeDisabled()
    })

    test('enables submit button when input has text', async () => {
        const user = userEvent.setup()
        render(<MessageInput {...defaultProps} />)

        const input = screen.getByRole('textbox')
        const submitButton = screen.getByRole('button', { name: /wyślij wiadomość/i })

        await user.type(input, 'Test message')

        expect(submitButton).not.toBeDisabled()
    })

    test('disables submit button when only whitespace', async () => {
        const user = userEvent.setup()
        render(<MessageInput {...defaultProps} />)

        const input = screen.getByRole('textbox')
        const submitButton = screen.getByRole('button', { name: /wyślij wiadomość/i })

        await user.type(input, '   ')

        expect(submitButton).toBeDisabled()
    })

    test('calls onSendMessage when form is submitted', async () => {
        const user = userEvent.setup()
        render(<MessageInput {...defaultProps} />)

        const input = screen.getByRole('textbox')
        const form = screen.getByRole('textbox').closest('form')!

        await user.type(input, 'Test message')
        fireEvent.submit(form)

        expect(mockOnSendMessage).toHaveBeenCalledWith('Test message')
    })

    test('calls onSendMessage when submit button is clicked', async () => {
        const user = userEvent.setup()
        render(<MessageInput {...defaultProps} />)

        const input = screen.getByRole('textbox')
        const submitButton = screen.getByRole('button', { name: /wyślij wiadomość/i })

        await user.type(input, 'Test message')
        await user.click(submitButton)

        expect(mockOnSendMessage).toHaveBeenCalledWith('Test message')
    })

    test('calls onSendMessage when Enter key is pressed', async () => {
        const user = userEvent.setup()
        render(<MessageInput {...defaultProps} />)

        const input = screen.getByRole('textbox')

        await user.type(input, 'Test message')
        await user.keyboard('{Enter}')

        expect(mockOnSendMessage).toHaveBeenCalledWith('Test message')
    })


    test('trims whitespace before sending', async () => {
        const user = userEvent.setup()
        render(<MessageInput {...defaultProps} />)

        const input = screen.getByRole('textbox')
        const form = screen.getByRole('textbox').closest('form')!

        await user.type(input, '  Test message  ')
        fireEvent.submit(form)

        expect(mockOnSendMessage).toHaveBeenCalledWith('Test message')
    })

    test('clears input after successful send', async () => {
        const user = userEvent.setup()
        render(<MessageInput {...defaultProps} />)

        const input = screen.getByRole('textbox')
        const form = screen.getByRole('textbox').closest('form')!

        await user.type(input, 'Test message')
        fireEvent.submit(form)

        await waitFor(() => {
            expect(input).toHaveValue('')
        })
    })

    test('shows sending state during message send', async () => {
        let resolvePromise: () => void
        const slowSendMessage = vi.fn(() => new Promise<void>(resolve => {
            resolvePromise = resolve
        }))

        const user = userEvent.setup()
        render(<MessageInput onSendMessage={slowSendMessage} isConnected={true} />)

        const input = screen.getByRole('textbox')
        const form = screen.getByRole('textbox').closest('form')!

        await user.type(input, 'Test message')
        fireEvent.submit(form)

        expect(screen.getByText('⟳')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /wysyłanie/i })).toBeInTheDocument()

        resolvePromise!()

        await waitFor(() => {
            expect(screen.queryByText('⟳')).not.toBeInTheDocument()
        })
    })

    test('does not send empty message after trimming', async () => {
        const user = userEvent.setup()
        render(<MessageInput {...defaultProps} />)

        const input = screen.getByRole('textbox')
        const form = screen.getByRole('textbox').closest('form')!

        await user.type(input, '   ')
        fireEvent.submit(form)

        expect(mockOnSendMessage).not.toHaveBeenCalled()
    })

    test('does not send when disconnected', async () => {
        const user = userEvent.setup()
        render(<MessageInput {...defaultProps} isConnected={false} />)

        const input = screen.getByRole('textbox')

        await user.type(input, 'Test message')
        fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' })

        expect(mockOnSendMessage).not.toHaveBeenCalled()
    })

    test('focuses input when connected', () => {
        render(<MessageInput {...defaultProps} isConnected={true} />)

        const input = screen.getByRole('textbox')
        expect(input).toHaveFocus()
    })

    test('focuses input after successful send', async () => {
        const user = userEvent.setup()
        render(<MessageInput {...defaultProps} />)

        const input = screen.getByRole('textbox')
        const form = screen.getByRole('textbox').closest('form')!

        await user.type(input, 'Test message')
        input.blur()
        fireEvent.submit(form)

        await waitFor(() => {
            expect(input).toHaveFocus()
        })
    })

    test('handles send error gracefully', async () => {
        const errorSendMessage = vi.fn().mockRejectedValue(new Error('Send failed'))

        const user = userEvent.setup()
        render(<MessageInput onSendMessage={errorSendMessage} isConnected={true} />)

        const input = screen.getByRole('textbox')
        const form = screen.getByRole('textbox').closest('form')!

        await user.type(input, 'Test message')
        fireEvent.submit(form)

        await waitFor(() => {
            expect(input).toHaveValue('Test message')
        })

        expect(screen.queryByText('⟳')).not.toBeInTheDocument()
    })

    test('respects maxLength attribute', () => {
        render(<MessageInput {...defaultProps} />)

        const input = screen.getByRole('textbox')
        expect(input).toHaveAttribute('maxLength', '1000')
    })

    test('has correct accessibility attributes', () => {
        render(<MessageInput {...defaultProps} />)

        const input = screen.getByRole('textbox')
        const submitButton = screen.getByRole('button')

        expect(input).toHaveAttribute('aria-label', 'Napisz wiadomość')
        expect(submitButton).toHaveAttribute('aria-label', 'Wyślij wiadomość')
        expect(submitButton).toHaveAttribute('title', 'Wyślij wiadomość')
    })

    test('has autoComplete off', () => {
        render(<MessageInput {...defaultProps} />)

        const input = screen.getByRole('textbox')
        expect(input).toHaveAttribute('autoComplete', 'off')
    })

    test('prevents multiple submissions during sending', async () => {
        let resolvePromise: () => void
        const slowSendMessage = vi.fn(() => new Promise<void>(resolve => {
            resolvePromise = resolve
        }))

        const user = userEvent.setup()
        render(<MessageInput onSendMessage={slowSendMessage} isConnected={true} />)

        const input = screen.getByRole('textbox')
        const form = screen.getByRole('textbox').closest('form')!

        await user.type(input, 'Test message')

        fireEvent.submit(form)
        fireEvent.submit(form)
        fireEvent.submit(form)

        expect(slowSendMessage).toHaveBeenCalledTimes(1)

        resolvePromise!()
    })

    test('handles rapid Enter key presses', async () => {
        const user = userEvent.setup()
        render(<MessageInput {...defaultProps} />)

        const input = screen.getByRole('textbox')

        await user.type(input, 'Test message')
        await user.keyboard('{Enter}')
        await user.keyboard('{Enter}')
        await user.keyboard('{Enter}')

        expect(mockOnSendMessage).toHaveBeenCalledTimes(1)
    })
})