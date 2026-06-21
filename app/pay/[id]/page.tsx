import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, ShieldCheck, Gift } from 'lucide-react';
import { fortuneServiceServer } from '../../../lib/fortuneServiceServer';
import FortuneCookieIcon from '../../../components/FortuneCookieIcon';
import PaymentButton from '../../../components/PaymentButton';

interface PayPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; status?: string }>;
}

export default async function PayPage({ params, searchParams }: PayPageProps) {
  const { id } = await params;
  const { error, status } = await searchParams;
  
  const message = await fortuneServiceServer.getMessage(id);

  if (!message) {
    notFound();
  }

  // If already paid, redirect straight to success page
  if (message.payment_status === 'paid') {
    redirect(`/success?id=${message.id}`);
  }

  let paymentAmount = 3000;
  let couponName = '☕ 커피 쿠폰';
  
  if (message.coupon_type === 'dessert') {
    paymentAmount = 4000;
    couponName = '🍰 디저트 쿠폰';
  } else if (message.coupon_type === 'meal') {
    paymentAmount = 5000;
    couponName = '🍜 식사 쿠폰';
  }

  // Display message preview (first 50 characters)
  const messagePreview = message.message_content.length > 50 
    ? `${message.message_content.slice(0, 50)}...`
    : message.message_content;

  const isFailed = status === 'fail' || error;

  return (
    <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 py-12 px-6">
      <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <Link href="/create" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-extrabold text-sm text-zinc-800 dark:text-zinc-200">주문서 확인 및 결제</span>
          <div className="w-5" />
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isFailed && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 p-4 rounded-2xl text-xs text-red-600 dark:text-red-400 font-bold leading-relaxed">
              ⚠️ 결제에 실패하였습니다. 다시 시도해 주세요. {error && `(${error})`}
            </div>
          )}

          {/* Cookie Info Card */}
          <div className="flex flex-col items-center justify-center py-6 text-center bg-zinc-100/50 dark:bg-zinc-800/20 rounded-2xl border border-zinc-200 dark:border-zinc-800/50">
            <div className="w-16 h-16 bg-zinc-200/60 dark:bg-zinc-700/60 flex items-center justify-center rounded-2xl mb-4">
              <FortuneCookieIcon className="w-10 h-10" fill="url(#payGoldGradient)" />
              <svg width="0" height="0">
                <defs>
                  <linearGradient id="payGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FDE68A" />
                    <stop offset="50%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#D97706" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h2 className="font-extrabold text-lg text-zinc-800 dark:text-zinc-100">포춘쿠키 준비 완료!</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-[240px] break-keep">
              {message.sender_nickname || '익명'} 님이 {message.receiver_name || '친구'} 님에게 보낼 행운의 포춘쿠키입니다.
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-150 dark:border-zinc-800/80 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">주문 정보</h3>
            
            <div className="space-y-3 divide-y divide-zinc-100 dark:divide-zinc-800/60 text-sm">
              <div className="pb-3 space-y-1">
                <span className="text-zinc-400 dark:text-zinc-500 text-xs font-bold">메시지 내용 미리보기</span>
                <p className="text-zinc-700 dark:text-zinc-300 text-xs italic bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 leading-relaxed">
                  "{messagePreview}"
                </p>
              </div>

              <div className="pt-3 flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-zinc-400" />
                  동봉된 선물
                </span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg text-xs">
                  {couponName}
                </span>
              </div>

              <div className="pt-3 flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">결제 금액</span>
                <span className="font-black text-base text-zinc-900 dark:text-zinc-100">
                  {paymentAmount.toLocaleString()} 원
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2.5 items-center bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed border border-zinc-200/50 dark:border-zinc-800/80">
            <ShieldCheck className="w-6 h-6 text-zinc-400 shrink-0" />
            <span>토스페이먼츠의 보안 결제망을 사용합니다. 결제가 완료되면 행운 메시지를 보낼 수 있는 페이지가 발급됩니다.</span>
          </div>

          {/* Toss Payment Button Trigger */}
          <PaymentButton
            messageId={message.id}
            amount={paymentAmount}
            orderName={`${message.receiver_name || '친구'}님을 위한 행운 포춘쿠키`}
            senderName={message.sender_nickname || '익명'}
          />
        </div>
      </div>
    </div>
  );
}
