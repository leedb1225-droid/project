'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Bell, BellRing } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

export default function NotificationBell() {
  const router = useRouter();
  const { unreadCount, hasNewNotif } = useNotifications();

  return (
    <div className="relative" id="notification-bell">
      {/* Bell Button */}
      <button
        onClick={() => router.push('/notifications')}
        className="relative p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 cursor-pointer"
        aria-label={`알림 ${unreadCount > 0 ? `(${unreadCount}개 읽지 않음)` : ''}`}
        id="notification-bell-button"
      >
        {hasNewNotif ? (
          <BellRing
            className="w-5 h-5 text-amber-500"
            style={{ animation: 'bellRing 0.5s ease-in-out 3' }}
          />
        ) : (
          <Bell
            className={`w-5 h-5 transition-colors ${
              unreadCount > 0
                ? 'text-amber-500'
                : 'text-zinc-500 dark:text-zinc-400'
            }`}
          />
        )}

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-sm animate-pulse-once">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <style jsx>{`
        @keyframes bellRing {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-15deg); }
          60% { transform: rotate(15deg); }
        }
        @keyframes pulseOnce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.25); }
        }
        :global(.animate-pulse-once) {
          animation: pulseOnce 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}
