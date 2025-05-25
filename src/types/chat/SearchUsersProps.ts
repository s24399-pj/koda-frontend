import {UserMiniDto} from "../user/UserMiniDto.ts";

export interface SearchUsersProps {
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    onSearch: () => Promise<void>;
    searchResults: UserMiniDto[];
    onSelectUser: (userId: string) => void;
    onCancel: () => void;
    isSearching: boolean;
    activeUserId?: string;
}
