'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import StepIndicator from './Step';
import RegisterHotel1 from './1PropertyBasicInfo';
import RegisterHotel2 from './2Address';
import RegisterHotel3 from './3GoogleMap';
import RegisterHotel4 from './4PropertyPolicies';
import RegisterHotel5 from './5PropertyImage';
import RegisterHotel6 from './6PropertyDetails';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import UserStorage from '@/utils/storage';

const API_PROPERTY_BASIC_INFO = 'https://dev.kacc.mn/api/property-basic-info/';
const API_CONFIRM_ADDRESS = 'https://dev.kacc.mn/api/confirm-address/';
const API_PROPERTY_POLICIES = 'https://dev.kacc.mn/api/property-policies/';
const API_PROPERTY_IMAGES = 'https://dev.kacc.mn/api/property-images/';
const API_PROPERTY_DETAILS = 'https://dev.kacc.mn/api/property-details/';

interface ProceedProps {
  proceed: number;
  setProceed: (value: number) => void;
  setView: (view: 'proceed' | 'register') => void;
}

export default function RegisterPage({ proceed, setProceed, setView }: ProceedProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const { user } = useAuth(); // Get user from auth hook
  const totalSteps = 6;
  const router = useRouter();
  const transitionDelay = 2000;

  useEffect(() => {
    const checkProgress = async () => {
      const userId = user?.id;
      const hotelId = user?.hotel;
      if (!hotelId || !userId) return;

      const stepEndpoints = [
        { step: 1, url: `${API_PROPERTY_BASIC_INFO}?property=${hotelId}`, key: 'step1' },
        { step: 2, url: `${API_CONFIRM_ADDRESS}?property=${hotelId}`, key: 'step2' },
        { step: 4, url: `${API_PROPERTY_POLICIES}?property=${hotelId}`, key: 'step4' },
        { step: 5, url: `${API_PROPERTY_IMAGES}?property=${hotelId}`, key: 'step5' },
        { step: 6, url: `${API_PROPERTY_DETAILS}?property=${hotelId}`, key: 'step6' },
      ];

      const propertyData: Record<string, any> = {};
      let lastCompletedStep = 0;
      let uploadedImageIds: number[] = [];

      for (const { step, url, key } of stepEndpoints) {
        try {
          const res = await fetch(url);
          const data = await res.json();

          const validData = Array.isArray(data)
            ? data.length > 0 && data[0]?.id
            : data?.id;

          if (validData) {
            if (key === 'step5' && Array.isArray(data)) {
              const uploadedImages = data
                .map((img: any) => img?.id)
                .filter((id: any) => typeof id === 'number' && !isNaN(id));

              const entries = data.map((img: any) => ({
                images: img.image,
                descriptions: img.description,
              }));

              propertyData.step5 = {
                entries,
                property_photos: uploadedImages,
                raw: data,
              };

              uploadedImageIds = uploadedImages;
            } else {
              // ✅ Store as object, even if returned as array
              propertyData[key] = Array.isArray(data) ? data[0] : data;
            }

            lastCompletedStep = step;
          } else {
            break;
          }
        } catch (err) {
          console.error(`Error checking step ${step}:`, err);
          break;
        }
      }

      if (lastCompletedStep === 6) {
        toast.success('Та зочид буудлын бүртгэлээ аль хэдийн дуусгасан байна!');
        UserStorage.removeItem('currentStep');
        UserStorage.setItem('proceed', '2', userId);
        // Cache completion status (tied to user + hotel)
        const cacheKey = `hotelCompletion_${userId}_${hotelId}`;
        localStorage.setItem(cacheKey, 'completed');
        setProceed(2);
        return;
      }

      const resumeStep = lastCompletedStep === 3 ? 4 : Math.min(lastCompletedStep + 1, 6);

      const finalDataToStore = {
        step1: propertyData.step1,
        step2: propertyData.step2,
        step4: propertyData.step4,
        step5: propertyData.step5,
        step6: propertyData.step6,
        propertyId: hotelId,
        propertyBasicInfo: propertyData.step1?.id,
        confirmAddress: propertyData.step2?.id,
        propertyPolicies: propertyData.step4?.id,
        property_photos: Array.isArray(uploadedImageIds) ? [...uploadedImageIds] : [],
      };
      UserStorage.setItem('propertyData', JSON.stringify(finalDataToStore), userId);
      UserStorage.setItem('currentStep', resumeStep.toString(), userId);
      setCurrentStep(resumeStep);
    };

    if (user?.id) {
      const savedStep = UserStorage.getItem<string>('currentStep', user.id);
      if (savedStep) {
        setCurrentStep(parseInt(savedStep, 10));
      } else {
        checkProgress();
      }
    }
  }, [user?.id, user?.hotel]);

  const handleStepChange = (step: number, message?: string) => {
    if (message) toast.success(message);
    setTimeout(() => {
      setCurrentStep(step);
      if (user?.id) {
        UserStorage.setItem('currentStep', step.toString(), user.id);
      }
    }, transitionDelay);
  };

  const handleBack = (step: number) => {
    if (step === 1) {
      setView('proceed');
    } else {
      handleStepChange(step - 1);
    }
  };

  const handleNext = (nextStep: number) => {
    handleStepChange(nextStep);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <RegisterHotel1 key={currentStep} onNext={() => handleNext(2)} onBack={() => handleBack(1)} />;
      case 2:
        return <RegisterHotel2 key={currentStep} onNext={() => handleNext(3)} onBack={() => handleBack(2)} />;
      case 3:
        return <RegisterHotel3 key={currentStep} onNext={() => handleNext(4)} onBack={() => handleBack(3)} />;
      case 4:
        return <RegisterHotel4 key={currentStep} onNext={() => handleNext(5)} onBack={() => handleBack(4)} />;
      case 5:
        return <RegisterHotel5 key={currentStep} onNext={() => handleNext(6)} onBack={() => handleBack(5)} />;
      case 6:
        return (
          <RegisterHotel6
            key={currentStep}
            proceed={proceed}
            setProceed={setProceed}
            onNext={() => {
              toast.success('Буудлын мэдээлэл амжилттай хадгалагдлаа! Одоо өрөөнүүдээ нэмнэ үү.');
              setTimeout(() => {
                UserStorage.removeItem('currentStep');
                if (user?.id && user?.hotel) {
                  UserStorage.setItem('proceed', '2', user.id);
                  // Cache completion status (tied to user + hotel)
                  const cacheKey = `hotelCompletion_${user.id}_${user.hotel}`;
                  localStorage.setItem(cacheKey, 'completed');
                }
                setProceed(2);
              }, transitionDelay);
            }}
            onBack={() => handleBack(6)}
          />
        );
      default:
        return <RegisterHotel1 key={'default'} onNext={() => handleNext(2)} onBack={() => handleBack(1)} />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">

      <StepIndicator totalSteps={totalSteps} currentStep={currentStep} />
      <div className="mt-4">
      
      {renderStep()}
      </div>
    </div>
  );
}
