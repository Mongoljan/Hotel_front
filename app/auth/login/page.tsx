'use client';

import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { schemaLogin } from '../../schema';
import { z } from 'zod';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { HiEye, HiEyeSlash } from 'react-icons/hi2';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';  // Import js-cookie
import Link from 'next/link';

type FormFields = z.infer<typeof schemaLogin>;

export default function LoginPage() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    resolver: zodResolver(schemaLogin),
  });
  useEffect(() => {
    // Check if user is already logged in
    const token = Cookies.get('jwtToken');
    const userType = Cookies.get('userType');

    if (token) {
      // Redirect based on user type
      if (userType === 'Owner') {
        router.push('/admin/dashboard');
      } else if (userType === 'SuperAdmin') {
        router.push('/superadmin/dashboard');
      }
    }
  }, [router]);


  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      const requestBody = {
        user_mail: data.email,
        user_pass: data.password,
      };
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      if (response.ok) {
        const responseData = await response.json();
  
        // Fetch user types
        const userTypesResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user-type/`);
        const userTypes = await userTypesResponse.json();
  
        // Map user_type to the correct user role name
        const userType = userTypes.find((type: { pk: number; name: string; }) => type.pk === responseData.user_type)?.name;

  
        if (!userType) {
          throw new Error("Unable to determine user type.");
        }
  
        // Store token and userType in cookies
        Cookies.set('jwtToken', responseData.token, {
          expires: 0.02083,  // Set expiration as desired
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Strict',
        });
  
        Cookies.set('userType', userType, {
          expires: 0.02083, 
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Strict',
        });
        Cookies.set('hotelName', responseData.hotel_name, {
          expires: 0.02083,  // 1 day expiration
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Strict',
        });
        Cookies.set('pk', responseData.pk, {
          expires: 0.02083,  // 1 day expiration
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Strict',
        });
  
        toast.success('Login successful!');
  
        // Redirect based on user type
        if (userType === 'Owner') {
          router.push('/admin/dashboard');
        }  if (userType === 'SuperAdmin') {
          router.push('/superadmin/dashboard');
        } 
      } else {
        const errorData = await response.json();
        if (response.status === 403) {
          // Handle 403 Forbidden error specifically
          toast.error('Access denied. Your request is pending.');
        } else {
          toast.error(errorData.message || 'Login failed. Please check your input.');
        }
      }
    } catch (error) {
      toast.error('An unexpected error occurred during login');
      console.error('Error during login:', error);
    }
  };
  
  

  return (
    <div className="flex  justify-center items-center min-h-screen h-full py-[100px]  rounded-[12px]">
      <ToastContainer />
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-10 px-10 max-w-[600px] md:min-w-[440px] min-w-[250px] border-primary border-solid border-[1px] rounded-[15px]  text-gray-600"
      >
        <h2 className="text-[30px] font-bold mx-auto text-center text-black  mb-10">Нэвтрэх</h2>


        <div className="text-black">И-мэйл хаяг</div>
        <input
          type="email"
          placeholder=""
          {...register('email')}
          className="border border-soft p-4 w-full mb-6 h-[45px] rounded-[15px]"
          required
        />
        {errors.email && <div className="text-red-500">{errors.email.message}</div>}
<div className="text-black">Нууц үг</div>
        <div className="relative">
          <input
            type={isPasswordVisible ? 'text' : 'password'}
            placeholder=""
            {...register('password')}
            className="border p-4 w-full mb-2 h-[45px] border-soft rounded-[15px]"
            required
          />
          <button
            type="button"
            className="absolute  right-3 top-2"
            onClick={() => setIsPasswordVisible((prev) => !prev)}
          >
            {isPasswordVisible ? <HiEye className="center mt-2" size={20} /> : <HiEyeSlash  className="place-content-center mt-2" size={20} />}
          </button>
        </div>
        <div className="flex justify-between text-black ">
        <Link
            className=" ml-[4px] hover:text-blue-300"
            href={"/auth/resetpassword"}
          >
           Намайг сана
          </Link>

        <Link
            className=" ml-[4px] hover:text-blue-300"
            href={"/auth/resetpassword"}
          >
            Нууц үг мартсан?
          </Link>
          </div>

        {errors.password && <div className="text-red-500">{errors.password.message}</div>}
        

        <button
          type="submit"
          className="w-full border-primary border-solid border-[1px] hover:bg-bg  mt-[50px] hover:bg text-black py-2 px-4 font-semibold rounded-[15px]"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Түр хүлээнэ үү...' : 'Нэвтрэх'}
        </button>
    
        <Link
            className=" block text-center bg-primary w-full  hover:bg text-white py-2 px-4 font-semibold rounded-[15px] mt-[20px]  hover:bg-bg-3 hover:text-black border-primary border-solid border-[1px] hover:border-primary hover:border-solid hover:border-[1px]"
            href={"/auth/register"}
          >
       
            Бүртгүүлэх
          
          </Link>
       
      
        {errors.root && <div className="text-red-500 mt-2">{errors.root.message}</div>}
      </form>
    </div>
  );
}
