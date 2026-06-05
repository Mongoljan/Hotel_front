import { FaCheck } from 'react-icons/fa';
import { useTranslations } from 'next-intl';

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ totalSteps, currentStep }) => {
  const t = useTranslations('6Step');
  const stepNames = [
    t('basicInfo'),
    t('confirmAddress'),
    t('googleMap'),
    t('internalRules'),
    t('cancellationFees'),
    t('propertyImage'),
    t('propertyDetails'),
  ];

  return (
    <div className="w-full mb-6">
      <div className="flex items-start justify-between gap-1 sm:gap-2">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const stepNumber = i + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <div
              key={stepNumber}
              className="flex-1 flex flex-col items-center min-w-0 relative"
            >
              {/* Connector line — drawn to the LEFT of every step except the first */}
              {stepNumber > 1 && (
                <div
                  className={`absolute top-4 sm:top-5 right-1/2 h-[2px] w-full -z-0 ${
                    isCompleted || isActive ? 'bg-primary' : 'bg-border'
                  }`}
                />
              )}

              {/* Circle */}
              <div
                className={`relative z-10 h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-full border-2 text-xs sm:text-sm font-medium bg-background ${
                  isCompleted
                    ? 'bg-primary border-primary text-primary-foreground'
                    : isActive
                    ? 'border-primary text-primary'
                    : 'border-border text-muted-foreground'
                }`}
              >
                {isCompleted ? (
                  <FaCheck className="h-3 w-3 sm:h-4 sm:w-4" />
                ) : (
                  stepNumber
                )}
              </div>

              {/* Label */}
              <div
                className={`mt-2 text-[10px] sm:text-xs text-center leading-tight px-1 line-clamp-2 ${
                  isCompleted || isActive ? 'text-foreground font-medium' : 'text-muted-foreground'
                }`}
                title={stepNames[i]}
              >
                {stepNames[i]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
