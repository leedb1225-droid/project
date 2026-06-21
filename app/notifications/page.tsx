'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useNotifications, Notification } from '../../hooks/useNotifications';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, CheckCheck, Calendar, ChevronRight, AlertCircle, X, ArrowLeft, RefreshCw, Clock
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const COUPON_EMOJI: Record<string, string> = {
  coffee: '☕',
  dessert: '🍰',
  meal: '🍜',
};

const COUPON_NAME: Record<string, string> = {
  coffee: '커피 쿠폰',
  dessert: '디저트 쿠폰',
  meal: '식사 쿠폰',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '방금 전';
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { 
    notifications, unreadCount, isLoading, markAsRead, markAllAsRead, refetch 
  } = useNotifications();

  // Force refetch on mount to have freshest data
  useEffect(() => {
    if (session) {
      refetch();
    }
  }, [session, refetch]);

  if (status === 'loading') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[450px]">
        <div className="w-10 h-10 border-4 border-zinc-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">알림창 로딩 중...</span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl p-8 space-y-6">
          <div className="w-16 h-16 bg-amber-50/15 dark:bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto text-3xl">
            🔔
          </div>
          <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">로그인이 필요한 페이지입니다</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 break-keep">
            받은 포춘쿠키 알림 기록을 확인하시려면 로그인이 필요합니다.
          </p>
          <button
            onClick={() => router.push('/auth')}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 font-bold py-3.5 px-6 rounded-2xl shadow transition-all"
          >
            로그인하러 가기
          </button>
        </div>
      </div>
    );
  }

  const handleNotificationClick = async (n: Notification) => {
    await markAsRead(n.id);
    router.push(`/open/${n.message_id}`);
  };

  return (
    <div className="flex-1 bg-gradient-to-tr from-zinc-50/60 via-zinc-100/30 to-amber-50/20 dark:from-zinc-950 dark:via-zinc-900/60 dark:to-zinc-950 py-12 px-6 sm:px-12">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" />
            <span>홈으로</span>
          </Link>
          <div className="flex items-center gap-2">
            <button 
              onClick={refetch}
              className="p-2 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 transition-colors"
              title="새로고침"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-zinc-450 hover:text-zinc-700 dark:hover:text-zinc-200 font-extrabold flex items-center gap-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl shadow-sm transition-all"
              >
                <CheckCheck className="w-4 h-4" />
                <span>모두 읽음</span>
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-amber-700 dark:text-amber-300 uppercase tracking-widest bg-amber-100/60 dark:bg-amber-950/40 border border-amber-200/40 px-3.5 py-1 rounded-full shadow-sm">
            <Bell className="w-3.5 h-3.5" />
            NOTIFICATION HUB
          </span>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 pt-1">
            내 알림 보관함 🔔
          </h1>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
            나에게 온 포춘쿠키 선물 알림을 확인하고 해당 페이지로 이동할 수 있습니다.
          </p>
        </div>

        {/* List Content */}
        {isLoading && notifications.length === 0 ? (
          <div className="py-24 flex justify-center">
            <div className="w-8 h-8 border-4 border-zinc-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl py-24 text-center space-y-4 shadow-sm">
            <div className="text-5xl opacity-40">🔔</div>
            <h3 className="font-bold text-zinc-700 dark:text-zinc-350 text-base">아직 알림이 없어요</h3>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden">
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <AnimatePresence mode="popLayout">
                {notifications.map((n, index) => {
                  const emoji = COUPON_EMOJI[n.coupon_type] || '🥠';
                  const name = COUPON_NAME[n.coupon_type] || '포춘쿠키';
                  const isUnread = !n.is_read;

                  return (
                    <motion.li
                      key={n.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                    >
                      <button
                        onClick={() => handleNotificationClick(n)}
                        className={`w-full text-left p-5 flex items-start gap-4 transition-all duration-150 group outline-none ${
                          isUnread 
                            ? 'bg-amber-50/30 dark:bg-amber-950/5 hover:bg-amber-50/50 dark:hover:bg-amber-950/10' 
                            : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                        }`}
                      >
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-sm border transition-all ${
                          isUnread
                            ? 'bg-amber-100 dark:bg-amber-900/40 border-amber-200/50 dark:border-amber-900/30 text-amber-500'
                            : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-400'
                        }`}>
                          {emoji}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                              Fortune Message
                            </span>
                            {isUnread && (
                              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                            )}
                          </div>
                          
                          <p className={`text-sm leading-relaxed break-keep ${
                            isUnread
                              ? 'font-bold text-zinc-800 dark:text-zinc-50'
                              : 'font-semibold text-zinc-650 dark:text-zinc-400'
                          }`}>
                            <span className="text-amber-600 dark:text-amber-400 font-extrabold">
                              {n.sender_nickname || '익명'}
                            </span>
                            님이 {name}이 담긴 포춘쿠키를 보냈어요! 🥠
                          </p>

                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-zinc-355" />
                            <span>{timeAgo(n.created_at)}</span>
                          </p>
                        </div>

                        {/* Action link */}
                        <div className="flex-shrink-0 self-center text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}
