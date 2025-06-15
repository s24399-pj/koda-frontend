import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import StepsIndicator from '../StepsIndicator';

// ---------------------------------------------------
// Test suite for StepsIndicator component
// ---------------------------------------------------

describe('StepsIndicator Component', () => {
    const steps = ['First', 'Second', 'Third', 'Fourth'];

    it('renders the wrapper with correct class', () => {
        const {container} = render(<StepsIndicator steps={steps} activeStep={0}/>);
        const wrapper = container.querySelector('.steps-indicator');
        expect(wrapper).toBeInTheDocument();
    });

    it('renders the correct number of steps with labels and numbers', () => {
        render(<StepsIndicator steps={steps} activeStep={0}/>);

        // Should render each step label and number
        steps.forEach((label, index) => {
            const labelElement = screen.getByText(label);
            expect(labelElement).toBeInTheDocument();
            const numberElement = screen.getByText(`${index + 1}`);
            expect(numberElement).toBeInTheDocument();
            // Check number has correct class
            expect(numberElement).toHaveClass('step-number');
        });

        // Should render exactly steps.length step containers
        const stepContainers = document.querySelectorAll('.step');
        expect(stepContainers.length).toBe(steps.length);
    });

    it('applies "active" class to steps up to and including activeStep', () => {
        const activeIndex = 2;
        const {container} = render(
            <StepsIndicator steps={steps} activeStep={activeIndex}/>
        );
        const stepElements = container.querySelectorAll('.step');

        stepElements.forEach((el, idx) => {
            if (idx <= activeIndex) {
                expect(el).toHaveClass('active');
            } else {
                expect(el).not.toHaveClass('active');
            }
        });
    });

    it('handles activeStep = -1 (no steps active)', () => {
        const {container} = render(<StepsIndicator steps={steps} activeStep={-1}/>);
        container.querySelectorAll('.step').forEach((el) => {
            expect(el).not.toHaveClass('active');
        });
    });

    it('handles activeStep greater than last index (all steps active)', () => {
        const {container} = render(
            <StepsIndicator steps={steps} activeStep={steps.length + 5}/>
        );
        container.querySelectorAll('.step').forEach((el) => {
            expect(el).toHaveClass('active');
        });
    });

    it('renders correctly when steps array is empty', () => {
        const {container} = render(<StepsIndicator steps={[]} activeStep={0}/>);
        expect(container.querySelectorAll('.step').length).toBe(0);
    });

    it('updates active classes when props change', () => {
        const {container, rerender} = render(
            <StepsIndicator steps={steps} activeStep={1}/>
        );

        // initially first two steps active
        let stepElements = container.querySelectorAll('.step');
        expect(stepElements[0]).toHaveClass('active');
        expect(stepElements[1]).toHaveClass('active');
        expect(stepElements[2]).not.toHaveClass('active');

        // rerender with different activeStep
        rerender(<StepsIndicator steps={steps} activeStep={3}/>);
        stepElements = container.querySelectorAll('.step');
        stepElements.forEach((el) => {
            expect(el).toHaveClass('active');
        });
    });

    it('matches snapshot', () => {
        const {asFragment} = render(
            <StepsIndicator steps={steps} activeStep={2}/>
        );
        expect(asFragment()).toMatchSnapshot();
    });
});
