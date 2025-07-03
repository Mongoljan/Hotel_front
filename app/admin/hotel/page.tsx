'use client';

import React, { useEffect, useState } from 'react';
import Proceed from '@/app/auth/register/Hotel/Proceed';
import RegisterPage from '@/app/auth/register/Hotel/Hotel';
import StepIndicator from './StepIndicator';
import SixStepInfo from './SixStepInfo';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface Hotel {
  is_approved: boolean;
}

export default function RegisterHotel() {
  const t = useTranslations('AdminPage');
  const { data: session } = useSession();

  const [proceed, setProceed] = useState<number | null>(2);
  const [hotelApproved, setHotelApproved] = useState(true);
  const [stepStatus, setStepStatus] = useState(3);
  const [view, setView] = useState<'proceed' | 'register'>('proceed');

  // ✅ Load proceed from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('proceed');
    console.log('🔍 Hotel Page - localStorage proceed value:', saved);
    console.log('🔍 Hotel Page - Session approval status:', {
      userApproved: session?.user?.approved,
      isApproved: session?.user?.isApproved,
      bothApproved: session?.user?.approved === true && session?.user?.isApproved === true
    });
    
    // If user and hotel are both approved, always set proceed to 2
    if (session?.user?.approved === true && session?.user?.isApproved === true) {
      console.log('🔍 Hotel Page - Both approvals true, setting proceed to 2');
      setProceed(2);
      localStorage.setItem('proceed', '2');
      return;
    }
    
    if (saved !== null) {
      console.log('🔍 Hotel Page - Using saved proceed value:', saved);
      setProceed(Number(saved));
      return;
    }

    const decideStep = async () => {
      try {
        const pd = JSON.parse(localStorage.getItem('propertyData') || '{}');
        if (Array.isArray(pd.general_facilities) && pd.general_facilities.length) {
          setProceed(1);
          return;
        }

        const hotelId = session?.user?.hotel;
        if (hotelId) {
          const res = await fetch(`https://dev.kacc.mn/api/property-details/?property=${hotelId}`, {
            cache: 'no-store',
          });
          const details = await res.json();
          if (Array.isArray(details) && details.length) {
            setProceed(2);
            return;
          }
        }
      } catch (err) {
        console.error(err);
      }

      setProceed(0);
    };

    if (session?.user?.hotel) {
      decideStep();
    }
  }, [session?.user?.hotel, session?.user?.approved, session?.user?.isApproved]);

  // ✅ Persist `proceed` in localStorage
  useEffect(() => {
    if (proceed !== null) {
      localStorage.setItem('proceed', String(proceed));
    }
  }, [proceed]);

  // ✅ Poll hotel approval
  useEffect(() => {
    const checkApproval = async () => {
      try {
        const hotelId = session?.user?.hotel;
        if (!hotelId) return;

        const res = await fetch(`https://dev.kacc.mn/api/properties/${hotelId}`);
        if (!res.ok) return;
        const data: Hotel = await res.json();
        setHotelApproved(data.is_approved);
        setStepStatus(data.is_approved ? 3 : 2);
      } catch (e) {
        console.error('Error fetching approval', e);
      }
    };

    if (session?.user?.hotel) {
      checkApproval();
      const id = setInterval(checkApproval, 5000);
      return () => clearInterval(id);
    }
  }, [session?.user?.hotel]);

  // Save hotel ID to localStorage for components that need it
  useEffect(() => {
    if (session?.user?.hotel) {
      console.log('🔧 Hotel Page - Saving hotel ID to localStorage:', session.user.hotel);
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      userInfo.hotel = session.user.hotel;
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    }
  }, [session?.user?.hotel]);

  if (proceed === null) {
    return (
      <div className="p-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="text-lg">Loading hotel information...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const steps = [
    'Хүсэлт илгээсэн',
    'Хүлээгдэж байгаа',
    'Баталгаажсан',
    'Дэлгэрэнгүй мэдээлэл оруулах',
  ];

  console.log('🔍 Hotel Page - Render values:', {
    proceed,
    view,
    shouldShowSixStepInfo: proceed === 2,
    shouldShowProceed: proceed < 2 && view === 'proceed',
    shouldShowRegister: proceed < 2 && view === 'register'
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Building2 className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hotel Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your hotel information and registration</p>
        </div>
      </div>

      {view === 'proceed' && proceed !== 2 && (
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <span>Registration Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StepIndicator steps={steps} currentStep={stepStatus} />
          </CardContent>
        </Card>
      )}

      {proceed === 2 && session?.user?.hotel && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Hotel Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SixStepInfo proceed={proceed} setProceed={setProceed} />
          </CardContent>
        </Card>
      )}

      {proceed === 2 && !session?.user?.hotel && (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span>Hotel ID Missing</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Unable to load hotel information because the hotel ID is missing.
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Please try logging out and logging back in to fix this issue.
            </p>
            <button
              onClick={() => {
                // Clear proceed value and redirect to step 0
                localStorage.setItem('proceed', '0');
                setProceed(0);
              }}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Go Back to Registration
            </button>
          </CardContent>
        </Card>
      )}

      {proceed < 2 && view === 'proceed' && (
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <Proceed proceed={proceed} setProceed={setProceed} setView={setView} />
          </CardContent>
        </Card>
      )}

      {proceed < 2 && view === 'register' && (
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-purple-500" />
              <span>Hotel Registration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RegisterPage proceed={proceed} setProceed={setProceed} setView={setView} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
