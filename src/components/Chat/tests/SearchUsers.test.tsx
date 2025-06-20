import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import SearchUsers from '../SearchUsers';
import { UserMiniDto } from '../../../types/user/UserMiniDto';
import { SearchUsersProps } from '../../../types/chat/SearchUsersProps';

vi.mock('../../../assets/defaultProfilePicture.ts', () => ({
  DEFAULT_PROFILE_IMAGE: 'data:image/svg+xml;base64,default-image',
}));

describe('SearchUsers', () => {
  const mockOnSearchQueryChange = vi.fn();
  const mockOnSearch = vi.fn();
  const mockOnSelectUser = vi.fn();
  const mockOnCancel = vi.fn();

  const mockSearchResults: UserMiniDto[] = [
    {
      id: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
    },
    {
      id: 'user-2',
      firstName: 'Jane',
      lastName: 'Smith',
      fullName: 'Jane Smith',
    },
    {
      id: 'user-3',
      firstName: 'Bob',
      lastName: 'Wilson',
      fullName: 'Bob Wilson',
    },
  ];

  const defaultProps: SearchUsersProps = {
    searchQuery: '',
    onSearchQueryChange: mockOnSearchQueryChange,
    onSearch: mockOnSearch,
    searchResults: [],
    onSelectUser: mockOnSelectUser,
    onCancel: mockOnCancel,
    isSearching: false,
    activeUserId: undefined,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders search input and button', () => {
    render(<SearchUsers {...defaultProps} />);

    expect(screen.getByPlaceholderText('Szukaj użytkowników...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Szukaj użytkowników' })).toBeInTheDocument();
  });

  test('displays search query value in input', () => {
    render(<SearchUsers {...defaultProps} searchQuery="john" />);

    const input = screen.getByPlaceholderText('Szukaj użytkowników...');
    expect(input).toHaveValue('john');
  });

  test('calls onSearchQueryChange when typing in input', async () => {
    const user = userEvent.setup();
    render(<SearchUsers {...defaultProps} />);

    const input = screen.getByPlaceholderText('Szukaj użytkowników...');
    await user.type(input, 'john');

    expect(mockOnSearchQueryChange).toHaveBeenCalledWith('j');
    expect(mockOnSearchQueryChange).toHaveBeenCalledWith('o');
    expect(mockOnSearchQueryChange).toHaveBeenCalledWith('h');
    expect(mockOnSearchQueryChange).toHaveBeenCalledWith('n');
  });

  test('disables search button when query is empty', () => {
    render(<SearchUsers {...defaultProps} searchQuery="" />);

    const searchButton = screen.getByRole('button', { name: 'Szukaj użytkowników' });
    expect(searchButton).toBeDisabled();
  });

  test('disables search button when query is only whitespace', () => {
    render(<SearchUsers {...defaultProps} searchQuery="   " />);

    const searchButton = screen.getByRole('button', { name: 'Szukaj użytkowników' });
    expect(searchButton).toBeDisabled();
  });

  test('enables search button when query has content', () => {
    render(<SearchUsers {...defaultProps} searchQuery="john" />);

    const searchButton = screen.getByRole('button', { name: 'Szukaj użytkowników' });
    expect(searchButton).not.toBeDisabled();
  });

  test('calls onSearch when search button is clicked', async () => {
    const user = userEvent.setup();
    render(<SearchUsers {...defaultProps} searchQuery="john" />);

    const searchButton = screen.getByRole('button', { name: 'Szukaj użytkowników' });
    await user.click(searchButton);

    expect(mockOnSearch).toHaveBeenCalledTimes(1);
  });

  test('calls onSearch when Enter key is pressed', async () => {
    const user = userEvent.setup();
    render(<SearchUsers {...defaultProps} searchQuery="john" />);

    const input = screen.getByPlaceholderText('Szukaj użytkowników...');
    await user.click(input);
    await user.keyboard('{Enter}');

    expect(mockOnSearch).toHaveBeenCalledTimes(1);
  });

  test('does not call onSearch when Enter is pressed with empty query', async () => {
    const user = userEvent.setup();
    render(<SearchUsers {...defaultProps} searchQuery="" />);

    const input = screen.getByPlaceholderText('Szukaj użytkowników...');
    await user.click(input);
    await user.keyboard('{Enter}');

    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  test('calls onCancel when Escape key is pressed', async () => {
    const user = userEvent.setup();
    render(<SearchUsers {...defaultProps} searchQuery="john" />);

    const input = screen.getByPlaceholderText('Szukaj użytkowników...');
    await user.click(input);
    await user.keyboard('{Escape}');

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  test('does not show search results when isSearching is false', () => {
    render(<SearchUsers {...defaultProps} isSearching={false} />);

    expect(screen.queryByText(/Wyniki dla/)).not.toBeInTheDocument();
  });

  test('shows search results when isSearching is true', () => {
    render(<SearchUsers {...defaultProps} isSearching={true} searchQuery="john" />);

    expect(screen.getByText('Wyniki dla "john"')).toBeInTheDocument();
  });

  test('displays close button in search results header', () => {
    render(<SearchUsers {...defaultProps} isSearching={true} searchQuery="john" />);

    const closeButton = screen.getByText('✕');
    expect(closeButton).toBeInTheDocument();
  });

  test('calls onCancel when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<SearchUsers {...defaultProps} isSearching={true} searchQuery="john" />);

    const closeButton = screen.getByText('✕');
    await user.click(closeButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  test('displays search results when available', () => {
    render(<SearchUsers {...defaultProps} isSearching={true} searchResults={mockSearchResults} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
  });

  test('shows no results message when search results are empty', () => {
    render(
      <SearchUsers {...defaultProps} isSearching={true} searchQuery="xyz" searchResults={[]} />
    );

    expect(screen.getByText('Brak wyników')).toBeInTheDocument();
    expect(screen.getByText('Nie znaleziono użytkowników dla "xyz"')).toBeInTheDocument();
    expect(screen.getByText('🔍')).toBeInTheDocument();
  });

  test('calls onSelectUser when user item is clicked', async () => {
    const user = userEvent.setup();
    render(<SearchUsers {...defaultProps} isSearching={true} searchResults={mockSearchResults} />);

    const userItem = screen.getByText('John Doe');
    await user.click(userItem);

    expect(mockOnSelectUser).toHaveBeenCalledWith('user-1');
  });

  test('highlights active user', () => {
    render(
      <SearchUsers
        {...defaultProps}
        isSearching={true}
        searchResults={mockSearchResults}
        activeUserId="user-2"
      />
    );

    const activeUserItem = screen.getByText('Jane Smith').closest('li');
    expect(activeUserItem).toHaveClass('active-user');

    const inactiveUserItem = screen.getByText('John Doe').closest('li');
    expect(inactiveUserItem).not.toHaveClass('active-user');
  });

  test('shows active indicator for active user', () => {
    render(
      <SearchUsers
        {...defaultProps}
        isSearching={true}
        searchResults={mockSearchResults}
        activeUserId="user-2"
      />
    );

    expect(screen.getByText('Aktywna rozmowa')).toBeInTheDocument();
  });

  test('does not show active indicator for inactive users', () => {
    render(
      <SearchUsers
        {...defaultProps}
        isSearching={true}
        searchResults={mockSearchResults}
        activeUserId="user-2"
      />
    );

    const activeIndicators = screen.getAllByText('Aktywna rozmowa');
    expect(activeIndicators).toHaveLength(1);
  });

  test('displays user avatars with default image', () => {
    render(<SearchUsers {...defaultProps} isSearching={true} searchResults={mockSearchResults} />);

    const avatars = screen.getAllByRole('img');
    expect(avatars).toHaveLength(3);

    avatars.forEach(avatar => {
      expect(avatar).toHaveAttribute('src', 'data:image/svg+xml;base64,default-image');
    });
  });

  test('sets correct alt text for user avatars', () => {
    render(<SearchUsers {...defaultProps} isSearching={true} searchResults={mockSearchResults} />);

    expect(screen.getByAltText('John Doe')).toBeInTheDocument();
    expect(screen.getByAltText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByAltText('Bob Wilson')).toBeInTheDocument();
  });

  test('handles image error by setting default image', () => {
    render(<SearchUsers {...defaultProps} isSearching={true} searchResults={mockSearchResults} />);

    const avatar = screen.getByAltText('John Doe');
    fireEvent.error(avatar);

    expect(avatar).toHaveAttribute('src', 'data:image/svg+xml;base64,default-image');
  });

  test('shows back button in search results', () => {
    render(<SearchUsers {...defaultProps} isSearching={true} />);

    expect(screen.getByText('← Powrót do konwersacji')).toBeInTheDocument();
  });

  test('calls onCancel when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<SearchUsers {...defaultProps} isSearching={true} />);

    const backButton = screen.getByText('← Powrót do konwersacji');
    await user.click(backButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  test('does not call onSelectUser when user has no id', async () => {
    const userWithoutId: UserMiniDto = {
      id: '',
      firstName: 'No',
      lastName: 'Id',
      fullName: 'No Id',
    };

    const user = userEvent.setup();
    render(<SearchUsers {...defaultProps} isSearching={true} searchResults={[userWithoutId]} />);

    const userItem = screen.getByText('No Id');
    await user.click(userItem);

    expect(mockOnSelectUser).not.toHaveBeenCalled();
  });

  test('handles search query with special characters', () => {
    render(<SearchUsers {...defaultProps} searchQuery="john@example.com" isSearching={true} />);

    expect(screen.getByText('Wyniki dla "john@example.com"')).toBeInTheDocument();
  });

  test('displays correct structure for search results', () => {
    render(<SearchUsers {...defaultProps} isSearching={true} searchResults={mockSearchResults} />);

    const searchResults = document.querySelector('.search-results');
    expect(searchResults).toBeInTheDocument();

    const searchHeader = document.querySelector('.search-header');
    expect(searchHeader).toBeInTheDocument();

    const userList = document.querySelector('ul');
    expect(userList).toBeInTheDocument();

    const userAvatars = document.querySelectorAll('.user-avatar');
    expect(userAvatars).toHaveLength(3);

    const userInfos = document.querySelectorAll('.user-info');
    expect(userInfos).toHaveLength(3);
  });

  test('has correct accessibility attributes', () => {
    render(<SearchUsers {...defaultProps} />);

    const searchButton = screen.getByRole('button', { name: 'Szukaj użytkowników' });
    expect(searchButton).toHaveAttribute('aria-label', 'Szukaj użytkowników');
    expect(searchButton).toHaveAttribute('title', 'Szukaj użytkowników');
  });

  test('handles rapid keyboard interactions', async () => {
    const user = userEvent.setup();
    render(<SearchUsers {...defaultProps} searchQuery="john" />);

    const input = screen.getByPlaceholderText('Szukaj użytkowników...');
    await user.click(input);

    await user.keyboard('{Enter}');
    await user.keyboard('{Escape}');
    await user.keyboard('{Enter}');

    expect(mockOnSearch).toHaveBeenCalledTimes(2);
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  test('renders SVG search icon correctly', () => {
    render(<SearchUsers {...defaultProps} />);

    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svg).toHaveAttribute('stroke', 'currentColor');
  });

  test('handles empty fullName gracefully', () => {
    const userWithEmptyName: UserMiniDto = {
      id: 'user-empty',
      firstName: '',
      lastName: '',
      fullName: '',
    };

    render(
      <SearchUsers {...defaultProps} isSearching={true} searchResults={[userWithEmptyName]} />
    );

    const userInfo = document.querySelector('.user-name');
    expect(userInfo).toHaveTextContent('');
  });

  test('shows multiple active indicators only for active user', () => {
    const multipleUsers: UserMiniDto[] = [
      ...mockSearchResults,
      { id: 'user-4', firstName: 'Alice', lastName: 'Johnson', fullName: 'Alice Johnson' },
    ];

    render(
      <SearchUsers
        {...defaultProps}
        isSearching={true}
        searchResults={multipleUsers}
        activeUserId="user-2"
      />
    );

    const activeIndicators = screen.getAllByText('Aktywna rozmowa');
    expect(activeIndicators).toHaveLength(1);

    const activeItems = document.querySelectorAll('.active-user');
    expect(activeItems).toHaveLength(1);
  });
});
