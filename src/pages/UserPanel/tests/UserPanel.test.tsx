import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import UserPanel from '../UserPanel';
import { UserProfile } from '../../../types/user/UserProfile';

const { mockGetUserProfile, mockLocalStorage, mockCreateObjectURL, mockRevokeObjectURL } =
  vi.hoisted(() => ({
    mockGetUserProfile: vi.fn(),
    mockLocalStorage: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    },
    mockCreateObjectURL: vi.fn(),
    mockRevokeObjectURL: vi.fn(),
  }));

vi.mock('../../../api/useInternalApi', () => ({
  getUserProfile: mockGetUserProfile,
}));

vi.mock('../../../components/UserOffers/UserOffers', () => ({
  default: () => (
    <div data-testid="user-offers">
      <h3>Moje Ogłoszenia</h3>
      <p>Lista ogłoszeń użytkownika</p>
    </div>
  ),
}));

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  },
  writable: true,
});

const mockUserProfile: UserProfile = {
  id: 'user-123',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  profilePictureBase64:
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD//2wBDAAYEBQYFBAcGBQYHBwcHQ==',
};

const mockUserProfileWithoutImage: UserProfile = {
  id: 'user-456',
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@example.com',
  profilePictureBase64: undefined,
};

const renderComponent = () => {
  return render(<UserPanel />);
};

