import { FaCheck } from 'react-icons/fa';

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
}
const stepNames = [
  'Property Basic Info',
  'Confirm Address',
  'Google Map',
  'Property Policies',
  'Property Image',
  'Property Details',
];

const StepIndicator: React.FC<StepIndicatorProps> = ({ totalSteps, currentStep }) => {
  return (
    <div className="flex items-center justify-center ">
      <div className="flex items-center space-x-4">
        <div className=" items-center justify-center mt-10">
          <div className="flex items-center">
            {[...Array(totalSteps)].map((_, i) => {
              const stepNumber = i + 1;
              const isCompleted = stepNumber < currentStep;
              const isActive = stepNumber === currentStep;

              return (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${
                      isCompleted
                        ? 'bg-primary text-white border-primary'
                        : isActive
                        ? 'border-primary text-primary'
                        : 'bg-white text-black border-gray-300'
                    }`}
                  >
                    {isCompleted ? <FaCheck className="text-white" /> : stepNumber}
                  </div>

                  {stepNumber < totalSteps && (
                    <div
                      className={`w-10 h-1 ${
                        isCompleted ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
          
      <div className="flex items-center space-x-10 mt-2">
        {stepNames.map((name, i) => {
          const stepNumber = i + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <div key={i} className="w-10 text-center">
              <div
                className={`text-xs ${
                  isCompleted || isActive ? 'text-primary' : 'text-black'
                }`}
              >
                {name}
              </div>
            </div>
          );
        })}
      </div>
        </div>
      </div>
    </div>
  );
};

export default StepIndicator;