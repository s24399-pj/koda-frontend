import axiosAuthClient from "./axiosAuthClient";
import {UserProfile} from "../types/user/UserProfile.ts";

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

