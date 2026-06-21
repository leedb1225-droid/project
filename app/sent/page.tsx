'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, Calendar, ArrowLeft, RefreshCw, Lock, Unlock
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface FortuneMessage {
  id: string;
  sender_nickname?: string;
  sender_email?: string | null;
  receiver_name?: string;
  receiver_email?: string | null;
  receiver_phone?: string | null;
  message_content: string;
  coupon_type: string;
  payment_status: 'pending' | 'paid';
  is_opened: boolean;
  opened_at?: string | null;
  reply?: string | null;
  replied_at?: string | null;
  is_public: boolean;
  likes: number;
  created_at: string;
  cookie_skin?: string | null;
  unlock_at?: string | null;
}

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

const COUPON_COLOR: Record<string, string> = {
  coffee: 'from-amber-100 to-orange-100 text-amber-600 border-amber-200/50',
  dessert: 'from-pink-100 to-rose-100 text-rose-600 border-rose-200/50',
  meal: 'from-blue-100 to-indigo-100 text-blue-600 border-blue-200/50',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function SentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [messages, setMessages] = useState<FortuneMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unopened' | 'opened'>('all');

  const fetchSent = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/messages/sent');
      if (res.ok) {
        const data = await res.json();
        setMessages(data || []);
      }
    } catch (e) {
      console.error('Error fetching sent messages:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchSent();
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[450px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-sm font-semibold text-foreground/60">보낸 선물함 불러오는 중...</span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex-1 bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white border border-pink-100 rounded-3xl shadow-xl p-8 space-y-6">
          <div className="w-16 h-16 bg-pink-50/50 text-primary rounded-2xl flex items-center justify-center mx-auto text-3xl">
            🥠
          </div>
          <h1 className="text-xl font-bold text-foreground">로그인이 필요한 페이지입니다</h1>
          <p className="text-sm text-foreground/70 break-keep">
            내가 보낸 포춘쿠키와 선물(쿠폰) 목록을 확인하시려면 로그인이 필요합니다.
          </p>
          <button
            onClick={() => router.push('/auth')}
            className="w-full bg-primary hover:bg-pink-600 text-white font-bold py-3.5 px-6 rounded-2xl shadow transition-all cursor-pointer"
          >
            로그인하러 가기
          </button>
        </div>
      </div>
    );
  }

  const filteredMessages = messages.filter(m => {
    if (filter === 'unopened') return !m.is_opened;
    if (filter === 'opened') return m.is_opened;
    return true;
  });

  return (
    <div className="flex-1 bg-gradient-to-tr from-[#FFF5E1] via-white to-pink-50/40 py-12 px-6 sm:px-12">
      <div className="max-w-3xl mx-auto w-full space-y-6">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <Link href="/" className="text-foreground/60 hover:text-primary transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" />
            <span>홈으로</span>
          </Link>
          <button 
            onClick={fetchSent}
            className="p-2 text-foreground/45 hover:text-primary transition-colors cursor-pointer"
            title="새로고침"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Title Section */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest bg-pink-50 border border-pink-100 px-3.5 py-1 rounded-full shadow-sm">
            <Gift className="w-3.5 h-3.5" />
            MY SENT COOKIES
          </span>
          <h1 className="text-3xl font-black tracking-tight text-foreground pt-1">
            내가 보낸 선물 & 메시지 🎁
          </h1>
          <p className="text-xs text-foreground/70 font-medium">
            친구들에게 선물한 포춘쿠키 목록과 상대방의 답장 내용을 확인할 수 있습니다.
          </p>
        </div>

        {/* Tabs / Filters */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-pink-100 shadow-sm gap-2">
          {[
            { id: 'all', label: '전체 보기', count: messages.length },
            { id: 'unopened', label: '미개봉 상태', count: messages.filter(m => !m.is_opened).length },
            { id: 'opened', label: '상대방이 읽음', count: messages.filter(m => m.is_opened).length },
          ].map((tab) => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all outline-none cursor-pointer ${
                  isActive 
                    ? 'bg-primary text-white shadow-md scale-[1.01]' 
                    : 'text-foreground/50 hover:text-primary hover:bg-pink-50/20'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-pink-50 text-primary'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sent Messages List */}
        {loading ? (
          <div className="py-24 flex justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="bg-white border border-pink-100 rounded-3xl py-20 text-center space-y-4 shadow-sm">
            <div className="text-5xl opacity-40">🥠</div>
            <h3 className="font-bold text-foreground/80 text-base">보낸 편지가 아직 없어요</h3>
            <button 
              onClick={() => router.push('/create')}
              className="py-2.5 px-5 bg-primary hover:bg-pink-650 text-white rounded-xl text-xs font-extrabold transition-all shadow-sm cursor-pointer"
            >
              친구에게 쿠키 보내기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredMessages.map((msg, index) => {
                const isUnopened = !msg.is_opened;
                const emoji = COUPON_EMOJI[msg.coupon_type] || '🥠';
                const name = COUPON_NAME[msg.coupon_type] || '포춘쿠키';
                const colorClass = COUPON_COLOR[msg.coupon_type] || '';

                // Time Capsule checking
                const isTimeCapsule = !!msg.unlock_at;
                const unlockTime = isTimeCapsule ? new Date(msg.unlock_at!).getTime() : 0;
                const now = Date.now();
                const isLocked = isTimeCapsule && unlockTime > now;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.25, delay: index * 0.05 }}
                    className="bg-white border border-pink-100 rounded-3xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
                  >
                    <div className="p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                      {/* Left: Info card & Icon */}
                      <div className="flex gap-4 items-center">
                        <div className={`w-14 h-14 rounded-2xl border border-pink-100 flex items-center justify-center text-3xl shadow-inner bg-gradient-to-tr ${colorClass}`}>
                          {emoji}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-foreground/40">To.</span>
                            <span className="font-extrabold text-sm text-foreground bg-pink-50/30 border border-pink-100 px-2 py-0.5 rounded-lg shadow-sm">
                              {msg.receiver_name || '받는 사람'}
                            </span>
                            {msg.receiver_phone && (
                              <span className="text-[10px] text-foreground/50 font-bold bg-zinc-50 border border-zinc-150 px-1.5 py-0.5 rounded">
                                {msg.receiver_phone}
                              </span>
                            )}
                            
                            {/* Locked Timer status */}
                            {isLocked ? (
                              <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                <Lock className="w-2.5 h-2.5" />
                                타임캡슐 잠김 ⏳
                              </span>
                            ) : isUnopened ? (
                              <span className="inline-flex items-center gap-1 text-[9px] font-black text-primary bg-pink-50 border border-pink-100 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                                미개봉 🥠
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[9px] font-black text-zinc-500 bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                <Unlock className="w-2.5 h-2.5 text-zinc-400" />
                                읽음 🔓
                              </span>
                            )}
                          </div>
                          <h3 className="font-black text-base text-foreground">{name}</h3>
                          <div className="flex items-center gap-1.5 text-[10px] text-foreground/55 font-semibold">
                            <Calendar className="w-3.5 h-3.5 text-primary/60" />
                            <span>{formatDate(msg.created_at)} 보냄</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Capsule Info / Opened Time */}
                      <div className="w-full sm:w-auto text-right text-xs">
                        {isLocked && msg.unlock_at && (
                          <p className="text-[10px] text-amber-600 font-bold bg-amber-50 border border-amber-100 px-2.5 py-1.5 rounded-xl inline-block text-left">
                            📅 {formatDate(msg.unlock_at)} 00:00 개봉 가능
                          </p>
                        )}
                        {!isUnopened && msg.opened_at && (
                          <span className="text-[10px] text-foreground/50 font-semibold block">
                            🔓 {formatDate(msg.opened_at)}에 읽음
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expand card body: Message content + Reply content */}
                    <div className="px-6 pb-6 pt-1 border-t border-pink-100/50 space-y-4">
                      {/* Quote Message sent */}
                      <div className="relative p-4 bg-gradient-to-r from-white to-pink-50/30 border border-pink-100/80 rounded-2xl shadow-inner">
                        <div className="absolute top-2 right-3 text-[10px] font-black text-primary/30 uppercase tracking-widest">
                          내가 보낸 메시지
                        </div>
                        <p className="text-foreground text-sm font-bold leading-relaxed break-keep pt-1.5">
                          "{msg.message_content}"
                        </p>
                      </div>

                      {/* Reply block */}
                      {msg.reply ? (
                        <div className="flex gap-2.5 items-start pl-4 border-l-2 border-primary">
                          <div className="space-y-1.5 w-full">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-primary uppercase tracking-widest block">상대방의 답장 💌</span>
                              {msg.replied_at && (
                                <span className="text-[9px] text-foreground/40 font-semibold">
                                  {formatDate(msg.replied_at)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-extrabold text-foreground/75 bg-pink-50/20 p-3 rounded-xl border border-pink-100/40 break-keep">
                              "{msg.reply}"
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-left pl-4 border-l border-zinc-200 text-foreground/45 text-[11px] font-semibold italic">
                          💡 상대방이 아직 답장을 보내지 않았습니다.
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
}
