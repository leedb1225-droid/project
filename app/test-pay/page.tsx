'use client';

import React from 'react';
import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk';

export default function TestPayment() {
  const handleClick = async () => {
    try {
      console.log('1. 결제 시작');
      

      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_Poxy1XQL8RwlGXWO4Po937nO5Wml';
      console.log('3. SDK 로드 중...');
      const tossPaymentsInstance = await loadTossPayments(clientKey);
      const payment = tossPaymentsInstance.payment({ customerKey: ANONYMOUS });
      console.log('4. SDK 로드 및 초기화 완료');
      
      console.log('5. 결제창 호출 중...');
      await payment.requestPayment({
        method: 'CARD',
        amount: {
          currency: 'KRW',
          value: 1000,
        },
        orderId: `test-${Date.now()}`,
        orderName: '테스트 결제',
        successUrl: `${window.location.origin}/success`,
        failUrl: `${window.location.origin}/fail`,
      });
      
      console.log('6. 결제창 열림');
    } catch (error) {
      console.error('❌ 에러 발생:', error);
      alert('에러: ' + JSON.stringify(error));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <button
        onClick={handleClick}
        className="bg-blue-500 text-white px-8 py-4 rounded-lg text-xl"
      >
        테스트 결제 버튼
      </button>
    </div>
  );
}
