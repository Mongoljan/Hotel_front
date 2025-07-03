'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const t = useTranslations('Auth');

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'CredentialsSignin':
        return 'Имэйл эсвэл нууц үг буруу байна';
      case 'Configuration':
        return 'Системийн тохиргооны алдаа';
      case 'AccessDenied':
        return 'Нэвтрэх эрх байхгүй байна';
      case 'Verification':
        return 'Баталгаажуулалтын алдаа';
      default:
        return 'Нэвтрэхэд алдаа гарлаа';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Нэвтрэх алдаа
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {getErrorMessage(error)}
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <Link
            href="/auth/login"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-bg-3 hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Дахин нэвтрэх
          </Link>
          
          <Link
            href="/"
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Үндсэн хуудас руу буцах
          </Link>
        </div>
      </div>
    </div>
  );
} 