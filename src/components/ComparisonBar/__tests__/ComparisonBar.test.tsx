import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'
import {BrowserRouter} from 'react-router-dom'
import ComparisonBar from '../ComparisonBar'
import {MiniOffer} from '../../../types/miniOfferTypes'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate
    }
})

const mockSessionStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
}

Object.defineProperty(window, 'sessionStorage', {
    value: mockSessionStorage
})

const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('ComparisonBar', () => {
    const mockRemoveFromComparison = vi.fn()

    const mockOffer1: MiniOffer = {
        id: 'offer-1',
        title: 'BMW X5 2020',
        price: 150000,
        mainImage: 'image1.jpg',
        mileage: 50000,
        fuelType: 'DIESEL',
        year: 2020,
        enginePower: 300,
        displacement: '3.0L'
    }

    const mockOffer2: MiniOffer = {
        id: 'offer-2',
        title: 'Audi Q7 2019',
        price: 140000,
        mainImage: 'image2.jpg',
        mileage: 60000,
        fuelType: 'PETROL',
        year: 2019,
        enginePower: 280,
        displacement: '3.2L'
    }

    const defaultProps = {
        selectedOffers: [],
        removeFromComparison: mockRemoveFromComparison
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        mockSessionStorage.setItem.mockClear()
    })

    test('does not render when no offers are selected', () => {
        const {container} = renderWithRouter(<ComparisonBar {...defaultProps} />)

        expect(container.firstChild).toBeNull()
    })

    test('renders when offers are selected', () => {
        renderWithRouter(<ComparisonBar {...defaultProps} selectedOffers={[mockOffer1]}/>)

        expect(screen.getByText('BMW X5 2020')).toBeInTheDocument()
    })

    test('displays selected offer titles', () => {
        renderWithRouter(<ComparisonBar {...defaultProps} selectedOffers={[mockOffer1, mockOffer2]}/>)

        expect(screen.getByText('BMW X5 2020')).toBeInTheDocument()
        expect(screen.getByText('Audi Q7 2019')).toBeInTheDocument()
    })

    test('displays remove buttons for each offer', () => {
        renderWithRouter(<ComparisonBar {...defaultProps} selectedOffers={[mockOffer1, mockOffer2]}/>)

        const removeButtons = screen.getAllByText('✕')
        expect(removeButtons).toHaveLength(2)
    })

    test('calls removeFromComparison when remove button is clicked', async () => {
        const user = userEvent.setup()
        renderWithRouter(<ComparisonBar {...defaultProps} selectedOffers={[mockOffer1]}/>)

        const removeButton = screen.getByText('✕')
        await user.click(removeButton)

        expect(mockRemoveFromComparison).toHaveBeenCalledWith('offer-1')
    })

    test('displays placeholder when only one offer is selected', () => {
        renderWithRouter(<ComparisonBar {...defaultProps} selectedOffers={[mockOffer1]}/>)

        expect(screen.getByText('Wybierz 1 ofertę do porównania')).toBeInTheDocument()
    })

    test('does not display placeholder when two offers are selected', () => {
        renderWithRouter(<ComparisonBar {...defaultProps} selectedOffers={[mockOffer1, mockOffer2]}/>)

        expect(screen.queryByText('Wybierz 1 ofertę do porównania')).not.toBeInTheDocument()
    })

    test('renders compare button', () => {
        renderWithRouter(<ComparisonBar {...defaultProps} selectedOffers={[mockOffer1]}/>)

        expect(screen.getByText('Porównaj')).toBeInTheDocument()
    })

    test('disables compare button when less than 2 offers selected', () => {
        renderWithRouter(<ComparisonBar {...defaultProps} selectedOffers={[mockOffer1]}/>)

        const compareButton = screen.getByText('Porównaj')
        expect(compareButton).toBeDisabled()
    })

    test('enables compare button when exactly 2 offers selected', () => {
        renderWithRouter(<ComparisonBar {...defaultProps} selectedOffers={[mockOffer1, mockOffer2]}/>)

        const compareButton = screen.getByText('Porównaj')
        expect(compareButton).not.toBeDisabled()
    })

    test('navigates to comparison page when compare button is clicked', async () => {
        const user = userEvent.setup()
        renderWithRouter(<ComparisonBar {...defaultProps} selectedOffers={[mockOffer1, mockOffer2]}/>)

        const compareButton = screen.getByText('Porównaj')
        await user.click(compareButton)

        expect(mockNavigate).toHaveBeenCalledWith('/comparison')
    })

    test('stores offers in sessionStorage before navigation', async () => {
        const user = userEvent.setup()
        renderWithRouter(<ComparisonBar {...defaultProps} selectedOffers={[mockOffer1, mockOffer2]}/>)

        const compareButton = screen.getByText('Porównaj')
        await user.click(compareButton)

        expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
            'comparisonOffers',
            JSON.stringify([mockOffer1, mockOffer2])
        )
    })

    test('does not navigate when less than 2 offers selected', async () => {
        const user = userEvent.setup()
        renderWithRouter(<ComparisonBar {...defaultProps} selectedOffers={[mockOffer1]}/>)

        const compareButton = screen.getByText('Porównaj')

        await user.click(compareButton)

        expect(mockNavigate).not.toHaveBeenCalled()
        expect(mockSessionStorage.setItem).not.toHaveBeenCalled()
    })

    test('renders correct CSS classes', () => {
        const {container} = renderWithRouter(<ComparisonBar {...defaultProps} selectedOffers={[mockOffer1]}/>)

        expect(container.querySelector('.comparison-bar')).toBeInTheDocument()
        expect(container.querySelector('.comparison-bar-content')).toBeInTheDocument()
        expect(container.querySelector('.selected-offers')).toBeInTheDocument()
        expect(container.querySelector('.selected-offer')).toBeInTheDocument()
        expect(container.querySelector('.offer-title')).toBeInTheDocument()
        expect(container.querySelector('.remove-button')).toBeInTheDocument()
        expect(container.querySelector('.compare-button')).toBeInTheDocument()
    })

    test('handles removing specific offer from multiple offers', async () => {
        const user = userEvent.setup()
        renderWithRouter(<ComparisonBar {...defaultProps} selectedOffers={[mockOffer1, mockOffer2]}/>)

        const removeButtons = screen.getAllByText('✕')
        await user.click(removeButtons[1])

        expect(mockRemoveFromComparison).toHaveBeenCalledWith('offer-2')
    })

    test('displays offers in correct order', () => {
        renderWithRouter(<ComparisonBar {...defaultProps} selectedOffers={[mockOffer1, mockOffer2]}/>)

        const offerTitles = screen.getAllByText(/BMW X5 2020|Audi Q7 2019/)
        expect(offerTitles[0]).toHaveTextContent('BMW X5 2020')
        expect(offerTitles[1]).toHaveTextContent('Audi Q7 2019')
    })

    test('handles offers with long titles', () => {
        const longTitleOffer: MiniOffer = {
            ...mockOffer1,
            title: 'This is a very long car title that might overflow the container and cause layout issues'
        }

        renderWithRouter(<ComparisonBar {...defaultProps} selectedOffers={[longTitleOffer]}/>)

        expect(screen.getByText('This is a very long car title that might overflow the container and cause layout issues')).toBeInTheDocument()
    })

    test('handles offers with special characters in title', () => {
        const specialCharOffer: MiniOffer = {
            ...mockOffer1,
            title: 'BMW X5 "M Package" 2020 & more! @#$%^'
        }

        renderWithRouter(<ComparisonBar {...defaultProps} selectedOffers={[specialCharOffer]}/>)

        expect(screen.getByText('BMW X5 "M Package" 2020 & more! @#$%^')).toBeInTheDocument()
    })

    test('button has correct accessibility attributes', () => {
        renderWithRouter(<ComparisonBar {...defaultProps} selectedOffers={[mockOffer1]}/>)

        const removeButton = screen.getByText('✕')
        expect(removeButton).toHaveClass('remove-button')

        const compareButton = screen.getByText('Porównaj')
        expect(compareButton).toHaveClass('compare-button')
    })

    test('handles rapid clicking of remove buttons', async () => {
        const user = userEvent.setup()
        renderWithRouter(<ComparisonBar {...defaultProps} selectedOffers={[mockOffer1]}/>)

        const removeButton = screen.getByText('✕')

        await user.click(removeButton)
        await user.click(removeButton)
        await user.click(removeButton)

        expect(mockRemoveFromComparison).toHaveBeenCalledTimes(3)
        expect(mockRemoveFromComparison).toHaveBeenCalledWith('offer-1')
    })

    test('handles rapid clicking of compare button', async () => {
        const user = userEvent.setup()
        renderWithRouter(<ComparisonBar {...defaultProps} selectedOffers={[mockOffer1, mockOffer2]}/>)

        const compareButton = screen.getByText('Porównaj')

        await user.click(compareButton)
        await user.click(compareButton)

        expect(mockNavigate).toHaveBeenCalledTimes(2)
        expect(mockSessionStorage.setItem).toHaveBeenCalledTimes(2)
    })

    test('updates when selectedOffers prop changes', () => {
        const {rerender} = renderWithRouter(<ComparisonBar {...defaultProps} selectedOffers={[mockOffer1]}/>)

        expect(screen.getByText('BMW X5 2020')).toBeInTheDocument()
        expect(screen.getByText('Wybierz 1 ofertę do porównania')).toBeInTheDocument()

        rerender(<ComparisonBar {...defaultProps} selectedOffers={[mockOffer1, mockOffer2]}/>)

        expect(screen.getByText('BMW X5 2020')).toBeInTheDocument()
        expect(screen.getByText('Audi Q7 2019')).toBeInTheDocument()
        expect(screen.queryByText('Wybierz 1 ofertę do porównania')).not.toBeInTheDocument()
    })

    test('maintains component state during re-renders', () => {
        const {rerender} = renderWithRouter(<ComparisonBar {...defaultProps} selectedOffers={[mockOffer1]}/>)

        const compareButton = screen.getByText('Porównaj')
        expect(compareButton).toBeDisabled()

        rerender(<ComparisonBar {...defaultProps} selectedOffers={[mockOffer1, mockOffer2]}/>)

        const updatedCompareButton = screen.getByText('Porównaj')
        expect(updatedCompareButton).not.toBeDisabled()
    })

    test('handles edge case with offers having same id', async () => {
        const duplicateOffer: MiniOffer = {...mockOffer1}
        const user = userEvent.setup()

        renderWithRouter(<ComparisonBar {...defaultProps} selectedOffers={[mockOffer1, duplicateOffer]}/>)

        const removeButtons = screen.getAllByText('✕')
        await user.click(removeButtons[0])

        expect(mockRemoveFromComparison).toHaveBeenCalledWith('offer-1')
    })

    test('correctly serializes complex offer data to sessionStorage', async () => {
        const complexOffer: MiniOffer = {
            id: 'complex-1',
            title: 'Complex Car with "quotes" & symbols',
            price: 999999.99,
            mainImage: 'http://example.com/image.jpg',
            mileage: 0,
            fuelType: 'ELECTRIC',
            year: 2024,
            enginePower: 500,
            displacement: 'N/A'
        }

        const user = userEvent.setup()
        renderWithRouter(<ComparisonBar {...defaultProps} selectedOffers={[mockOffer1, complexOffer]}/>)

        const compareButton = screen.getByText('Porównaj')
        await user.click(compareButton)

        expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
            'comparisonOffers',
            JSON.stringify([mockOffer1, complexOffer])
        )
    })
})