import {Conversation} from "./Conversation.ts";

export interface ConversationListProps {
    conversations: Conversation[];
    activeRecipientId: string | null;
    onSelectConversation: (userId: string) => void;
}