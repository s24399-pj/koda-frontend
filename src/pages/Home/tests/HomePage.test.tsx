import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../HomePage';

const { mockUseTitle } = vi.hoisted(() => ({
  mockUseTitle: vi.fn(),
}));

vi.mock('../../hooks/useTitle', () => ({
  default: mockUseTitle,
}));

vi.mock('../../components/SimpleSearch/SimpleSearch', () => ({
  default: () => <div data-testid="SimpleSearch">Simple Search Component</div>,
}));

vi.mock('../../components/WhyChooseUs/WhyChooseUs', () => ({
  default: () => <div data-testid="WhyChooseUs">Why Choose Us Component</div>,
}));

vi.mock('../../components/OfferSlider/OfferSlider', () => ({
  default: () => <div data-testid="OfferSlider">Offer Slider Component</div>,
}));

vi.mock('../../assets/images/car_home.png', () => ({
  default: 'mocked-car-image.png',
}));

const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

const setWindowWidth = (width: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
};

Object.defineProperty(window, 'addEventListener', {
  writable: true,
  configurable: true,
  value: mockAddEventListener,
});

Object.defineProperty(window, 'removeEventListener', {
  writable: true,
  configurable: true,
  value: mockRemoveEventListener,
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe('HomePage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTitle.mockReset();
    mockAddEventListener.mockReset();
    mockRemoveEventListener.mockReset();

    setWindowWidth(1024);
  });

  test('has correct CSS classes and structure', () => {
    renderWithRouter(<HomePage />);

    expect(document.querySelector('.homepage-container')).toBeInTheDocument();
    expect(document.querySelector('.homepage-content')).toBeInTheDocument();
    expect(document.querySelector('.homepage-text')).toBeInTheDocument();
    expect(document.querySelector('.car-image-container')).toBeInTheDocument();
  });

  test('sets up resize event listener on mount', () => {
    renderWithRouter(<HomePage />);

    expect(mockAddEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(mockAddEventListener).toHaveBeenCalledTimes(1);
  });

  test('removes resize event listener on unmount', () => {
    const { unmount } = renderWithRouter(<HomePage />);

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(mockRemoveEventListener).toHaveBeenCalledTimes(1);
  });

  test('applies mobile class when screen width is less than 768px', () => {
    setWindowWidth(500);

    renderWithRouter(<HomePage />);

    const carImageContainer = document.querySelector('.car-image-container');
    expect(carImageContainer).toHaveClass('mobile');
  });

  test('does not apply mobile class when screen width is 768px or more', () => {
    setWindowWidth(1024);

    renderWithRouter(<HomePage />);

    const carImageContainer = document.querySelector('.car-image-container');
    expect(carImageContainer).not.toHaveClass('mobile');
  });

  test('updates mobile state when window is resized', () => {
    setWindowWidth(1024);
    const { rerender } = renderWithRouter(<HomePage />);

    const carImageContainer = document.querySelector('.car-image-container');
    expect(carImageContainer).not.toHaveClass('mobile');

    setWindowWidth(500);
    const resizeHandler = mockAddEventListener.mock.calls.find(call => call[0] === 'resize')?.[1];

    if (resizeHandler) {
      fireEvent(window, new Event('resize'));
      resizeHandler();
    }

    rerender(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    const updatedContainer = document.querySelector('.car-image-container');
    expect(updatedContainer).toHaveClass('mobile');
  });

  test('updates mobile state from mobile to desktop', () => {
    setWindowWidth(500);
    const { rerender } = renderWithRouter(<HomePage />);

    const carImageContainer = document.querySelector('.car-image-container');
    expect(carImageContainer).toHaveClass('mobile');

    setWindowWidth(1024);
    const resizeHandler = mockAddEventListener.mock.calls.find(call => call[0] === 'resize')?.[1];

    if (resizeHandler) {
      fireEvent(window, new Event('resize'));
      resizeHandler();
    }

    rerender(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    const updatedContainer = document.querySelector('.car-image-container');
    expect(updatedContainer).not.toHaveClass('mobile');
  });

  test('handles multiple resize events correctly', () => {
    const { rerender } = renderWithRouter(<HomePage />);

    const resizeHandler = mockAddEventListener.mock.calls.find(call => call[0] === 'resize')?.[1];

    if (resizeHandler) {
      setWindowWidth(600);
      fireEvent(window, new Event('resize'));
      resizeHandler();

      setWindowWidth(800);
      fireEvent(window, new Event('resize'));
      resizeHandler();

      setWindowWidth(400);
      fireEvent(window, new Event('resize'));
      resizeHandler();
    }

    rerender(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    const carImageContainer = document.querySelector('.car-image-container');
    expect(carImageContainer).toHaveClass('mobile');
  });

  test('maintains correct heading structure', () => {
    renderWithRouter(<HomePage />);

    const h1 = screen.getByRole('heading', { level: 1 });
    const span = h1.querySelector('span');

    expect(span).toBeInTheDocument();
    expect(span).toHaveTextContent('samochód');
    expect(h1).toHaveTextContent('Znajdź swój wymarzony samochód');
  });

  test('has proper semantic structure', () => {
    renderWithRouter(<HomePage />);

    const container = document.querySelector('.homepage-container');
    const content = container?.querySelector('.homepage-content');
    const textSection = content?.querySelector('.homepage-text');
    const imageContainer = content?.querySelector('.car-image-container');

    expect(container).toBeInTheDocument();
    expect(content).toBeInTheDocument();
    expect(textSection).toBeInTheDocument();
    expect(imageContainer).toBeInTheDocument();

    expect(textSection?.querySelector('h1')).toBeInTheDocument();
    expect(textSection?.querySelector('h2')).toBeInTheDocument();
    expect(imageContainer?.querySelector('.car-image-home')).toBeInTheDocument();
  });
});
