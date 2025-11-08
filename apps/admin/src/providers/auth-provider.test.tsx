import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

import { AuthProvider, useAuth } from './auth-provider';

const TestConsumer: React.FC = () => {
  const { login, logout, user, isAuthenticated, loginError } = useAuth();

  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'yes' : 'no'}</span>
      <span data-testid="auth-email">{user?.email ?? ''}</span>
      <span data-testid="auth-error">{loginError ?? ''}</span>
      <button
        type="button"
        onClick={() => {
          void login({ email: 'admin@example.com', password: 'secret' }).catch(() => undefined);
        }}
      >
        login
      </button>
      <button
        type="button"
        onClick={() => {
          void logout().catch(() => undefined);
        }}
      >
        logout
      </button>
    </div>
  );
};

const renderWithProvider = () =>
  render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>,
  );

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    (globalThis.fetch as unknown) = vi.fn();
    window.localStorage.clear();
  });

  it('stores user session after successful login and clears on logout', async () => {
    const mockFetch = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    mockFetch
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            accessToken: 'token-123',
            refreshToken: 'refresh-456',
            user: {
              id: 'u1',
              email: 'admin@example.com',
              displayName: 'Admin',
              role: 'ADMIN',
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    renderWithProvider();

    expect(screen.getByTestId('auth-status').textContent).toBe('no');

    await userEvent.click(screen.getByText('login'));

    expect(mockFetch).toHaveBeenCalledTimes(1);

    await screen.findByTestId('auth-email');
    expect(screen.getByTestId('auth-status').textContent).toBe('yes');
    expect(screen.getByTestId('auth-email').textContent).toBe('admin@example.com');

    const stored = window.localStorage.getItem('tb-group-admin-auth');
    expect(stored).toContain('token-123');

    await userEvent.click(screen.getByText('logout'));
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('auth-status').textContent).toBe('no');
    expect(window.localStorage.getItem('tb-group-admin-auth')).toBeNull();
  });

  it('exposes login error when credentials are invalid', async () => {
    const mockFetch = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    renderWithProvider();

    await userEvent.click(screen.getByText('login'));

    expect(await screen.findByTestId('auth-error')).toHaveTextContent('Invalid credentials');
    expect(screen.getByTestId('auth-status').textContent).toBe('no');
  });
});
