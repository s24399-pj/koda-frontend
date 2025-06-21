import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { register } from '../../../api/authApi';
import RegisterPage from '../RegisterPage';

vi.mock('../../../hooks/useTitle', () => ({ default: vi.fn() }));
vi.mock('../../../api/authApi', () => ({ register: vi.fn() }));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = (await vi.importActual('react-router-dom')) as any;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('<RegisterPage />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields, buttons and links', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Zarejestruj się' })).toBeInTheDocument();
    expect(screen.getByLabelText('Imię')).toBeInTheDocument();
    expect(screen.getByLabelText('Nazwisko')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Numer telefonu')).toBeInTheDocument();
    expect(screen.getByLabelText('Hasło')).toBeInTheDocument();
    expect(screen.getByLabelText('Powtórz hasło')).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: /Akceptuję.*politykę prywatności/ })
    ).toBeInTheDocument();
    const submit = screen.getByRole('button', { name: 'Zarejestruj się' });
    expect(submit).toBeEnabled();
    expect(screen.getByText('Masz już konto?')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Zaloguj się' })).toHaveAttribute(
      'href',
      '/user/login'
    );
  });

  it('toggles password and confirm password visibility', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
    const pwd = screen.getByLabelText('Hasło') as HTMLInputElement;
    const cpwd = screen.getByLabelText('Powtórz hasło') as HTMLInputElement;
    const [togglePwd, toggleCpwd] = screen.getAllByRole('button', {
      name: /Pokaż|Ukryj/,
    });

    // initial
    expect(pwd.type).toBe('password');
    fireEvent.click(togglePwd);
    expect(pwd.type).toBe('text');
    fireEvent.click(togglePwd);
    expect(pwd.type).toBe('password');

    expect(cpwd.type).toBe('password');
    fireEvent.click(toggleCpwd);
    expect(cpwd.type).toBe('text');
    fireEvent.click(toggleCpwd);
    expect(cpwd.type).toBe('password');
  });

  it('shows validation errors when submitting empty form', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Zarejestruj się' }));

    await waitFor(() => {
      expect(screen.getByText('Imię jest wymagane')).toBeInTheDocument();
      expect(screen.getByText('Nazwisko jest wymagane')).toBeInTheDocument();
      expect(screen.getByText('Email jest wymagany')).toBeInTheDocument();
      expect(screen.getByText('Numer telefonu jest wymagany')).toBeInTheDocument();
      expect(screen.getByText('Hasło jest wymagane')).toBeInTheDocument();
      expect(screen.getByText('Potwierdzenie hasła jest wymagane')).toBeInTheDocument();
      expect(
        screen.getByText('Musisz zaakceptować regulamin i politykę prywatności')
      ).toBeInTheDocument();
    });
  });

  it('shows password mismatch error', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Imię'), { target: { value: 'A' } });
    fireEvent.change(screen.getByLabelText('Nazwisko'), { target: { value: 'B' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('Numer telefonu'), { target: { value: '123456789' } }); // ← 9 cyfr
    fireEvent.change(screen.getByLabelText('Hasło'), { target: { value: 'pass1' } });
    fireEvent.change(screen.getByLabelText('Powtórz hasło'), { target: { value: 'pass2' } });
    fireEvent.click(screen.getByRole('checkbox', { name: /Akceptuję.*politykę prywatności/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Zarejestruj się' }));

    await waitFor(() => {
      expect(screen.getByText('Hasła nie są identyczne')).toBeInTheDocument();
    });
  });

  it('shows terms error if terms not checked', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText('Imię'), { target: { value: 'A' } });
    fireEvent.change(screen.getByLabelText('Nazwisko'), { target: { value: 'B' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('Numer telefonu'), { target: { value: '123456789' } }); // ← 9 cyfr
    fireEvent.change(screen.getByLabelText('Hasło'), { target: { value: 'pass1234' } }); // ← 8+ znaków
    fireEvent.change(screen.getByLabelText('Powtórz hasło'), { target: { value: 'pass1234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Zarejestruj się' }));

    await waitFor(() => {
      expect(
        screen.getByText('Musisz zaakceptować regulamin i politykę prywatności')
      ).toBeInTheDocument();
    });
  });

  it('calls register and navigates with success state', async () => {
    (register as vi.Mock).mockResolvedValueOnce({});
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Imię'), { target: { value: 'A' } });
    fireEvent.change(screen.getByLabelText('Nazwisko'), { target: { value: 'B' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('Numer telefonu'), { target: { value: '123456789' } }); // ← 9 cyfr!
    fireEvent.change(screen.getByLabelText('Hasło'), { target: { value: 'pass1234' } });
    fireEvent.change(screen.getByLabelText('Powtórz hasło'), { target: { value: 'pass1234' } });
    fireEvent.click(screen.getByRole('checkbox', { name: /Akceptuję.*politykę prywatności/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Zarejestruj się' }));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith({
        email: 'a@b.com',
        password: 'pass1234',
        phoneNumber: '123456789', // ← Dodaj phoneNumber!
        firstName: 'A',
        lastName: 'B',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/user/login', {
        state: {
          successMessage: 'Konto zostało utworzone pomyślnie. Możesz się teraz zalogować.',
        },
      });
    });
  });

  it('displays API error on failed registration', async () => {
    const apiError = { response: { data: { message: 'Email already in use' } } };
    (register as vi.Mock).mockRejectedValueOnce(apiError);
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Imię'), { target: { value: 'A' } });
    fireEvent.change(screen.getByLabelText('Nazwisko'), { target: { value: 'B' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('Numer telefonu'), { target: { value: '123456789' } }); // ← 9 cyfr!
    fireEvent.change(screen.getByLabelText('Hasło'), { target: { value: 'pass1234' } });
    fireEvent.change(screen.getByLabelText('Powtórz hasło'), { target: { value: 'pass1234' } });
    fireEvent.click(screen.getByRole('checkbox', { name: /Akceptuję.*politykę prywatności/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Zarejestruj się' }));

    await waitFor(() => {
      expect(screen.getByText('Email already in use')).toBeInTheDocument();
    });
  });
});
