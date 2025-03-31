import axios from "axios";
import axiosAuthClient, {setLogoutFunction} from "./axiosAuthClient";

export interface RegisterCredentials {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const publicApi = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export const register = (credentials: RegisterCredentials): Promise<void> => {
    return publicApi
        .post("/api/v1/external/users/register", credentials)
        .then(() => {
            return;
        })
        .catch((error) => {
            console.error("Register error:", error);
            throw error;
        });
};

export const login = (credentials: LoginCredentials): Promise<AuthResponse> => {
    return publicApi
        .post<AuthResponse>("/api/v1/external/users/login", credentials)
        .then((response) => {
            localStorage.setItem("accessToken", response.data.accessToken);
            return response.data;
        })
        .catch((error) => {
            console.error("Login error:", error);
            throw error;
        });
};

export const logout = (): Promise<void> => {
    return axiosAuthClient
        .post("/api/v1/auth/logout")
        .then(() => {})
        .catch((error) => {
            console.error("Logout error:", error);
        })
        .finally(() => {
            localStorage.removeItem("accessToken");
        });
};

setLogoutFunction(logout);