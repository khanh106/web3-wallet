import React from 'react';
import './CreationSteps.css';

const CreationSteps = ({ currentStep }) => {
  const steps = [
    { number: 1, title: 'Basic Info' },
    { number: 2, title: 'Token Details' },
    { number: 3, title: 'Review & Create' }
  ];

  return (
    <div className="creation-steps">
      {steps.map((step) => (
        <div
          key={step.number}
          className={`step ${currentStep === step.number ? 'active' : ''} ${
            currentStep > step.number ? 'completed' : ''
          }`}
        >
          <div className="step-number">{step.number}</div>
          <div className="step-title">{step.title}</div>
          {step.number < steps.length && <div className="step-line" />}
        </div>
      ))}
    </div>
  );
};

export default CreationSteps; 