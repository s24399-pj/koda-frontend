/**
 * Module for handling user authentication in the application
 * @module api/authApi
 */

import axios from 'axios';
import axiosAuthClient from './axiosAuthClient';
import { RegisterCredentials } from '../types/auth/RegisterCredentials.ts';
import { LoginCredentials } from '../types/auth/LoginCredentials.ts';
import { AuthResponse } from '../types/auth/AuthResponse.ts';

/** Base API URL */
const API_URL = import.meta.env.VITE_API_URL;

/**
 * Axios client for making requests without authentication
 * @type {import('axios').AxiosInstance}
 */
const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Registers a new user in the system
 * @async
 * @function register
 * @param {RegisterCredentials} credentials - User registration data
 * @returns {Promise<void>} Promise resolved after successful registration
 * @throws {Error} Registration error
 */
export const register = (credentials: RegisterCredentials): Promise<void> => {
  return publicApi
    .post('/api/v1/external/users/register', credentials)
    .then(() => {
      return;
    })
    .catch(error => {
      console.error('Register error:', error);
      throw error;
    });
};

/**
 * Logs in a user and stores the access token
 * @async
 * @function login
 * @param {LoginCredentials} credentials - User login credentials
 * @returns {Promise<AuthResponse>} Promise with authentication response
 * @throws {Error} Login error
 */
export const login = (credentials: LoginCredentials): Promise<AuthResponse> => {
  return publicApi
    .post<AuthResponse>('/api/v1/external/users/login', credentials)
    .then(response => {
      localStorage.setItem('accessToken', response.data.accessToken);
      return response.data;
    })
    .catch(error => {
      console.error('Login error:', error);
      throw error;
    });
};

/**
 * Logs out the current user and removes the access token
 * @async
 * @function logout
 * @returns {Promise<void>} Promise resolved after successful logout
 */
export const logout = (): Promise<void> => {
  return axiosAuthClient
    .get('/api/v1/auth/logout')
    .then(() => {})
    .catch(error => {
      console.error('Logout error:', error);
    })
    .finally(() => {
      localStorage.removeItem('accessToken');
    });
};
