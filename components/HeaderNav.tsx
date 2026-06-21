'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, User as UserIcon } from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function HeaderNav() {
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Listen to AUTH_SUCCESS postMessage from popup window
  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'AUTH_SUCCESS') {
        // Reload parent window state
        window.location.reload();
      }
    };

    window.addEventListener('message', handleAuthMessage);
    return () => {
      window.removeEventListener('message', handleAuthMessage);
    };
  }, []);

  const openLoginPopup = (e: React.MouseEvent) => {
    e.preventDefault();
    const width = 480;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    window.open(
      '/auth',
      'Google Login',
      `width=${width},height=${height},top=${top},left=${left},status=no,menubar=no,toolbar=no,scrollbars=yes`
    );
  };

  const user = session?.user;

  return (
    <nav className="flex items-center gap-4 text-xs sm:text-sm font-bold">
      <Link
        href="/inbox"
        className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-150 transition-colors"
      >
        받은 선물함
      </Link>
      <span className="text-zinc-300 dark:text-zinc-700">|</span>
      <Link
        href="/sent"
        className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-150 transition-colors"
      >
        보낸 선물함
      </Link>

      {status === 'loading' ? (
        <div className="w-8 h-8 rounded-full border-2 border-zinc-350 border-t-transparent animate-spin" />
      ) : !user ? (
        <a
          href="/auth"
          onClick={openLoginPopup}
          className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 px-4 py-2 rounded-xl shadow-sm transition-all hover:scale-[1.02]"
        >
          로그인
        </a>
      ) : (
        /* User area: notification bell + profile dropdown */
        <div className="flex items-center gap-1">
          <NotificationBell />

          {/* User Profile Popover (Hover dropdown) */}
          <div
            className="relative group py-2"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button className="flex items-center gap-2 outline-none">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || 'User'}
                  className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 object-cover shadow-sm"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center border border-zinc-350 shadow-sm">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
              <span className="hidden sm:inline text-xs text-zinc-600 dark:text-zinc-400">
                {user.name || '사용자'}
              </span>
            </button>

            {/* Popover Dropdown (Reveals on hover) */}
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl py-2 invisible opacity-0 scale-95 group-hover:visible group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50 origin-top-right">
              <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800 text-left">
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                  {user.name || '사용자'}
                </p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
                  {user.email}
                </p>
              </div>
              <Link
                href="/profile"
                className="w-full text-left px-4 py-2.5 text-xs text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all flex items-center gap-1.5 font-bold border-b border-zinc-100 dark:border-zinc-800"
              >
                <UserIcon className="w-4 h-4 text-zinc-400" />
                <span>내 프로필 & 친구</span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full text-left px-4 py-2.5 text-xs text-red-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all flex items-center gap-1.5 font-bold"
              >
                <LogOut className="w-4 h-4" />
                <span>로그아웃</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
