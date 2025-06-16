import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {ProfileImage} from '../ProfileImage';
import {DEFAULT_PROFILE_IMAGE} from "../../../assets/defaultProfilePicture.ts";

describe('ProfileImage Component', () => {
    it('renders default image when no imageData provided', () => {
        render(<ProfileImage alt="User"/>);
        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('src', DEFAULT_PROFILE_IMAGE);
        expect(img).toHaveAttribute('alt', 'User');
        expect(img).toHaveClass('rounded-full', 'object-cover', 'w-12', 'h-12');
    });

    it('renders provided imageData as base64 data URL', () => {
        const bytes = new Uint8Array([72, 101, 108, 108, 111]); // 'Hello'
        render(<ProfileImage imageData={bytes} alt="Hello" size="large" className="custom"/>);
        const img = screen.getByRole('img');
        // Manually compute base64
        const binary = String.fromCharCode(...Array.from(bytes));
        const base64 = btoa(binary);
        expect(img).toHaveAttribute('src', `data:image/jpeg;base64,${base64}`);
        expect(img).toHaveClass('rounded-full', 'object-cover', 'w-20', 'h-20', 'custom');
    });

    it('falls back to default image on error event', () => {
        const bytes = new Uint8Array([0xff]); // invalid JPEG header
        render(<ProfileImage imageData={bytes} alt="Invalid"/>);
        const img = screen.getByRole('img');
        // simulate image loading error
        fireEvent.error(img);
        expect(img).toHaveAttribute('src', DEFAULT_PROFILE_IMAGE);
    });

    it('handles btoa exceptions and still renders default image', () => {
        // mock btoa to throw
        const originalBtoa = global.btoa;
        global.btoa = vi.fn(() => {
            throw new Error('fail');
        });

        const bytes = new Uint8Array([65, 66, 67]);
        render(<ProfileImage imageData={bytes} alt="Error"/>);
        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('src', DEFAULT_PROFILE_IMAGE);

        global.btoa = originalBtoa;
    });
});