describe('UserPanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserProfile.mockResolvedValue(mockUserProfile);
    mockCreateObjectURL.mockReturnValue('blob:mock-url');
  });

  test('renders loading state initially', () => {
    renderComponent();
    expect(screen.getByText('Ładowanie danych użytkownika...')).toBeInTheDocument();
  });

  test('fetches user profile on mount', async () => {
    renderComponent();

    await waitFor(() => {
      expect(mockGetUserProfile).toHaveBeenCalledTimes(1);
    });
  });

  test('renders user profile after successful fetch', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getAllByText('john.doe@example.com')).toHaveLength(2); // Sidebar and profile section
    });
  });

  test('saves user ID to localStorage after successful fetch', async () => {
    renderComponent();

    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('userId', 'user-123');
    });
  });

  test('sets profile image from user data', async () => {
    renderComponent();

    await waitFor(() => {
      const profileImages = screen.getAllByAltText('Zdjęcie profilowe');
      expect(profileImages[0]).toHaveAttribute('src', mockUserProfile.profilePictureBase64);
    });
  });

  test('uses default avatar when no profile image provided', async () => {
    mockGetUserProfile.mockResolvedValue(mockUserProfileWithoutImage);
    renderComponent();

    await waitFor(() => {
      const profileImages = screen.getAllByAltText('Zdjęcie profilowe');
      expect(profileImages[0].getAttribute('src')).toContain('data:image/svg+xml');
    });
  });

  test('handles API error gracefully', async () => {
    mockGetUserProfile.mockRejectedValue(new Error('API Error'));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Nie udało się pobrać danych użytkownika.')).toBeInTheDocument();
    });
  });

  test('handles profile image loading error', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const profileImage = screen.getAllByAltText('Zdjęcie profilowe')[0];
    fireEvent.error(profileImage);

    // Should fallback to default avatar
    expect(profileImage.getAttribute('src')).toContain('data:image/svg+xml');
  });

  test('renders navigation tabs', async () => {
    renderComponent();

    await waitFor(() => {
      const navigation = screen.getByRole('navigation');
      expect(within(navigation).getByText('Mój Profil')).toBeInTheDocument();
      expect(within(navigation).getByText('Moje Ogłoszenia')).toBeInTheDocument();
      expect(within(navigation).getByText('Ustawienia Konta')).toBeInTheDocument();
    });
  });

  test('starts with profile tab as active', async () => {
    renderComponent();

    await waitFor(() => {
      const navigation = screen.getByRole('navigation');
      const profileTab = within(navigation).getByText('Mój Profil');
      expect(profileTab.closest('li')).toHaveClass('active');
    });
  });

  test('switches to offers tab when clicked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click on the navigation tab in the sidebar
    const navigation = screen.getByRole('navigation');
    const offersTab = within(navigation).getByText('Moje Ogłoszenia');
    fireEvent.click(offersTab);

    await waitFor(() => {
      expect(offersTab.closest('li')).toHaveClass('active');
      expect(screen.getByTestId('user-offers')).toBeInTheDocument();
    });
  });

  test('switches to settings tab when clicked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const navigation = screen.getByRole('navigation');
    const settingsTab = within(navigation).getByText('Ustawienia Konta');
    fireEvent.click(settingsTab);

    await waitFor(() => {
      expect(settingsTab.closest('li')).toHaveClass('active');
      expect(screen.getByText('Ustawienia konta')).toBeInTheDocument();
    });
  });

  test('displays profile section content correctly', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Informacje o profilu')).toBeInTheDocument();
      expect(screen.getByText('Imię:')).toBeInTheDocument();
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Nazwisko:')).toBeInTheDocument();
      expect(screen.getByText('Doe')).toBeInTheDocument();
      expect(screen.getByText('Email:')).toBeInTheDocument();
      // Email appears in both sidebar and profile section
      expect(screen.getAllByText('john.doe@example.com')).toHaveLength(2);
      expect(screen.getByText('Edytuj profil')).toBeInTheDocument();
    });
  });

  test('displays fallback text for missing profile data', async () => {
    const incompleteProfile: UserProfile = {
      id: 'user-789',
      firstName: '',
      lastName: '',
      email: 'test@example.com',
    };
    mockGetUserProfile.mockResolvedValue(incompleteProfile);
    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('Nie ustawiono')).toHaveLength(2); // For firstName and lastName
    });
  });

  test('displays offers section when offers tab is active', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const navigation = screen.getByRole('navigation');
    const offersTab = within(navigation).getByText('Moje Ogłoszenia');
    fireEvent.click(offersTab);

    await waitFor(() => {
      expect(screen.getByTestId('user-offers')).toBeInTheDocument();
      expect(screen.getByText('Lista ogłoszeń użytkownika')).toBeInTheDocument();
    });
  });

  test('renders password change form in settings', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const navigation = screen.getByRole('navigation');
    const settingsTab = within(navigation).getByText('Ustawienia Konta');
    fireEvent.click(settingsTab);

    await waitFor(() => {
      expect(screen.getByLabelText('Obecne hasło')).toBeInTheDocument();
      expect(screen.getByLabelText('Nowe hasło')).toBeInTheDocument();
      expect(screen.getByLabelText('Potwierdź hasło')).toBeInTheDocument();
      expect(screen.getByText('Zmień hasło')).toBeInTheDocument();
    });
  });

  test('renders profile image upload section in settings', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const navigation = screen.getByRole('navigation');
    const settingsTab = within(navigation).getByText('Ustawienia Konta');
    fireEvent.click(settingsTab);

    await waitFor(() => {
      expect(screen.getByAltText('Aktualne zdjęcie profilowe')).toBeInTheDocument();
      expect(screen.getByText('Wybierz nowe zdjęcie')).toBeInTheDocument();
      expect(screen.getByText('Usuń zdjęcie')).toBeInTheDocument();
    });
  });

  test('handles password form submission', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const navigation = screen.getByRole('navigation');
    const settingsTab = within(navigation).getByText('Ustawienia Konta');
    fireEvent.click(settingsTab);

    await waitFor(() => {
      const currentPasswordInput = screen.getByLabelText('Obecne hasło');
      const newPasswordInput = screen.getByLabelText('Nowe hasło');
      const confirmPasswordInput = screen.getByLabelText('Potwierdź hasło');
      const submitButton = screen.getByText('Zmień hasło');

      fireEvent.change(currentPasswordInput, { target: { value: 'oldpassword' } });
      fireEvent.change(newPasswordInput, { target: { value: 'newpassword' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword' } });

      expect(currentPasswordInput).toHaveValue('oldpassword');
      expect(newPasswordInput).toHaveValue('newpassword');
      expect(confirmPasswordInput).toHaveValue('newpassword');

      fireEvent.click(submitButton);
      // Note: No actual API call is implemented in the component yet
    });
  });

  test('handles file upload for profile image', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const navigation = screen.getByRole('navigation');
    const settingsTab = within(navigation).getByText('Ustawienia Konta');
    fireEvent.click(settingsTab);

    await waitFor(() => {
      const fileInput = screen.getByLabelText('Wybierz nowe zdjęcie');
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveAttribute('type', 'file');
      expect(fileInput).toHaveAttribute('accept', 'image/*');
    });

    // Test file selection
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.change(screen.getByLabelText('Wybierz nowe zdjęcie'), {
      target: { files: [file] },
    });

    // Note: File handling logic would need to be implemented in the component
  });

  test('handles edit profile button click', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Edytuj profil');
    fireEvent.click(editButton);

    // Note: Edit functionality would need to be implemented
    expect(editButton).toBeInTheDocument();
  });

  test('handles remove image button click', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const navigation = screen.getByRole('navigation');
    const settingsTab = within(navigation).getByText('Ustawienia Konta');
    fireEvent.click(settingsTab);

    await waitFor(() => {
      const removeButton = screen.getByText('Usuń zdjęcie');
      fireEvent.click(removeButton);

      // Note: Remove image functionality would need to be implemented
      expect(removeButton).toBeInTheDocument();
    });
  });

  test('handles delete account button click', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const navigation = screen.getByRole('navigation');
    const settingsTab = within(navigation).getByText('Ustawienia Konta');
    fireEvent.click(settingsTab);

    await waitFor(() => {
      const deleteButton = screen.getByRole('button', { name: 'Usuń konto' });
      fireEvent.click(deleteButton);

      // Note: Delete account functionality would need to be implemented
      expect(deleteButton).toBeInTheDocument();
    });
  });

  test('maintains tab state when switching between tabs', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const navigation = screen.getByRole('navigation');
    const profileTab = within(navigation).getByText('Mój Profil');
    const offersTab = within(navigation).getByText('Moje Ogłoszenia');
    const settingsTab = within(navigation).getByText('Ustawienia Konta');

    // Start with profile tab
    expect(profileTab.closest('li')).toHaveClass('active');

    // Switch to offers
    fireEvent.click(offersTab);
    expect(offersTab.closest('li')).toHaveClass('active');
    expect(profileTab.closest('li')).not.toHaveClass('active');

    // Switch to settings
    fireEvent.click(settingsTab);
    expect(settingsTab.closest('li')).toHaveClass('active');
    expect(offersTab.closest('li')).not.toHaveClass('active');

    // Switch back to profile
    fireEvent.click(profileTab);
    expect(profileTab.closest('li')).toHaveClass('active');
    expect(settingsTab.closest('li')).not.toHaveClass('active');
  });

  test('displays correct content for each tab', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const navigation = screen.getByRole('navigation');
    const offersTab = within(navigation).getByText('Moje Ogłoszenia');
    const settingsTab = within(navigation).getByText('Ustawienia Konta');
    within(navigation).getByText('Mój Profil');
    expect(screen.getByText('Informacje o profilu')).toBeInTheDocument();
    expect(screen.queryByTestId('user-offers')).not.toBeInTheDocument();
    expect(screen.queryByText('Ustawienia konta')).not.toBeInTheDocument();

    // Switch to offers tab
    fireEvent.click(offersTab);
    await waitFor(() => {
      expect(screen.getByTestId('user-offers')).toBeInTheDocument();
      expect(screen.queryByText('Informacje o profilu')).not.toBeInTheDocument();
      expect(screen.queryByText('Ustawienia konta')).not.toBeInTheDocument();
    });

    // Switch to settings tab
    fireEvent.click(settingsTab);
    await waitFor(() => {
      expect(screen.getByText('Ustawienia konta')).toBeInTheDocument();
      expect(screen.queryByTestId('user-offers')).not.toBeInTheDocument();
      expect(screen.queryByText('Informacje o profilu')).not.toBeInTheDocument();
    });
  });

  test('properly handles component cleanup', async () => {
    const { unmount } = renderComponent();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    unmount();
    expect(mockGetUserProfile).toHaveBeenCalledTimes(1);
  });
});
