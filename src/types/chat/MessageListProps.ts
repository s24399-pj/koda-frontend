import {ChatMessage} from "./ChatMessage.ts";
import {UserProfile} from "../user/UserProfile.ts";

export interface MessageListProps {
    messages: ChatMessage[];
    currentUser: UserProfile | null;
}