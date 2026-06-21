'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import FortuneCookieIcon from '../../components/FortuneCookieIcon';

function AuthContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle post-login: if session exists and this page opened as a popup, notify parent
  useEffect(() => {
    if (session) {
      if (window.opener) {
        window.opener.postMessage({ type: 'AUTH_SUCCESS' }, window.location.origin);
        window.close();
      } else {
        window.location.href = '/';
      }
    }
  }, [session]);

  const handleGoogleLogin = () => {
    setLoading(true);
    setErrorMsg('');
    // Google OAuth must redirect — pass callbackUrl back to /auth so the popup can send AUTH_SUCCESS
    signIn('google', { callbackUrl: window.location.href });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center select-none font-sans">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl p-8 space-y-8 relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-zinc-150 dark:bg-zinc-800/10 rounded-full blur-2xl -z-10" />

        {/* Brand logo */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center shadow-inner">
            <FortuneCookieIcon className="w-10 h-10" fill="url(#authGoldGradient)" />
            <svg width="0" height="0">
              <defs>
                <linearGradient id="authGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FDE68A" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="text-xl font-black text-zinc-900 dark:text-zinc-50 pt-2">온라인 포춘쿠키 로그인</h1>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-[200px] break-keep">
            소중한 마음을 배달하기 위해 구글 인증을 완료해주세요.
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            disabled={loading || status === 'loading'}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-200 font-extrabold text-sm py-3.5 px-4 rounded-2xl shadow-sm transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            <span>Google 계정으로 계속하기</span>
          </button>

          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-500 text-xs rounded-xl border border-red-100 dark:border-red-900/50">
              {errorMsg}
            </div>
          )}
        </div>

        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center leading-normal">
          로그인을 진행하면 개인정보취급방침 및 서비스 이용약관에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6">
        <div className="w-8 h-8 border-4 border-zinc-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
