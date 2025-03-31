import axiosAuthClient from "./axiosAuthClient";

export interface UserProfile {
    id?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
}

export const getUserProfile = (): Promise<UserProfile> => {
    return axiosAuthClient
        .get<UserProfile>("/api/v1/internal/users/profile")
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.error("Error fetching user profile:", error);
            throw error;
        });
};

export const updateUserProfile = (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    return axiosAuthClient
        .put<UserProfile>("/api/v1/internal/users/profile", profileData)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.error("Error updating user profile:", error);
            throw error;
        });
};

export const changePassword = (oldPassword: string, newPassword: string): Promise<void> => {
    return axiosAuthClient
        .post("/api/v1/internal/users/change-password", {
            oldPassword,
            newPassword,
        })
        .then(() => {
            // Pomyślna zmiana hasła
            return;
        })
        .catch(error => {
            console.error("Error changing password:", error);
            throw error;
        });
};

export const getUserActivity = (): Promise<any[]> => {
    return axiosAuthClient
        .get<any[]>("/api/v1/internal/users/activity")
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.error("Error fetching user activity:", error);
            throw error;
        });
};

