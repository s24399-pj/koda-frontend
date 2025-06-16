import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import * as RR from 'react-router-dom'
import {MemoryRouter, Route, Routes} from 'react-router-dom'
import {login} from '../../../api/authApi'
import LoginPage from '../LoginPage'

vi.mock('../../../hooks/useTitle', () => ({default: vi.fn()}))
vi.mock('../../../api/authApi', () => ({login: vi.fn()}))

const mockSetIsAuthenticated = vi.fn()
vi.mock('../../../context/AuthContext.tsx', () => ({
    useAuth: () => ({setIsAuthenticated: mockSetIsAuthenticated})
}))

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual: typeof RR = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate
    }
})

describe('<LoginPage />', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders the form fields, links, and header', () => {
        render(
            <MemoryRouter>
                <LoginPage/>
            </MemoryRouter>
        )
        expect(screen.getByRole('heading', {name: 'Zaloguj się'})).toBeInTheDocument()
        expect(screen.getByLabelText('Email')).toBeInTheDocument()
        expect(screen.getByLabelText('Hasło')).toBeInTheDocument()
        expect(screen.getByLabelText('Zapamiętaj mnie')).toBeInTheDocument()
        expect(screen.getByRole('link', {name: 'Zapomniałeś hasła?'})).toHaveAttribute(
            'href',
            '/user/reset-password'
        )
        expect(screen.getByRole('button', {name: 'Zaloguj się'})).toBeInTheDocument()
        expect(screen.getByText(/Nie masz jeszcze konta\?/)).toBeInTheDocument()
        expect(screen.getByRole('link', {name: 'Zarejestruj się'})).toHaveAttribute(
            'href',
            '/user/register'
        )
    })

    it('toggles password visibility when button clicked', () => {
        render(
            <MemoryRouter>
                <LoginPage/>
            </MemoryRouter>
        )
        const pwdInput = screen.getByLabelText('Hasło') as HTMLInputElement
        const toggleBtn = screen.getByRole('button', {name: 'Pokaż hasło'})
        expect(pwdInput.type).toBe('password')
        fireEvent.click(toggleBtn)
        expect(pwdInput.type).toBe('text')
        expect(toggleBtn).toHaveAttribute('aria-label', 'Ukryj hasło')
        fireEvent.click(toggleBtn)
        expect(pwdInput.type).toBe('password')
        expect(toggleBtn).toHaveAttribute('aria-label', 'Pokaż hasło')
    })

    it('shows validation errors if fields are empty on submit', async () => {
        render(
            <MemoryRouter>
                <LoginPage/>
            </MemoryRouter>
        )
        fireEvent.click(screen.getByRole('button', {name: 'Zaloguj się'}))
        await waitFor(() => {
            expect(screen.getByText('Email jest wymagany')).toBeInTheDocument()
            expect(screen.getByText('Hasło jest wymagane')).toBeInTheDocument()
        })
    })

    it('displays a successMessage from location.state', () => {
        render(
            <MemoryRouter
                initialEntries={[
                    {
                        pathname: '/login',
                        state: {successMessage: 'Registered successfully!'}
                    }
                ]}
            >
                <Routes>
                    <Route path="/login" element={<LoginPage/>}/>
                </Routes>
            </MemoryRouter>
        )
        expect(screen.getByText('Registered successfully!')).toBeInTheDocument()
    })

    it('calls login and navigates on successful submit', async () => {
        ;(login as vi.Mock).mockResolvedValueOnce({})
        render(
            <MemoryRouter>
                <LoginPage/>
            </MemoryRouter>
        )
        fireEvent.change(screen.getByLabelText('Email'), {
            target: {value: 'user@example.com'}
        })
        fireEvent.change(screen.getByLabelText('Hasło'), {
            target: {value: 'secret'}
        })
        fireEvent.click(screen.getByRole('button', {name: 'Zaloguj się'}))
        await waitFor(() => {
            expect(login).toHaveBeenCalledWith({
                email: 'user@example.com',
                password: 'secret'
            })
            expect(mockSetIsAuthenticated).toHaveBeenCalledWith(true)
            expect(mockNavigate).toHaveBeenCalledWith('/')
        })
    })

    it('shows API error message on failed login', async () => {
        const apiError = {response: {data: {message: 'Invalid credentials'}}}
        ;(login as vi.Mock).mockRejectedValueOnce(apiError)
        render(
            <MemoryRouter>
                <LoginPage/>
            </MemoryRouter>
        )
        fireEvent.change(screen.getByLabelText('Email'), {
            target: {value: 'a@b.com'}
        })
        fireEvent.change(screen.getByLabelText('Hasło'), {
            target: {value: 'pw'}
        })
        fireEvent.click(screen.getByRole('button', {name: 'Zaloguj się'}))
        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
            expect(screen.getByRole('button', {name: 'Zaloguj się'})).not.toBeDisabled()
        })
    })
})
