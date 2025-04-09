import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";

class AuthAxiosClient {
    private instance: AxiosInstance;
    private logoutHandler?: () => void;

    constructor(baseURL: string) {
        this.instance = axios.create({
            baseURL,
            headers: {
                "Content-Type": "application/json",
            },
        });

        this.setupInterceptors();
    }

    public setLogoutHandler = (handler: () => void): void => {
        this.logoutHandler = handler;
    };

    private setupInterceptors = (): void => {
        this.instance.interceptors.request.use(
            this.handleRequestSuccess,
            this.handleRequestError
        );

        this.instance.interceptors.response.use(
            this.handleResponseSuccess,
            this.handleResponseError
        );
    };

    private handleRequestSuccess = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        const token = localStorage.getItem("accessToken");

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    };

    private handleRequestError = (error: AxiosError): Promise<never> => {
        return Promise.reject(error);
    };

    private handleResponseSuccess = (response: AxiosResponse): AxiosResponse => {
        return response;
    };

    private handleResponseError = (error: AxiosError): Promise<never> => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            console.error("Authentication error:", error.response.data);

            if (this.logoutHandler) {
                this.logoutHandler();
            } else {
                this.handleDefaultLogout();
            }
        }

        return Promise.reject(error);
    };

    private handleDefaultLogout = (): void => {
        localStorage.removeItem("accessToken");
        window.location.href = "/user/login";
    };

    public get client(): AxiosInstance {
        return this.instance;
    }
}

const authClient = new AuthAxiosClient(import.meta.env.VITE_API_URL);

export const setLogoutFunction = (logout: () => void): void => {
    authClient.setLogoutHandler(logout);
};

export default authClient.client;