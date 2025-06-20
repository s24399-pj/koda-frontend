import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AuthRequired from '../AuthRequired';

describe(`<AuthRequired />`, () => {
  it('renders default title, message and links with correct redirect', () => {
    render(
      <MemoryRouter initialEntries={['/protected/path']}>
        <Routes>
          <Route path="*" element={<AuthRequired />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Wymagane logowanie' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: 'Zaloguj się' })).toHaveLength(1);

    expect(screen.getByText('Zaloguj się, aby skorzystać z tej funkcji.')).toBeInTheDocument();

    const loginLink = screen.getByRole('link', { name: 'Zaloguj się' });
    expect(loginLink).toHaveAttribute(
      'href',
      `/user/login?redirect=${encodeURIComponent('/protected/path')}`
    );

    const registerLink = screen.getByRole('link', { name: 'Zarejestruj się' });
    expect(registerLink).toHaveAttribute('href', '/user/register');

    const backLink = screen.getByRole('link', { name: 'Wróć na stronę główną' });
    expect(backLink).toHaveAttribute('href', '/');
  });

  it('honors custom pageTitle and message props', () => {
    render(
      <MemoryRouter initialEntries={['/foo']}>
        <Routes>
          <Route
            path="*"
            element={
              <AuthRequired
                pageTitle="Dostęp zabroniony"
                message="Musisz być zalogowany, by wejść"
              />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Dostęp zabroniony' })).toBeInTheDocument();
    expect(screen.getByText('Musisz być zalogowany, by wejść')).toBeInTheDocument();
  });
});
