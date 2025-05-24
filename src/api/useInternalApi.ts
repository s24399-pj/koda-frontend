import axiosAuthClient from "./axiosAuthClient";
import {UserProfile} from "../types/user/UserProfile.ts";
import {UserMiniDto} from "../types/user/UserMiniDto.ts";

export const getUserProfile = (userId?: string): Promise<UserProfile> => {
    const url = userId
        ? `/api/v1/internal/users/${userId}/profile`
        : "/api/v1/internal/users/profile";

    return axiosAuthClient
        .get<UserProfile>(url)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.error("Error fetching user profile:", error);
            throw error;
        });
};
export const searchUsers = (query: string): Promise<UserMiniDto[]> => {
    return axiosAuthClient
        .get<UserMiniDto[]>(`/api/v1/internal/users/search?query=${encodeURIComponent(query)}`)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.error("Error searching users:", error);
            throw error;
        });
};

