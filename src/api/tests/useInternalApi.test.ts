import {beforeEach, describe, expect, it, vi} from 'vitest'
import {getUserProfile, searchUsers} from '../useInternalApi'
import {UserProfile} from '../../types/user/UserProfile'
import {UserMiniDto} from '../../types/user/UserMiniDto'

const {mockAuthGet} = vi.hoisted(() => ({
    mockAuthGet: vi.fn()
}))

vi.mock('../axiosAuthClient', () => ({
    default: {
        get: mockAuthGet
    }
}))

describe('useInternalApi', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.resetAllMocks()
        console.error = vi.fn()
        mockAuthGet.mockReset()
    })

    describe('getUserProfile', () => {
        it('should fetch current user profile when no userId provided', async () => {
            const mockProfile: UserProfile = {
                id: 'current-user-123',
                email: 'user@example.com',
                firstName: 'John',
                lastName: 'Doe',
                profilePictureBase64: 'base64encodedstring'
            }

            const mockResponse = {
                data: mockProfile
            }

            mockAuthGet.mockResolvedValueOnce(mockResponse)

            const result = await getUserProfile()

            expect(mockAuthGet).toHaveBeenCalledWith('/api/v1/internal/users/profile')
            expect(mockAuthGet).toHaveBeenCalledTimes(1)
            expect(result).toEqual(mockProfile)
        })

        it('should fetch specific user profile when userId provided', async () => {
            const mockProfile: UserProfile = {
                id: 'user-456',
                email: 'other@example.com',
                firstName: 'Jane',
                lastName: 'Smith',
                profilePictureBase64: 'anotherbas64string'
            }

            const mockResponse = {
                data: mockProfile
            }

            mockAuthGet.mockResolvedValueOnce(mockResponse)

            const result = await getUserProfile('user-456')

            expect(mockAuthGet).toHaveBeenCalledWith('/api/v1/internal/users/user-456/profile')
            expect(mockAuthGet).toHaveBeenCalledTimes(1)
            expect(result).toEqual(mockProfile)
        })

        it('should throw error when fetching current user profile fails', async () => {
            const error = new Error('Unauthorized')
            mockAuthGet.mockRejectedValueOnce(error)

            await expect(getUserProfile()).rejects.toThrow('Unauthorized')
            expect(console.error).toHaveBeenCalledWith('Error fetching user profile:', error)
        })

        it('should throw error when fetching specific user profile fails', async () => {
            const error = new Error('User not found')
            Object.defineProperty(error, 'response', {
                value: {status: 404, data: {message: 'User not found'}}
            })
            mockAuthGet.mockRejectedValueOnce(error)

            await expect(getUserProfile('nonexistent-user')).rejects.toThrow('User not found')
            expect(console.error).toHaveBeenCalledWith('Error fetching user profile:', error)
        })

        it('should handle network errors', async () => {
            const networkError = new Error('Network Error')
            Object.defineProperty(networkError, 'code', {value: 'NETWORK_ERROR'})
            mockAuthGet.mockRejectedValueOnce(networkError)

            await expect(getUserProfile('user-123')).rejects.toThrow('Network Error')
            expect(console.error).toHaveBeenCalledWith('Error fetching user profile:', networkError)
        })

        it('should handle special characters in userId', async () => {
            const specialUserId = 'user@domain.com'
            const mockProfile: UserProfile = {
                id: specialUserId,
                email: 'special@example.com',
                firstName: 'Special',
                lastName: 'User'
            }

            const mockResponse = {
                data: mockProfile
            }

            mockAuthGet.mockResolvedValueOnce(mockResponse)

            const result = await getUserProfile(specialUserId)

            expect(mockAuthGet).toHaveBeenCalledWith(`/api/v1/internal/users/${specialUserId}/profile`)
            expect(result).toEqual(mockProfile)
        })
    })

    describe('searchUsers', () => {
        it('should search users successfully with simple query', async () => {
            const mockUsers: UserMiniDto[] = [
                {
                    id: 'user-1',
                    firstName: 'John',
                    lastName: 'Doe',
                    fullName: 'John Doe'
                },
                {
                    id: 'user-2',
                    firstName: 'John',
                    lastName: 'Smith',
                    fullName: 'John Smith'
                }
            ]

            const mockResponse = {
                data: mockUsers
            }

            mockAuthGet.mockResolvedValueOnce(mockResponse)

            const result = await searchUsers('John')

            expect(mockAuthGet).toHaveBeenCalledWith('/api/v1/internal/users/search?query=John')
            expect(mockAuthGet).toHaveBeenCalledTimes(1)
            expect(result).toEqual(mockUsers)
        })

        it('should encode special characters in query', async () => {
            const mockUsers: UserMiniDto[] = []
            const mockResponse = {
                data: mockUsers
            }

            mockAuthGet.mockResolvedValueOnce(mockResponse)

            const result = await searchUsers('john@example.com')

            expect(mockAuthGet).toHaveBeenCalledWith('/api/v1/internal/users/search?query=john%40example.com')
            expect(result).toEqual(mockUsers)
        })

        it('should handle query with spaces', async () => {
            const mockUsers: UserMiniDto[] = [
                {
                    id: 'user-1',
                    firstName: 'John',
                    lastName: 'Doe Smith',
                    fullName: 'John Doe Smith'
                }
            ]

            const mockResponse = {
                data: mockUsers
            }

            mockAuthGet.mockResolvedValueOnce(mockResponse)

            const result = await searchUsers('John Doe')

            expect(mockAuthGet).toHaveBeenCalledWith('/api/v1/internal/users/search?query=John%20Doe')
            expect(result).toEqual(mockUsers)
        })

        it('should handle empty search results', async () => {
            const mockUsers: UserMiniDto[] = []
            const mockResponse = {
                data: mockUsers
            }

            mockAuthGet.mockResolvedValueOnce(mockResponse)

            const result = await searchUsers('nonexistent')

            expect(mockAuthGet).toHaveBeenCalledWith('/api/v1/internal/users/search?query=nonexistent')
            expect(result).toEqual([])
        })

        it('should handle empty query string', async () => {
            const mockUsers: UserMiniDto[] = []
            const mockResponse = {
                data: mockUsers
            }

            mockAuthGet.mockResolvedValueOnce(mockResponse)

            const result = await searchUsers('')

            expect(mockAuthGet).toHaveBeenCalledWith('/api/v1/internal/users/search?query=')
            expect(result).toEqual([])
        })

        it('should throw error when search fails', async () => {
            const error = new Error('Search failed')
            mockAuthGet.mockRejectedValueOnce(error)

            await expect(searchUsers('John')).rejects.toThrow('Search failed')
            expect(console.error).toHaveBeenCalledWith('Error searching users:', error)
        })

        it('should handle server errors gracefully', async () => {
            const serverError = new Error('Internal server error')
            Object.defineProperty(serverError, 'response', {
                value: {status: 500, data: {message: 'Internal server error'}}
            })
            mockAuthGet.mockRejectedValueOnce(serverError)

            await expect(searchUsers('test')).rejects.toThrow('Internal server error')
            expect(console.error).toHaveBeenCalledWith('Error searching users:', serverError)
        })

        it('should handle forbidden access', async () => {
            const forbiddenError = new Error('Forbidden')
            Object.defineProperty(forbiddenError, 'response', {
                value: {status: 403, data: {message: 'Access denied'}}
            })
            mockAuthGet.mockRejectedValueOnce(forbiddenError)

            await expect(searchUsers('admin')).rejects.toThrow('Forbidden')
            expect(console.error).toHaveBeenCalledWith('Error searching users:', forbiddenError)
        })

        it('should encode complex query with multiple special characters', async () => {
            const mockUsers: UserMiniDto[] = []
            const mockResponse = {
                data: mockUsers
            }

            mockAuthGet.mockResolvedValueOnce(mockResponse)

            const complexQuery = 'user+name@domain.com & special chars!'
            const result = await searchUsers(complexQuery)

            expect(mockAuthGet).toHaveBeenCalledWith('/api/v1/internal/users/search?query=user%2Bname%40domain.com%20%26%20special%20chars!')
            expect(result).toEqual([])
        })

        it('should handle unicode characters in query', async () => {
            const mockUsers: UserMiniDto[] = [
                {
                    id: 'user-1',
                    firstName: 'Józef',
                    lastName: 'Nowak',
                    fullName: 'Józef Nowak'
                }
            ]

            const mockResponse = {
                data: mockUsers
            }

            mockAuthGet.mockResolvedValueOnce(mockResponse)

            const result = await searchUsers('Józef')

            expect(mockAuthGet).toHaveBeenCalledWith('/api/v1/internal/users/search?query=J%C3%B3zef')
            expect(result).toEqual(mockUsers)
        })
    })

    describe('concurrent requests', () => {
        it('should handle multiple getUserProfile calls simultaneously', async () => {
            const mockProfile1: UserProfile = {
                id: 'user-1',
                email: 'user1@example.com',
                firstName: 'User',
                lastName: 'One'
            }

            const mockProfile2: UserProfile = {
                id: 'user-2',
                email: 'user2@example.com',
                firstName: 'User',
                lastName: 'Two'
            }

            mockAuthGet
                .mockResolvedValueOnce({data: mockProfile1})
                .mockResolvedValueOnce({data: mockProfile2})

            const [result1, result2] = await Promise.all([
                getUserProfile('user-1'),
                getUserProfile('user-2')
            ])

            expect(mockAuthGet).toHaveBeenCalledTimes(2)
            expect(mockAuthGet).toHaveBeenNthCalledWith(1, '/api/v1/internal/users/user-1/profile')
            expect(mockAuthGet).toHaveBeenNthCalledWith(2, '/api/v1/internal/users/user-2/profile')
            expect(result1).toEqual(mockProfile1)
            expect(result2).toEqual(mockProfile2)
        })

        it('should handle mixed API calls', async () => {
            const mockProfile: UserProfile = {
                id: 'current-user',
                email: 'current@example.com',
                firstName: 'Current',
                lastName: 'User'
            }

            const mockUsers: UserMiniDto[] = [
                {
                    id: 'search-user',
                    firstName: 'Search',
                    lastName: 'User',
                    fullName: 'Search User'
                }
            ]

            mockAuthGet
                .mockResolvedValueOnce({data: mockProfile})
                .mockResolvedValueOnce({data: mockUsers})

            const [profileResult, searchResult] = await Promise.all([
                getUserProfile(),
                searchUsers('Search')
            ])

            expect(mockAuthGet).toHaveBeenCalledTimes(2)
            expect(mockAuthGet).toHaveBeenNthCalledWith(1, '/api/v1/internal/users/profile')
            expect(mockAuthGet).toHaveBeenNthCalledWith(2, '/api/v1/internal/users/search?query=Search')
            expect(profileResult).toEqual(mockProfile)
            expect(searchResult).toEqual(mockUsers)
        })
    })

    describe('response data validation', () => {
        it('should handle null response data in getUserProfile', async () => {
            const mockResponse = {
                data: null
            }

            mockAuthGet.mockResolvedValueOnce(mockResponse)

            const result = await getUserProfile()

            expect(result).toBeNull()
        })

        it('should handle undefined response data in searchUsers', async () => {
            const mockResponse = {
                data: undefined
            }

            mockAuthGet.mockResolvedValueOnce(mockResponse)

            const result = await searchUsers('test')

            expect(result).toBeUndefined()
        })

        it('should handle malformed response structure', async () => {
            const mockResponse = {}

            mockAuthGet.mockResolvedValueOnce(mockResponse)

            const result = await getUserProfile()

            expect(result).toBeUndefined()
        })
    })
})