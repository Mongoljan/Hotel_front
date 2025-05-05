import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';

const LoginForm = dynamic(() => import('./LoginForm'), { ssr: false });

export default function LoginPage() {
  const t = useTranslations('AuthLogin');

  return (
    <div className="flex justify-center items-center min-h-screen py-[100px]">
      <LoginForm  />
    </div>
  );
}
