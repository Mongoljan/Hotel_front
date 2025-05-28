import { FaCheck } from 'react-icons/fa';
import { useTranslations } from 'next-intl';

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
}


const StepIndicator: React.FC<StepIndicatorProps> =  ({ totalSteps, currentStep }) => {
  const t =  useTranslations('6Step');
  const stepNames = [
    t("basicInfo"),
    t("confirmAddress"),
    t("googleMap"),
   "Дотоод журам",
    t("propertyImage"),
    t("propertyDetails"),
  ];
  return (
    <div className="flex items-center justify-center mb-4 ">
      <div className="flex items-center space-x-4">
        <div className=" items-center justify-center ">
          <div className="flex items-center">
            {[...Array(totalSteps)].map((_, i) => {
              const stepNumber = i + 1;
              const isCompleted = stepNumber < currentStep;
              const isActive = stepNumber === currentStep;

              return (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-12 h-12 flex items-center justify-center rounded-full border-[1px] ${
                      isCompleted
                        ? 'bg-primary text-white border-primary border-[2px]'
                        : isActive
                        ? 'border-primary text-primary'
                        : 'bg-white text-black border-gray-300'
                    }`}
                  >
                    {isCompleted ? <FaCheck className="text-white" /> : stepNumber}
                  </div>

                  {stepNumber < totalSteps && (
                    <div
                      className={`w-40 h-[2px] ${
                        isCompleted ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
          
      <div className="flex items-center space-x-40 mt-2">
        {stepNames.map((name, i) => {
          const stepNumber = i + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <div key={i} className="w-12 text-center">
              <div
                className={`text-[12px] text-center text ${
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