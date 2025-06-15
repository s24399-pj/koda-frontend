export interface LocationState {
  sellerInfo?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    email: string;
    isNewConversation: boolean;
  };
  returnUrl?: string;
}
