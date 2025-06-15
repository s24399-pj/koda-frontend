import React from 'react';
import { UserProfile } from '../../types/user/UserProfile';
import { DEFAULT_PROFILE_IMAGE } from '../../assets/defaultProfilePicture.ts';

interface ChatHeaderProps {
  recipient: UserProfile;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ recipient }) => {
  return (
    <div className="chat-header">
      <div className="recipient-info">
        <div className="recipient-avatar">
          <img
            src={recipient.profilePictureBase64 || DEFAULT_PROFILE_IMAGE}
            alt={`${recipient.firstName} ${recipient.lastName}`}
            onError={e => {
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
