import React from 'react';

interface StepIndicatorProps {
  /** Array of step labels */
  steps: string[];
  /** 1-based index of the current active step */
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-8 max-w-[800px]">
       <div className="text-[18px]  mb-4 font-semibold"> 
          Property бүртгэлийн хүсэлт
        </div>
      <div className="flex items-center justify-between">
       
        {steps.map((label, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isActive    = stepNum === currentStep;

          const circleBase = 'w-8 h-8 flex items-center justify-center rounded-full border-2';

          const circleClass = isCompleted
            ? `${circleBase} bg-primary border-primary text-white`
            : isActive
              ? `${circleBase} border-primary text-primary`
              : `${circleBase} border-gray-300 text-gray-400`;

          const lineClass = isCompleted
            ? 'flex-1 h-px bg-primary self-center'
            : 'flex-1 h-px bg-gray-300 self-center';

          return (
            <React.Fragment key={idx}>
              <div className="flex flex-col items-center">
                <div className={circleClass}>{stepNum}</div>
                <span className="mt-2 text-xs text-center">{label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={lineClass} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}