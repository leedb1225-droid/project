'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, MessageCircle, AlertCircle, Home, RotateCcw, Share2 } from 'lucide-react';
import { fortuneService, FortuneMessage } from '../../../lib/fortuneService';
import CookieAnimation from '../../../components/CookieAnimation';

interface OpenPageProps {
  params: Promise<{ id: string }>;
}

export default function OpenCookie({ params }: OpenPageProps) {
  const { id } = use(params);
  const router = useRouter();
  
  const [message, setMessage] = useState<FortuneMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpened, setIsOpened] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isLocked: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isLocked: false });

  useEffect(() => {
    if (!message?.unlock_at) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(message.unlock_at!) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLocked: false });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isLocked: true,
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [message]);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const data = await fortuneService.getMessage(id);
        if (data) {
          setMessage(data);
          setIsOpened(data.is_opened);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessage();
  }, [id]);

  const handleOpenComplete = async () => {
    setIsOpened(true);
    try {
      await fortuneService.markAsOpened(id);
    } catch (e) {
      console.error('Failed to mark as opened', e);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-zinc-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">행운쿠키 가져오는 중...</span>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">포춘쿠키를 찾을 수 없습니다</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 break-keep">
          존재하지 않거나 삭제된 포춘쿠키입니다. 링크를 다시 확인해주세요.
        </p>
        <Link href="/" className="py-2.5 px-6 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-bold shadow transition-all">
          홈으로 이동
        </Link>
      </div>
    );
  }

  if (message.payment_status !== 'paid') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-4xl shadow-inner mb-2">
          🥠
        </div>
        <h1 className="text-xl font-extrabold text-zinc-800 dark:text-zinc-100">결제가 완료되지 않은 쿠키입니다</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 break-keep">
          이 쿠키는 굽기 비용 결제가 진행 중이거나 완료되지 않았습니다. 보내신 분이 결제를 완료하면 열 수 있어요!
        </p>
        <div className="flex gap-2 w-full pt-4">
          <Link href={`/pay/${id}`} className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 rounded-xl text-sm font-bold shadow transition-all">
            결제하러 가기
          </Link>
          <Link href="/" className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl text-sm font-bold transition-all">
            홈으로 가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background text-foreground py-12 px-6 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-pink-300/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-rose-450/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md text-center space-y-6 relative z-10">
        
        {/* Header Title */}
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-primary uppercase tracking-widest bg-pink-100/60 border border-pink-200/40 px-3.5 py-1 rounded-full shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            행운 배달 완료
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground pt-1 leading-tight break-keep">
            {message.receiver_name} 님에게 도착한<br/>
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">행운의 포춘쿠키</span>
          </h1>
          <div className="flex items-center justify-center gap-1.5 text-xs text-foreground/75 font-semibold">
            <span>보낸 사람:</span>
            <span className="text-primary font-bold bg-white border border-pink-100 px-2.5 py-0.5 rounded-lg shadow-sm">
              {message.sender_nickname || '익명'}
            </span>
          </div>
        </div>

        {/* Animation Container */}
        <div className="bg-white border border-pink-100 rounded-3xl shadow-2xl p-4 overflow-hidden relative min-h-[420px] flex items-center justify-center transition-all duration-500">
          {timeLeft.isLocked ? (
            <div className="flex flex-col items-center justify-center text-center space-y-6 py-6 w-full animate-in fade-in duration-500">
              {/* Glowing Aura */}
              <div className="absolute w-40 h-40 bg-pink-300 rounded-full blur-3xl opacity-10 animate-pulse" />
              
              {/* Locked Graphic */}
              <div className="relative w-36 h-36 bg-pink-50 border border-pink-100 rounded-full flex items-center justify-center shadow-inner">
                <span className="text-6xl animate-bounce">🔒</span>
                <span className="absolute -top-1 -right-1 text-2xl">⏳</span>
              </div>

              {/* Countdown Numbers */}
              <div className="space-y-2 relative z-10">
                <div className="text-[10px] font-black text-primary uppercase tracking-widest bg-pink-100/60 px-3 py-1 rounded-full border border-pink-200/40 inline-block">
                  타임캡슐 개봉 대기 중
                </div>
                <h3 className="text-lg font-bold text-foreground break-keep">
                  이 쿠키는 지정된 약속 날짜에 열 수 있어요!
                </h3>
                <p className="text-xs text-foreground/75 font-semibold">
                  {new Date(message.unlock_at!).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  })}에 개봉 가능
                </p>
              </div>

              {/* Countdown Timer Blocks */}
              <div className="grid grid-cols-4 gap-2 w-full max-w-xs pt-2">
                {[
                  { value: timeLeft.days, label: '일' },
                  { value: timeLeft.hours, label: '시간' },
                  { value: timeLeft.minutes, label: '분' },
                  { value: timeLeft.seconds, label: '초' },
                ].map((block, idx) => (
                  <div key={idx} className="bg-gradient-to-b from-white to-pink-50/50 border border-pink-100 rounded-2xl p-2.5 shadow-sm flex flex-col items-center">
                    <span className="text-xl font-bold text-primary tabular-nums">
                      {String(block.value).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] text-foreground/60 font-semibold mt-1">
                      {block.label}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-foreground/60 leading-normal max-w-xs break-keep">
                💡 보낸 분이 지정한 미래의 소중한 약속 날짜가 될 때까지 포춘쿠키가 안전하게 보관됩니다. 그날까지 조금만 기다려주세요!
              </p>
            </div>
          ) : (
            <CookieAnimation
              message={message.message_content}
              senderName={message.sender_nickname || '익명'}
              skin={message.cookie_skin}
              onOpenComplete={handleOpenComplete}
            />
          )}
        </div>

        {/* Post-Opening Call to Actions */}
        {isOpened && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-500">
            {/* Show reply summary if they already replied */}
            {message.reply ? (
              <div className="backdrop-blur-sm bg-amber-50/20 dark:bg-amber-950/5 border border-amber-200/30 dark:border-amber-900/20 p-5 rounded-2xl text-left space-y-2.5 shadow-sm">
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-wider">
                  <MessageCircle className="w-3.5 h-3.5 text-amber-500" />
                  내가 전한 따뜻한 답장
                </div>
                <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 break-keep leading-relaxed bg-white/60 dark:bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-105 dark:border-zinc-800/50 shadow-inner">
                  "{message.reply}"
                </p>
              </div>
            ) : (
              <button
                onClick={() => router.push(`/reply/${id}`)}
                className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-extrabold rounded-2xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/25 transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                <MessageCircle className="w-5 h-5 shrink-0" />
                보낸 분에게 따뜻한 답장 보내기
              </button>
            )}

            <button
              onClick={handleShare}
              className="w-full py-3.5 px-6 bg-white hover:bg-zinc-50 dark:bg-zinc-850 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/85 text-zinc-750 dark:text-zinc-250 font-bold rounded-2xl shadow-sm transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              <Share2 className="w-4 h-4 text-pink-500 shrink-0" />
              <span>{copied ? '링크 복사 완료! 🥠' : '이 특별한 순간 공유하기 (링크 복사)'}</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/create"
                className="py-3.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 font-bold rounded-2xl text-sm transition-all duration-300 flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.01]"
              >
                <span>🥠 나도 쿠키 굽기</span>
              </Link>
              <Link
                href="/"
                className="py-3.5 px-4 bg-white/50 hover:bg-white/80 dark:bg-zinc-800/40 dark:hover:bg-zinc-800/65 border border-zinc-200/50 dark:border-zinc-700/50 text-zinc-700 dark:text-zinc-300 font-bold rounded-2xl text-sm transition-all duration-300 flex items-center justify-center gap-1.5 shadow-sm hover:scale-[1.01]"
              >
                <Home className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>메인화면</span>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
