/**
 * Component for displaying chat header with recipient information
 * @module components/chat/ChatHeader
 */

import React from 'react';
import { UserProfile } from '../../types/user/UserProfile';
import { DEFAULT_PROFILE_IMAGE } from '../../assets/defaultProfilePicture.ts';

/**
 * Props for ChatHeader component
 * @interface ChatHeaderProps
 */
interface ChatHeaderProps {
  /** The user profile of the chat recipient */
  recipient: UserProfile;
}

/**
 * Header component displaying recipient information in a chat
 * @component
 * @param {ChatHeaderProps} props - Component props
 * @returns {JSX.Element} The ChatHeader component
 */
const ChatHeader: React.FC<ChatHeaderProps> = ({ recipient }) => {
  return (
    <div className="chat-header">
      <div className="recipient-info">
        <div className="recipient-avatar">
          <img
            src={recipient.profilePictureBase64 || DEFAULT_PROFILE_IMAGE}
            alt={`${recipient.firstName} ${recipient.lastName}`}
            onError={e => {
              /**
               * Handles image loading error by setting default profile image
               * @param {React.SyntheticEvent<HTMLImageElement, Event>} e - Image error event
               */
              const target = e.currentTarget as HTMLImageElement;
              target.src = DEFAULT_PROFILE_IMAGE;
            }}
          />
        </div>
        <div className="recipient-details">
          <h3>
            {recipient.firstName} {recipient.lastName}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
