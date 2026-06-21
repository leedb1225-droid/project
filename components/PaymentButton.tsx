'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CreditCard, Sparkles, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { loadTossPayments, ANONYMOUS, clearTossPayments } from '@tosspayments/tosspayments-sdk';

interface PaymentButtonProps {
  messageId: string;
  amount: number;
  orderName: string;
  senderName: string;
}

export default function PaymentButton({ messageId, amount, orderName, senderName }: PaymentButtonProps) {
  console.log('PaymentButton Rendered! messageId:', messageId, 'amount:', amount);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [sdkInstance, setSdkInstance] = useState<any>(null);
  const sdkInitialized = useRef(false);

  useEffect(() => {
    if (sdkInitialized.current) return;
    sdkInitialized.current = true;

    // Clear sessionStorage on mount to wipe out any cached Toss session data
    if (typeof window !== 'undefined') {
      try {
        console.log('Clearing sessionStorage on mount to reset checkout states...');
        sessionStorage.clear();
      } catch (e) {
        console.error('Failed to clear sessionStorage:', e);
      }
    }

    async function initTossSDK() {
      try {
        const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_Poxy1XQL8RwlGXWO4Po937nO5Wml';
        console.log('Preloading Toss SDK V2 client-side with key:', clientKey);
        const instance = await loadTossPayments(clientKey);
        if (instance) {
          setSdkInstance(instance);
          console.log('Toss Payments SDK V2 preloaded successfully.');
        }
      } catch (err) {
        console.error('Failed to preload Toss SDK V2:', err);
      }
    }
    initTossSDK();

    return () => {
      // Clear SDK scripts and global variable on unmount to clean up state
      try {
        console.log('Cleaning up Toss SDK on unmount...');
        clearTossPayments();
      } catch (e) {
        console.error('Failed to clean up Toss SDK on unmount:', e);
      }
    };
  }, []);
  
  // Form States
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  
  // Errors States
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  
  const { data: session } = useSession();
  const router = useRouter();

  // Populate info on session load or modal open
  useEffect(() => {
    if (session?.user) {
      setCustomerName(session.user.name || '');
      setCustomerEmail(session.user.email || '');
    }
  }, [session, showModal]);

  const handleOpenModal = () => {
    setShowModal(true);
    setNameError('');
    setEmailError('');
  };

  const validateForm = () => {
    let isValid = true;
    if (!customerName.trim()) {
      setNameError('이름을 입력해 주세요.');
      isValid = false;
    } else {
      setNameError('');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerEmail.trim()) {
      setEmailError('이메일 주소를 입력해 주세요.');
      isValid = false;
    } else if (!emailRegex.test(customerEmail)) {
      setEmailError('올바른 이메일 형식이 아닙니다.');
      isValid = false;
    } else {
      setEmailError('');
    }

    return isValid;
  };

  const handlePaymentReal = async () => {
    console.log('handlePaymentReal invoked. Current state:', {
      sdkInstanceReady: !!sdkInstance,
      amount,
      messageId,
      loading
    });
    if (!validateForm()) {
      console.log('Form validation failed');
      alert('결제자 정보를 올바르게 입력해 주세요.\n- 이름: 필수 입력\n- 이메일: 올바른 형식 (예: example@email.com)');
      return;
    }
    if (!sdkInstance) {
      alert('토스 결제 모듈이 아직 로드되지 않았습니다. 잠시 후 다시 시도해 주세요.');
      return;
    }
    setLoading(true);
    console.log('Preparing Toss Payments request...');

    try {
      // Generate a completely unique customerKey for this transaction to avoid session collisions at Toss Payments backend
      const uniqueCustomerKey = `guest_${messageId}_${Math.random().toString(36).substring(2, 7)}`;
      console.log('Initializing a fresh V2 payment interface with unique customerKey:', uniqueCustomerKey);
      const payment = sdkInstance.payment({ customerKey: uniqueCustomerKey });

      console.log('Calling requestPayment...');
      await payment.requestPayment({
        method: 'CARD',
        amount: {
          currency: 'KRW',
          value: amount,
        },
        orderId: `order_${messageId}_${Math.random().toString(36).substring(2, 7)}`,
        orderName: '포춘쿠키 선물하기',
        successUrl: `${window.location.origin}/api/toss/confirm?messageId=${messageId}`,
        failUrl: `${window.location.origin}/pay/${messageId}?status=fail`,
        customerEmail: customerEmail || undefined,
        customerName: customerName || undefined,
      });
      console.log('requestPayment call completed successfully');
      setShowModal(false);
    } catch (err: any) {
      console.error('Toss Payments Error Details:', err);
      const errorCode = err.code || 'UNKNOWN_CODE';
      const errorMsg = err.message || JSON.stringify(err);
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_Poxy1XQL8RwlGXWO4Po937nO5Wml';

      alert(
        `❌ [결제 에러 발생]\n` +
        `- 에러 코드: ${errorCode}\n` +
        `- 에러 메시지: ${errorMsg}\n\n` +
        `- 클라이언트 키: ${clientKey}\n` +
        `- 주문 ID: order_${messageId}_...\n` +
        `- 결제 금액: ${amount}원\n` +
        `- 구매자 이름: ${customerName}\n` +
        `- 구매자 이메일: ${customerEmail}\n\n` +
        `💡 해결 가이드:\n` +
        `1. 브라우저 주소창의 팝업 차단 표시를 확인하고 해제해 주세요.\n` +
        `2. 토스 개발자센터(app.tosspayments.com) -> 내 개발정보 -> API 키 페이지에서 새로운 계정의 API 키가 .env.local과 올바르게 일치하는지 확인해 주세요.\n` +
        `3. 토스 개발자센터 -> 리다이렉트 URL 페이지에 http://localhost:3000 이 등록되어 있는지 확인해 주세요.`
      );
      setShowModal(false);
      setLoading(false);
    }
  };

  const handlePaymentMock = async () => {
    if (!validateForm()) return;
    setShowModal(false);
    setLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Direct redirect to our local confirm endpoint or success simulation
    router.push(`/api/toss/confirm?messageId=${messageId}&paymentKey=mock_payment_key&orderId=mock_order_id&amount=${amount}`);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Trigger Modal Option */}
      <button
        onClick={handleOpenModal}
        disabled={loading}
        className="w-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-50"
      >
        <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 0C9 0 0 9 0 20s9 20 20 20 20-9 20-20S31 0 20 0zm0 36c-8.8 0-16-7.2-16-16S11.2 4 20 4s16 7.2 16 16-7.2 16-16 16zm-3.1-23.7h8.8V19h-8.8v8.8h-4.9V19H7.1v-6.7h4.9V7.1h4.9v5.2z" fill="currentColor"/>
        </svg>
        {loading ? '결제 처리 중...' : `안전하게 결제하기 (${amount.toLocaleString()}원)`}
      </button>
      
      <p className="text-[11px] text-zinc-400 dark:text-zinc-500 text-center leading-relaxed mt-1">
        실제 토스페이먼츠 테스트 모드 결제 또는 가상 결제 시뮬레이션을 모두 지원합니다.<br/>
        결제가 완료되면 행운의 공유 링크가 발급됩니다.
      </p>

      {/* Info Modal Backdrop */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in duration-200">
            {/* Close */}
            <button 
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-zinc-450 hover:text-zinc-650 dark:hover:text-zinc-250 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1.5 pr-6">
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-50">결제자 정보 입력</h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">포춘쿠키 결제를 위해 구매 정보를 입력해 주세요.</p>
            </div>

            <div className="space-y-4">
              {/* Name field */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="예: 홍길동"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 py-2.5 px-3.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-zinc-500 transition-colors text-zinc-800 dark:text-zinc-150"
                />
                {nameError && (
                  <span className="text-[10px] text-red-500 font-bold mt-0.5">{nameError}</span>
                )}
              </div>

              {/* Email field */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  이메일 주소 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 py-2.5 px-3.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-zinc-500 transition-colors text-zinc-800 dark:text-zinc-150"
                />
                {emailError && (
                  <span className="text-[10px] text-red-500 font-bold mt-0.5">{emailError}</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-350 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handlePaymentReal}
                className="py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>결제하기</span>
              </button>
            </div>

            {/* Test Simulation trigger */}
            <button
              onClick={handlePaymentMock}
              className="w-full text-center text-[10px] text-zinc-450 dark:text-zinc-500 underline hover:text-zinc-750 dark:hover:text-zinc-350 font-bold transition-colors"
            >
              또는 테스트 결제 시뮬레이션 바로 완료하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
