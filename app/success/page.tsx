'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Copy, Share2, Check, ArrowRight, Home, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';

function SuccessContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (id) {
      setShareUrl(`${window.location.origin}/open/${id}`);
    }
    
    // Spray success confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, [id]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
      alert('링크 복사에 실패했습니다. 직접 복사해 주세요: ' + shareUrl);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '행운의 포춘쿠키가 도착했어요!',
          text: '소중한 메시지가 담긴 포춘쿠키를 깨뜨려 확인해보세요 🥠✨',
          url: shareUrl,
        });
      } catch (e) {
        console.error(e);
      }
    } else {
      handleCopy();
      alert('공유하기를 지원하지 않는 브라우저입니다. 링크가 클립보드에 복사되었습니다!');
    }
  };

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 py-12 px-6">
      <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl overflow-hidden text-center p-8 space-y-6">
        
        {/* Success Icon */}
        <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center text-3xl shadow-inner animate-pulse">
          🎉
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-zinc-800 dark:text-zinc-100">결제 완료! 쿠키 굽기 성공</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 break-keep">
            이제 아래 링크를 친구에게 공유하여 포춘쿠키를 깨뜨려보게 하세요.
          </p>
        </div>

        {/* Shareable Link Box */}
        <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/80 flex flex-col gap-3">
          <div className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-left">
            행운의 공유 링크
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 rounded-xl text-left select-all">
            <span className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold truncate flex-grow">
              {shareUrl || '로딩 중...'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopy}
              className="py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">복사 완료!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-zinc-500" />
                  <span>링크 복사</span>
                </>
              )}
            </button>
            <button
              onClick={handleShare}
              className="py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              <span>친구에게 공유</span>
            </button>
          </div>
        </div>

        {/* Action Options */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-2">
          {id && (
            <Link
              href={`/open/${id}`}
              className="py-3.5 px-4 bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-1.5"
            >
              <span>내가 보낸 쿠키 미리 개봉해보기</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}
          
          <Link
            href="/"
            className="py-3.5 px-4 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 font-bold text-sm transition-all duration-300 flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>메인으로 가기</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-zinc-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
