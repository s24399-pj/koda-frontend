import React from 'react';

interface StepsIndicatorProps {
  steps: string[];
  activeStep: number;
}

const StepsIndicator: React.FC<StepsIndicatorProps> = ({ steps, activeStep }) => {
  return (
    <div className="steps-indicator">
      {steps.map((step, index) => (
        <div key={index} className={`step ${index <= activeStep ? 'active' : ''}`}>
          <div className="step-number">{index + 1}</div>
          <span>{step}</span>
        </div>
      ))}
    </div>
  );
};

export default StepsIndicator;
