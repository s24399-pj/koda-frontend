import {fireEvent, render, screen} from '@testing-library/react'
import {describe, expect, test, vi} from 'vitest'
import ChatHeader from '../ChatHeader'
import {UserProfile} from '../../../types/user/UserProfile'

vi.mock('../../../assets/defaultProfilePicture.ts', () => ({
    DEFAULT_PROFILE_IMAGE: 'data:image/svg+xml;base64,default-image'
}))

describe('ChatHeader', () => {
    const mockRecipientWithImage: UserProfile = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        profilePictureBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ'
    }

    const mockRecipientWithoutImage: UserProfile = {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com'
    }

    test('renders chat header with recipient information', () => {
        render(<ChatHeader recipient={mockRecipientWithImage}/>)

        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByRole('img')).toBeInTheDocument()
    })

    test('displays recipient full name correctly', () => {
        render(<ChatHeader recipient={mockRecipientWithImage}/>)

        const fullName = screen.getByRole('heading', {level: 3})
        expect(fullName).toHaveTextContent('John Doe')
    })

    test('displays profile picture when profilePictureBase64 is provided', () => {
        render(<ChatHeader recipient={mockRecipientWithImage}/>)

        const avatar = screen.getByRole('img')
        expect(avatar).toHaveAttribute('src', mockRecipientWithImage.profilePictureBase64)
        expect(avatar).toHaveAttribute('alt', 'John Doe')
    })

    test('displays default profile picture when profilePictureBase64 is null', () => {
        render(<ChatHeader recipient={mockRecipientWithoutImage}/>)

        const avatar = screen.getByRole('img')
        expect(avatar).toHaveAttribute('src', 'data:image/svg+xml;base64,default-image')
        expect(avatar).toHaveAttribute('alt', 'Jane Smith')
    })

    test('displays default profile picture when profilePictureBase64 is undefined', () => {
        const recipientUndefinedImage: UserProfile = {
            ...mockRecipientWithoutImage,
            profilePictureBase64: undefined
        }

        render(<ChatHeader recipient={recipientUndefinedImage}/>)

        const avatar = screen.getByRole('img')
        expect(avatar).toHaveAttribute('src', 'data:image/svg+xml;base64,default-image')
    })

    test('falls back to default image on image load error', () => {
        render(<ChatHeader recipient={mockRecipientWithImage}/>)

        const avatar = screen.getByRole('img')

        expect(avatar).toHaveAttribute('src', mockRecipientWithImage.profilePictureBase64)

        fireEvent.error(avatar)

        expect(avatar).toHaveAttribute('src', 'data:image/svg+xml;base64,default-image')
    })

    test('sets correct alt text for accessibility', () => {
        render(<ChatHeader recipient={mockRecipientWithImage}/>)

        const avatar = screen.getByRole('img')
        expect(avatar).toHaveAttribute('alt', 'John Doe')
    })

    test('renders correct HTML structure', () => {
        render(<ChatHeader recipient={mockRecipientWithImage}/>)

        const chatHeader = screen.getByRole('img').closest('.chat-header')
        expect(chatHeader).toBeInTheDocument()

        const recipientInfo = chatHeader?.querySelector('.recipient-info')
        expect(recipientInfo).toBeInTheDocument()

        const recipientAvatar = recipientInfo?.querySelector('.recipient-avatar')
        expect(recipientAvatar).toBeInTheDocument()

        const recipientDetails = recipientInfo?.querySelector('.recipient-details')
        expect(recipientDetails).toBeInTheDocument()
    })

    test('handles special characters in names', () => {
        const recipientWithSpecialChars: UserProfile = {
            id: '3',
            firstName: 'José',
            lastName: "O'Connor",
            email: 'jose.oconnor@example.com',
            profilePictureBase64: undefined
        }

        render(<ChatHeader recipient={recipientWithSpecialChars}/>)

        expect(screen.getByRole('heading', {level: 3})).toHaveTextContent("José O'Connor")

        const avatar = screen.getByRole('img')
        expect(avatar).toHaveAttribute('alt', "José O'Connor")
    })

    test('handles empty first or last name gracefully', () => {
        const recipientEmptyLastName: UserProfile = {
            id: '4',
            firstName: 'Madonna',
            lastName: '',
            email: 'madonna@example.com',
            profilePictureBase64: undefined
        }

        render(<ChatHeader recipient={recipientEmptyLastName}/>)

        expect(screen.getByRole('heading', {level: 3})).toHaveTextContent('Madonna')
    })

    test('handles very long names', () => {
        const recipientLongName: UserProfile = {
            id: '5',
            firstName: 'Bartholomew',
            lastName: 'Aloysius-Devereaux-Plantagenet-Montague',
            email: 'long.name@example.com',
            profilePictureBase64: undefined
        }

        render(<ChatHeader recipient={recipientLongName}/>)

        expect(screen.getByRole('heading', {level: 3})).toHaveTextContent('Bartholomew Aloysius-Devereaux-Plantagenet-Montague')
    })

    test('multiple error events on same image element', () => {
        render(<ChatHeader recipient={mockRecipientWithImage}/>)

        const avatar = screen.getByRole('img')

        fireEvent.error(avatar)
        expect(avatar).toHaveAttribute('src', 'data:image/svg+xml;base64,default-image')

        fireEvent.error(avatar)
        expect(avatar).toHaveAttribute('src', 'data:image/svg+xml;base64,default-image')
    })
})
