'use client';

import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import StepIndicator from './Step';
import RegisterHotel1 from './1PropertyBasicInfo';
import RegisterHotel2 from './2Address';
import RegisterHotel3 from './3GoogleMap';
import RegisterHotel5 from './5PropertyImage';
import RegisterHotel4 from './4PropertyPolicies';
import RegisterHotel6 from './6PropertyDetails';
import { useRouter } from 'next/navigation';

interface ProceedProps{
  proceed: number;
  setProceed: (value: number) => void;
  setView: (view: 'proceed' | 'register') => void;
}

export default function RegisterPage({ proceed, setProceed, setView }: ProceedProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  const router = useRouter();
  const transitionDelay = 2000;

  useEffect(() => {
    const savedStep = localStorage.getItem('currentStep');
    if (savedStep) {
      setCurrentStep(parseInt(savedStep, 10));
    }
  }, []);

  const handleStepChange = (step: number, message?: string) => {
    if (message) toast.success(message);
    setTimeout(() => {
      setCurrentStep(step);
      localStorage.setItem('currentStep', step.toString());
    }, transitionDelay);
  };

  useEffect(() => {
    console.log('Proceed value changed:', proceed);
  }, [proceed]);

  const handleBack = (step: number) => {
    if (step === 1) {
      setView('proceed');
    } else {
      handleStepChange(step - 1, '');
    }
  };

  const handleNext = (nextStep: number) => {
    handleStepChange(nextStep, '');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <RegisterHotel1 onNext={() => handleNext(2)} onBack={() => handleBack(1)} />;
      case 2:
        return <RegisterHotel2 onNext={() => handleNext(3)} onBack={() => handleBack(2)} />;
      case 3:
        return <RegisterHotel3 onNext={() => handleNext(4)} onBack={() => handleBack(3)} />;
      case 4:
        return <RegisterHotel4 onNext={() => handleNext(5)} onBack={() => handleBack(4)} />;
      case 5:
        return <RegisterHotel5 onNext={() => handleNext(6)} onBack={() => handleBack(5)} />;
      case 6:
        return (
          <RegisterHotel6
            proceed={proceed}
            setProceed={setProceed}
            onNext={() => {
              toast.success('Registration completed!');
              setTimeout(() => {
                localStorage.removeItem('currentStep');
                router.push('/admin/hotel');
              }, transitionDelay);
            }}
            onBack={() => handleBack(6)}
          />
        );
      default:
        return <RegisterHotel1 onNext={() => handleNext(2)} onBack={() => handleBack(1)} />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <ToastContainer />
      <StepIndicator totalSteps={totalSteps} currentStep={currentStep} />
      {renderStep()}
    </div>
  );
}