import {beforeEach, describe, expect, it, vi} from 'vitest'
import axios from 'axios'
import {
    compressImage,
    deleteImage,
    ImageUploadResponse,
    uploadMultipleImages,
    uploadMultipleImagesWithoutOffer,
    validateImageFile
} from '../imageApi'

vi.stubGlobal('import.meta', {env: {VITE_API_URL: 'http://localhost:8137'}})

vi.mock('axios', () => ({
    default: {
        post: vi.fn(),
        delete: vi.fn()
    },
    isAxiosError: vi.fn((err) => err?.isAxiosError === true)
}))

const mockedAxios = axios as unknown as {
    default: {
        post: ReturnType<typeof vi.fn>
        delete: ReturnType<typeof vi.fn>
    },
    isAxiosError: ReturnType<typeof vi.fn>
}

describe('imageApi', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        localStorage.clear()
    })

    describe('uploadMultipleImages', () => {
        it('POSTs to /images/:offerId/upload without auth when no token', async () => {
            const mockResponse: ImageUploadResponse[] = [{
                id: '1',
                url: '/u.png',
                filename: 'a.png',
                size: 123,
                contentType: 'image/png',
                sortOrder: 0
            }]

            mockedAxios.default.post.mockResolvedValueOnce({
                data: mockResponse
            })

            const files = [new File(['a'], 'a.png', {type: 'image/png'})]
            const result = await uploadMultipleImages('offer123', files)

            expect(mockedAxios.default.post).toHaveBeenCalledTimes(1)
            const call = mockedAxios.default.post.mock.calls[0]
            const [url, formData, config] = call

            expect(url).toBe('http://localhost:8137/api/v1/images/offer123/upload')
            expect(formData).toBeInstanceOf(FormData)
            expect(config).toBeDefined()
            expect(config.headers).toEqual({})
            expect(config.timeout).toBe(30000)
            expect(typeof config.onUploadProgress).toBe('function')

            expect(result).toEqual(mockResponse)
            expect(result[0].id).toBe('1')
        })

        it('includes Authorization header when token is present', async () => {
            localStorage.setItem('authToken', 'tok123')
            mockedAxios.default.post.mockResolvedValueOnce({data: []})

            await uploadMultipleImages('off2', [])
            const cfg = mockedAxios.default.post.mock.calls[0][2]

            expect(cfg.headers).toMatchObject({Authorization: 'Bearer tok123'})
        })

        it('throws server error message on axios error with response', async () => {
            const error = new Error('Bad')
            Object.defineProperty(error, 'isAxiosError', {value: true})
            Object.defineProperty(error, 'response', {
                value: {data: {message: 'Bad'}, status: 400, statusText: 'Bad'}
            })

            mockedAxios.default.post.mockRejectedValueOnce(error)
            mockedAxios.isAxiosError.mockReturnValueOnce(true)

            await expect(uploadMultipleImages('x', [])).rejects.toThrow('Bad')
        })

        it('throws network error when no response received', async () => {
            const error = new Error('Network Error')
            Object.defineProperty(error, 'isAxiosError', {value: true})
            Object.defineProperty(error, 'request', {value: {}})

            mockedAxios.default.post.mockRejectedValueOnce(error)
            mockedAxios.isAxiosError.mockReturnValueOnce(true)

            await expect(uploadMultipleImages('x', [])).rejects.toThrow(
                'No response from server. Check your internet connection.'
            )
        })

        it('throws config error on axios config issues', async () => {
            const error = new Error('Oops config')
            Object.defineProperty(error, 'isAxiosError', {value: true})
            Object.defineProperty(error, 'message', {value: 'Oops config'})

            mockedAxios.default.post.mockRejectedValueOnce(error)
            mockedAxios.isAxiosError.mockReturnValueOnce(true)

            await expect(uploadMultipleImages('x', [])).rejects.toThrow(
                'Configuration error: Oops config'
            )
        })
    })

    describe('uploadMultipleImagesWithoutOffer', () => {
        it('POSTs to /images/upload', async () => {
            const mockResponse: ImageUploadResponse[] = [{
                id: 'a',
                url: '',
                filename: '',
                size: 0,
                contentType: '',
                sortOrder: 0
            }]

            mockedAxios.default.post.mockResolvedValueOnce({
                data: mockResponse
            })

            const result = await uploadMultipleImagesWithoutOffer([])
            expect(mockedAxios.default.post).toHaveBeenCalledTimes(1)

            const call = mockedAxios.default.post.mock.calls[0]
            expect(call[0]).toBe('http://localhost:8137/api/v1/images/upload')
            expect(call[1]).toBeInstanceOf(FormData)

            const cfg = call[2]
            expect(cfg.headers).toEqual({})
            expect(cfg.timeout).toBe(30000)
            expect(typeof cfg.onUploadProgress).toBe('function')

            expect(result).toEqual(mockResponse)
        })

        it('propagates network error like uploadMultipleImages', async () => {
            const error = new Error('Network Error')
            Object.defineProperty(error, 'isAxiosError', {value: true})
            Object.defineProperty(error, 'request', {value: {}})

            mockedAxios.default.post.mockRejectedValueOnce(error)
            mockedAxios.isAxiosError.mockReturnValueOnce(true)

            await expect(uploadMultipleImagesWithoutOffer([])).rejects.toThrow(
                'No response from server. Check your internet connection.'
            )
        })
    })

    describe('deleteImage', () => {
        it('DELETEs the correct URL without auth', async () => {
            mockedAxios.default.delete.mockResolvedValueOnce({})
            await deleteImage('img1')

            const call = mockedAxios.default.delete.mock.calls[0]
            expect(call[0]).toBe('http://localhost:8137/api/v1/images/img1')
            expect(call[1]).toEqual({headers: {}})
        })

        it('attaches Authorization header when token exists', async () => {
            localStorage.setItem('accessToken', 'abc')
            mockedAxios.default.delete.mockResolvedValueOnce({})

            await deleteImage('img2')
            const cfg = mockedAxios.default.delete.mock.calls[0][1]

            expect(cfg.headers).toMatchObject({Authorization: 'Bearer abc'})
        })

        it('throws server error message when delete fails', async () => {
            const error = new Error('Delete failed')
            Object.defineProperty(error, 'isAxiosError', {value: true})
            Object.defineProperty(error, 'response', {
                value: {data: {message: 'Delete failed'}}
            })

            mockedAxios.default.delete.mockRejectedValueOnce(error)
            mockedAxios.isAxiosError.mockReturnValueOnce(true)

            await expect(deleteImage('x')).rejects.toThrow('Delete failed')
        })

        it('throws network error otherwise', async () => {
            mockedAxios.default.delete.mockRejectedValueOnce(new Error('err'))
            mockedAxios.isAxiosError.mockReturnValueOnce(false)

            await expect(deleteImage('x')).rejects.toThrow(
                'Network error while deleting image'
            )
        })
    })

    describe('validateImageFile', () => {
        it('accepts a valid file', () => {
            const f = new File(['1'], 'f.png', {type: 'image/png'})
            Object.defineProperty(f, 'size', {value: 2 * 1024 * 1024})
            expect(validateImageFile(f)).toBeNull()
        })

        it('rejects unsupported format', () => {
            const f = new File([], 'f.gif', {type: 'image/gif'})
            expect(validateImageFile(f)).toMatch(/Unsupported file format/)
        })

        it('rejects too-large file', () => {
            const f = new File([], 'big.jpg', {type: 'image/jpeg'})
            Object.defineProperty(f, 'size', {value: 6 * 1024 * 1024})
            expect(validateImageFile(f)).toMatch(/Maximum size: 5MB/)
        })
    })

    describe('compressImage', () => {
        beforeEach(() => {
            global.URL.createObjectURL = vi.fn(() => 'blob://fake')

            vi.spyOn(document, 'createElement').mockImplementation((tag) => {
                if (tag === 'canvas') {
                    const canvas = document.createElement('canvas')
                    canvas.getContext = vi.fn(() => ({
                        drawImage: vi.fn()
                    })) as any

                    canvas.toBlob = vi.fn((callback) => {
                        callback!(new Blob(['compressed-image-data']), 'image/png')
                    }) as any

                    return canvas
                }
                return document.createElement(tag)
            })

            class MockImage {
                width = 1000
                height = 800
                onload?: () => void
                onerror?: () => void

                set src(_: string) {
                    setTimeout(() => this.onload?.())
                }
            }

            global.Image = MockImage as any
        })

        it('resolves a compressed File', async () => {
            const inFile = new File(['a'], 'i.jpg', {type: 'image/jpeg'})
            const out = await compressImage(inFile, 100, 0.5)

            expect(out).toBeInstanceOf(File)
            expect(out.name).toBe('i.jpg')
            expect(out.type).toBe('image/jpeg')
        })

        it('rejects on image load error', async () => {
            class ErrorImage {
                onload?: () => void
                onerror?: () => void

                set src(_: string) {
                    setTimeout(() => this.onerror?.())
                }
            }

            global.Image = ErrorImage as any

            await expect(compressImage(new File([], 'x.jpg', {type: 'image/jpeg'})))
                .rejects.toThrow('Image loading error')
        })
    })
})