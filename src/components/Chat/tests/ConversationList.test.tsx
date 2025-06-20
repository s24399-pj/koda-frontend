import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import ConversationList from '../ConversationList';
import { Conversation } from '../../../types/chat/Conversation';

vi.mock('../../../assets/defaultProfilePicture.ts', () => ({
  DEFAULT_PROFILE_IMAGE: 'data:image/svg+xml;base64,default-image',
}));

describe('ConversationList', () => {
  const mockOnSelectConversation = vi.fn();

  const mockConversations: Conversation[] = [
    {
      userId: '1',
      userName: 'John Doe',
      profilePicture: 'data:image/jpeg;base64,john-photo',
      lastMessage: 'Hello there!',
      lastMessageDate: new Date().toISOString(),
    },
    {
      userId: '2',
      userName: 'Jane Smith',
      profilePicture: 'data:image/jpeg;base64,jane-photo',
      lastMessage: 'How are you doing?',
      lastMessageDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    },
    {
      userId: '3',
      userName: 'Bob Wilson',
      lastMessage: 'See you tomorrow',
      lastMessageDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders conversation list with title', () => {
    render(
      <ConversationList
        conversations={mockConversations}
        activeRecipientId={null}
        onSelectConversation={mockOnSelectConversation}
      />
    );

    expect(screen.getByText('Wiadomości')).toBeInTheDocument();
  });

  test('renders all conversations', () => {
    render(
      <ConversationList
        conversations={mockConversations}
        activeRecipientId={null}
        onSelectConversation={mockOnSelectConversation}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
  });

  test('displays conversation messages', () => {
    render(
      <ConversationList
        conversations={mockConversations}
        activeRecipientId={null}
        onSelectConversation={mockOnSelectConversation}
      />
    );

    expect(screen.getByText('Hello there!')).toBeInTheDocument();
    expect(screen.getByText('How are you doing?')).toBeInTheDocument();
    expect(screen.getByText('See you tomorrow')).toBeInTheDocument();
  });

  test('displays default message when no last message', () => {
    const conversationsWithoutMessage: Conversation[] = [
      {
        userId: '1',
        userName: 'John Doe',
      },
    ];

    render(
      <ConversationList
        conversations={conversationsWithoutMessage}
        activeRecipientId={null}
        onSelectConversation={mockOnSelectConversation}
      />
    );

    expect(screen.getByText('Rozpocznij konwersację')).toBeInTheDocument();
  });

  test('sorts conversations by last message date (newest first)', () => {
    render(
      <ConversationList
        conversations={mockConversations}
        activeRecipientId={null}
        onSelectConversation={mockOnSelectConversation}
      />
    );

    const conversationItems = screen.getAllByRole('button');
    expect(conversationItems[0]).toHaveTextContent('John Doe');
    expect(conversationItems[1]).toHaveTextContent('Jane Smith');
    expect(conversationItems[2]).toHaveTextContent('Bob Wilson');
  });

  test('calls onSelectConversation when conversation is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ConversationList
        conversations={mockConversations}
        activeRecipientId={null}
        onSelectConversation={mockOnSelectConversation}
      />
    );

    const firstConversation = screen.getByText('John Doe').closest('[role="button"]');
    await user.click(firstConversation!);

    expect(mockOnSelectConversation).toHaveBeenCalledWith('1');
  });

  test('handles keyboard navigation with Enter key', async () => {
    const user = userEvent.setup();

    render(
      <ConversationList
        conversations={mockConversations}
        activeRecipientId={null}
        onSelectConversation={mockOnSelectConversation}
      />
    );

    const firstConversation = screen
      .getByText('John Doe')
      .closest('[role="button"]') as HTMLElement;
    await user.click(firstConversation);
    await user.keyboard('{Enter}');

    expect(mockOnSelectConversation).toHaveBeenCalledWith('1');
  });

  test('handles keyboard navigation with Space key', async () => {
    const user = userEvent.setup();

    render(
      <ConversationList
        conversations={mockConversations}
        activeRecipientId={null}
        onSelectConversation={mockOnSelectConversation}
      />
    );

    const firstConversation = screen
      .getByText('John Doe')
      .closest('[role="button"]') as HTMLElement;
    await user.click(firstConversation);
    await user.keyboard(' ');

    expect(mockOnSelectConversation).toHaveBeenCalledWith('1');
  });

  test('highlights active conversation', () => {
    render(
      <ConversationList
        conversations={mockConversations}
        activeRecipientId="2"
        onSelectConversation={mockOnSelectConversation}
      />
    );

    const activeConversation = screen.getByText('Jane Smith').closest('li');
    expect(activeConversation).toHaveClass('active');

    const inactiveConversation = screen.getByText('John Doe').closest('li');
    expect(inactiveConversation).not.toHaveClass('active');
  });

  test('displays profile pictures correctly', () => {
    render(
      <ConversationList
        conversations={mockConversations}
        activeRecipientId={null}
        onSelectConversation={mockOnSelectConversation}
      />
    );

    const johnAvatar = screen.getByAltText('John Doe avatar');
    expect(johnAvatar).toHaveAttribute('src', 'data:image/jpeg;base64,john-photo');

    const janeAvatar = screen.getByAltText('Jane Smith avatar');
    expect(janeAvatar).toHaveAttribute('src', 'data:image/jpeg;base64,jane-photo');
  });

  test('uses default image when no profile picture provided', () => {
    render(
      <ConversationList
        conversations={mockConversations}
        activeRecipientId={null}
        onSelectConversation={mockOnSelectConversation}
      />
    );

    const bobAvatar = screen.getByAltText('Bob Wilson avatar');
    expect(bobAvatar).toHaveAttribute('src', 'data:image/svg+xml;base64,default-image');
  });

  test('falls back to default image on image load error', () => {
    render(
      <ConversationList
        conversations={mockConversations}
        activeRecipientId={null}
        onSelectConversation={mockOnSelectConversation}
      />
    );

    const johnAvatar = screen.getByAltText('John Doe avatar');
    expect(johnAvatar).toHaveAttribute('src', 'data:image/jpeg;base64,john-photo');

    fireEvent.error(johnAvatar);

    expect(johnAvatar).toHaveAttribute('src', 'data:image/svg+xml;base64,default-image');
  });

  test('displays empty state when no conversations', () => {
    render(
      <ConversationList
        conversations={[]}
        activeRecipientId={null}
        onSelectConversation={mockOnSelectConversation}
      />
    );

    expect(screen.getByText('Brak konwersacji')).toBeInTheDocument();
    expect(
      screen.getByText('Wyszukaj użytkownika, aby rozpocząć pierwszy czat')
    ).toBeInTheDocument();
    expect(screen.getByText('💬')).toBeInTheDocument();
  });

  test('sets correct accessibility attributes', () => {
    render(
      <ConversationList
        conversations={mockConversations}
        activeRecipientId={null}
        onSelectConversation={mockOnSelectConversation}
      />
    );

    const conversationItems = screen.getAllByRole('button');

    conversationItems.forEach(item => {
      expect(item).toHaveAttribute('tabIndex', '0');
      expect(item).toHaveAttribute('role', 'button');
    });
  });

  test('formats dates correctly for today', () => {
    const todayConversation: Conversation[] = [
      {
        userId: '1',
        userName: 'John Doe',
        lastMessage: 'Hello',
        lastMessageDate: new Date().toISOString(),
      },
    ];

    render(
      <ConversationList
        conversations={todayConversation}
        activeRecipientId={null}
        onSelectConversation={mockOnSelectConversation}
      />
    );

    const timeElement = screen.getByText(/\d{2}:\d{2}/);
    expect(timeElement).toBeInTheDocument();
  });

  test('formats dates correctly for yesterday', () => {
    const yesterdayConversation: Conversation[] = [
      {
        userId: '1',
        userName: 'John Doe',
        lastMessage: 'Hello',
        lastMessageDate: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    render(
      <ConversationList
        conversations={yesterdayConversation}
        activeRecipientId={null}
        onSelectConversation={mockOnSelectConversation}
      />
    );

    expect(screen.getByText('Wczoraj')).toBeInTheDocument();
  });

  test('formats dates correctly for older dates', () => {
    const oldConversation: Conversation[] = [
      {
        userId: '1',
        userName: 'John Doe',
        lastMessage: 'Hello',
        lastMessageDate: new Date('2023-01-15').toISOString(),
      },
    ];

    render(
      <ConversationList
        conversations={oldConversation}
        activeRecipientId={null}
        onSelectConversation={mockOnSelectConversation}
      />
    );

    expect(screen.getByText(/15 sty/)).toBeInTheDocument();
  });

  test('handles conversations without dates', () => {
    const conversationsWithoutDates: Conversation[] = [
      {
        userId: '1',
        userName: 'John Doe',
        lastMessage: 'Hello',
      },
      {
        userId: '2',
        userName: 'Jane Smith',
        lastMessage: 'Hi',
        lastMessageDate: new Date().toISOString(),
      },
    ];

    render(
      <ConversationList
        conversations={conversationsWithoutDates}
        activeRecipientId={null}
        onSelectConversation={mockOnSelectConversation}
      />
    );

    const conversationItems = screen.getAllByRole('button');
    expect(conversationItems[0]).toHaveTextContent('Jane Smith');
    expect(conversationItems[1]).toHaveTextContent('John Doe');
  });

  test('provides title attributes for accessibility', () => {
    render(
      <ConversationList
        conversations={mockConversations}
        activeRecipientId={null}
        onSelectConversation={mockOnSelectConversation}
      />
    );

    const userName = screen.getByText('John Doe');
    expect(userName).toHaveAttribute('title', 'John Doe');

    const lastMessage = screen.getByText('Hello there!');
    expect(lastMessage).toHaveAttribute('title', 'Hello there!');
  });
});
