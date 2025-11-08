import React from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@tb/ui';
import { useAuth } from '../providers/auth-provider';

type LoginForm = {
  email: string;
  password: string;
};

export const LoginPage: React.FC = () => {
  const { login, loginError, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = (location.state as { from?: Location })?.from?.pathname ?? '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = React.useCallback(
    async (values: LoginForm) => {
      try {
        await login(values);
        navigate(redirectPath, { replace: true });
      } catch {
        // Error handled via context state
      }
    },
    [login, navigate, redirectPath],
  );

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  const disabled = isSubmitting || isLoading;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <Card className="w-full max-w-md border border-white/10 bg-slate-950/80 backdrop-blur">
        <CardHeader>
          <CardTitle>Вход в админ-панель</CardTitle>
          <CardDescription>Используйте корпоративные учетные данные администратора.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@tb.group"
                autoComplete="email"
                {...register('email', { required: 'Укажите email' })}
              />
              {errors.email ? <p className="text-xs text-rose-400">{errors.email.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register('password', { required: 'Введите пароль' })}
              />
              {errors.password ? (
                <p className="text-xs text-rose-400">{errors.password.message}</p>
              ) : null}
            </div>
            {loginError ? (
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                {loginError}
              </div>
            ) : null}
            <Button type="submit" className="w-full" disabled={disabled}>
              {disabled ? 'Входим…' : 'Войти'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
