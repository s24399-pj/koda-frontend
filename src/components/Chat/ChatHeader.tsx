// components/ChatHeader.tsx
import React from 'react';
import { UserProfile } from '../../types/user/UserProfile';

const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48Y2lyY2xlIGN4PSIxMjgiIGN5PSIxMjgiIHI9IjEyMCIgZmlsbD0iI2U5ZWNlZiIvPjxjaXJjbGUgY3g9IjEyOCIgY3k9IjExMCIgcj0iMzUiIGZpbGw9IiM2Yzc1N2QiLz48cGF0aCBkPSJNMTk4LDE4OGMwLTI1LjQtMzEuNC00Ni03MC00NnMtNzAsMjAuNi03MCw0NnMzMS40LDQ2LDcwLDQ2UzE5OCwyMTMuNCwxOTgsMTg4WiIgZmlsbD0iIzZjNzU3ZCIvPjwvc3ZnPg==";

interface ChatHeaderProps {
    recipient: UserProfile;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ recipient }) => {
    return (
        <div className="chat-header">
            <div className="recipient-info">
                <div className="recipient-avatar">
                    <img
                        src={recipient.profilePictureBase64 || DEFAULT_AVATAR}
                        alt={`${recipient.firstName} ${recipient.lastName}`}
                        onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.src = DEFAULT_AVATAR;
                        }}
                    />
                </div>
                <div className="recipient-details">
                    <h3>{recipient.firstName} {recipient.lastName}</h3>
                </div>
            </div>
        </div>
    );
};

export default ChatHeader;