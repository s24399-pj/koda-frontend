// src/api/tests/imageApi.test.ts

import {describe, it, expect, vi, beforeEach} from 'vitest'

// 1) Stub the VITE_API_URL env *before* we import imageApi
vi.stubEnv('VITE_API_URL', 'http://api.test')

// 2) Mock axios (including isAxiosError)
vi.mock('axios', () => {
    return {
        default: {
            post: vi.fn(),
            delete: vi.fn(),
        },
        isAxiosError: (err: any) => err.isAxiosError === true,
    }
})

import axios from 'axios'
import {
    uploadMultipleImages,
    uploadMultipleImagesWithoutOffer,
    deleteImage,
    validateImageFile,
    compressImage,
} from '../imageApi'

const mockedAxios = axios as unknown as {
    post: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
    isAxiosError: (err: any) => boolean
}

describe('imageApi', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        localStorage.clear()
    })

    describe('uploadMultipleImages', () => {
        it('POSTs to /images/:offerId/upload without auth when no token', async () => {
            mockedAxios.post.mockResolvedValueOnce({
                data: [{
                    id: '1',
                    url: '/u.png',
                    filename: 'a.png',
                    size: 123,
                    contentType: 'image/png',
                    sortOrder: 0
                }]
            })

            const files = [new File(['a'], 'a.png', {type: 'image/png'})]
            const result = await uploadMultipleImages('offer123', files)

            expect(mockedAxios.post).toHaveBeenCalledTimes(1)
            const call = mockedAxios.post.mock.calls[0]!
            const [url, formData, config] = call

            expect(url).toBe('http://api.test/api/v1/images/offer123/upload')
            expect(formData).toBeInstanceOf(FormData)
            expect(config).toBeDefined()
            expect(config!.headers).toEqual({})
            expect(config!.timeout).toBe(30000)
            expect(typeof config!.onUploadProgress).toBe('function')

            expect(result[0].id).toBe('1')
        })

        it('includes Authorization header when token is present', async () => {
            localStorage.setItem('authToken', 'tok123')
            mockedAxios.post.mockResolvedValueOnce({data: []})

            await uploadMultipleImages('off2', [])
            const cfg = mockedAxios.post.mock.calls[0]![2]!

            expect(cfg.headers).toMatchObject({Authorization: 'Bearer tok123'})
        })

        it('throws server error message on axios error with response', async () => {
            mockedAxios.post.mockRejectedValueOnce({
                isAxiosError: true,
                response: {data: {message: 'Bad'}, status: 400, statusText: 'Bad'}
            })

            await expect(uploadMultipleImages('x', [])).rejects.toThrow('Bad')
        })

        it('throws network error when no response received', async () => {
            mockedAxios.post.mockRejectedValueOnce({isAxiosError: true, request: {}})
            await expect(uploadMultipleImages('x', [])).rejects.toThrow(
                'No response from server. Check your internet connection.'
            )
        })

        it('throws config error on axios config issues', async () => {
            mockedAxios.post.mockRejectedValueOnce({isAxiosError: true, message: 'Oops config'})
            await expect(uploadMultipleImages('x', [])).rejects.toThrow(
                'Configuration error: Oops config'
            )
        })
    })

    describe('uploadMultipleImagesWithoutOffer', () => {
        it('POSTs to /images/upload', async () => {
            mockedAxios.post.mockResolvedValueOnce({
                data: [{
                    id: 'a',
                    url: '',
                    filename: '',
                    size: 0,
                    contentType: '',
                    sortOrder: 0
                }]
            })

            await uploadMultipleImagesWithoutOffer([])
            expect(mockedAxios.post).toHaveBeenCalledTimes(1)

            const call = mockedAxios.post.mock.calls[0]!
            expect(call[0]).toBe('http://api.test/api/v1/images/upload')
            expect(call[1]).toBeInstanceOf(FormData)

            const cfg = call[2]!
            expect(cfg.headers).toEqual({})
            expect(cfg.timeout).toBe(30000)
            expect(typeof cfg.onUploadProgress).toBe('function')
        })

        it('propagates network error like uploadMultipleImages', async () => {
            mockedAxios.post.mockRejectedValueOnce({isAxiosError: true, request: {}})
            await expect(uploadMultipleImagesWithoutOffer([])).rejects.toThrow(
                'No response from server. Check your internet connection.'
            )
        })
    })

    describe('deleteImage', () => {
        it('DELETEs the correct URL without auth', async () => {
            mockedAxios.delete.mockResolvedValueOnce({})
            await deleteImage('img1')

            const call = mockedAxios.delete.mock.calls[0]!
            expect(call[0]).toBe('http://api.test/api/v1/images/img1')
            expect(call[1]).toEqual({headers: {}})
        })

        it('attaches Authorization header when token exists', async () => {
            localStorage.setItem('accessToken', 'abc')
            mockedAxios.delete.mockResolvedValueOnce({})

            await deleteImage('img2')
            const cfg = mockedAxios.delete.mock.calls[0]![1]!

            expect(cfg.headers).toMatchObject({Authorization: 'Bearer abc'})
        })

        it('throws server error message when delete fails', async () => {
            mockedAxios.delete.mockRejectedValueOnce({
                isAxiosError: true,
                response: {data: {message: 'Delete failed'}}
            })
            await expect(deleteImage('x')).rejects.toThrow('Delete failed')
        })

        it('throws network error otherwise', async () => {
            mockedAxios.delete.mockRejectedValueOnce(new Error('err'))
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
        const realImage = global.Image
        const realURL = URL.createObjectURL

        beforeEach(() => {
            URL.createObjectURL = () => 'blob://fake'
            vi.spyOn(document, 'createElement').mockImplementation(tag => {
                if (tag === 'canvas') {
                    const c = document.createElement('canvas')
                    c.getContext = () => ({
                        drawImage: () => {
                        }
                    } as any)
                    c.toBlob = cb => cb!(new Blob(['x']), 'image/png', 0.8)
                    return c
                }
                return document.createElement(tag)
            })
            // @ts-ignore
            global.Image = class {
                onload!: () => void
                onerror!: () => void

                set src(_v: string) {
                    setTimeout(() => this.onload())
                }
            }
        })

        afterEach(() => {
            URL.createObjectURL = realURL
            // @ts-ignore
            global.Image = realImage
            vi.restoreAllMocks()
        })

        it('resolves a compressed File', async () => {
            const inFile = new File(['a'], 'i.jpg', {type: 'image/jpeg'})
            const out = await compressImage(inFile, 100, 0.5)
            expect(out).toBeInstanceOf(File)
            expect(out.name).toBe('i.jpg')
        })

        it('rejects on image load error', async () => {
            // @ts-ignore
            global.Image = class {
                onload!: () => void
                onerror!: () => void

                set src(_v: string) {
                    setTimeout(() => this.onerror())
                }
            }
            await expect(compressImage(new File([], 'x.jpg', {type: 'image/jpeg'})))
                .rejects.toThrow('Image loading error')
        })
    })
})
