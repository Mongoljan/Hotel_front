import { getTranslations } from 'next-intl/server';
import LoginForm from './LoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LoginPage() {
  const t = await getTranslations('AuthLogin');
  const tFooter = await getTranslations('Footer');
  const year = new Date().getFullYear();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900">
      <div className="flex min-h-[calc(100vh-4rem)] items-start justify-center px-4 pb-16 pt-16">
        <div className="w-full max-w-lg space-y-6">
          <Card className="gap-6 rounded-xl border-gray-200 bg-white p-8 shadow-md dark:border-gray-700 dark:bg-gray-800">
            <CardHeader className="space-y-1 p-0 text-center">
              <CardTitle className="text-2xl font-bold leading-8 text-gray-900 dark:text-white">{t('subtitle')}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <LoginForm />
            </CardContent>
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {tFooter('copyright', { year })}
            </p>
          </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
