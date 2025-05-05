'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { schemaLogin } from '../../schema'; // adjust path if needed
import { zodResolver } from '@hookform/resolvers/zod';
import { HiEye, HiEyeSlash } from 'react-icons/hi2';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { loginAction } from './LoginAction'; // server action
import { useTranslations } from 'next-intl';
import Cookies from 'js-cookie';

type FormFields = z.infer<typeof schemaLogin>;

export default function LoginForm() {
  const router = useRouter();
  const t = useTranslations('AuthLogin');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({ resolver: zodResolver(schemaLogin) });

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    const result = await loginAction(data);
console.log("here is token:",Cookies.get("token"));

    if ('error' in result) {
      toast.error(result.error);
    } else {
      localStorage.setItem('userInfo', JSON.stringify(result.userInfo));
      toast.success('Login successful!');
      router.push('/admin/hotel');
    }
  };

  return (
    <>
      <ToastContainer />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-10 px-10 max-w-[600px] md:min-w-[440px] min-w-[250px] border-primary border-[1px] rounded-[15px] text-gray-600"
      >
        <h2 className="text-[30px] font-bold text-center text-black mb-10">{t('signIn')}</h2>

        <div className="text-black">{t('email')}</div>
        <input
          type="email"
          {...register('email')}
          className="border p-4 w-full mb-6 h-[45px] rounded-[15px]"
        />
        {errors.email && <div className="text-red-500">{errors.email.message}</div>}

        <div className="text-black">{t('password')}</div>
        <div className="relative">
          <input
            type={isPasswordVisible ? 'text' : 'password'}
            {...register('password')}
            className="border p-4 w-full mb-2 h-[45px] rounded-[15px]"
          />
          <button
            type="button"
            onClick={() => setIsPasswordVisible((prev) => !prev)}
            className="absolute right-3 top-2"
          >
            {isPasswordVisible ? <HiEye size={20} className="mt-2" /> : <HiEyeSlash size={20} className="mt-2" />}
          </button>
        </div>

        {errors.password && <div className="text-red-500">{errors.password.message}</div>}

        <div className="flex justify-between text-black mb-4">
          <Link href="/auth/resetpassword" className="hover:text-blue-400">{t('remember')}</Link>
          <Link href="/auth/resetpassword" className="hover:text-blue-400">{t('savePassword')}</Link>
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-white py-2 px-4 rounded-[15px] hover:bg-bg"
          disabled={isSubmitting}
        >
          {isSubmitting ? t('wait') : t('signIn')}
        </button>

        <Link
          href="/auth/register"
          className="block text-center bg-primary text-white py-2 px-4 mt-4 rounded-[15px] hover:bg-bg-3 hover:text-black border border-primary"
        >
          {t('signUp')}
        </Link>
      </form>
    </>
  );
}
