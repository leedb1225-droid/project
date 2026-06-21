import { NextRequest, NextResponse } from 'next/server';
import { fortuneServiceServer } from '../../../../lib/fortuneServiceServer';


async function handlePaymentSuccess(messageId: string) {
  await fortuneServiceServer.markAsPaid(messageId);
  try {
    const message = await fortuneServiceServer.getMessage(messageId);
    if (message) {
      // 1. Create notification
      if (message.receiver_email || message.receiver_phone) {
        await fortuneServiceServer.createNotification({
          user_email: message.receiver_email || undefined,
          user_phone: message.receiver_phone || undefined,
          message_id: messageId,
          sender_nickname: message.sender_nickname || '익명',
          coupon_type: message.coupon_type,
        });
      }
      // 2. Increase warmth
      if (message.sender_email && message.receiver_email) {
        await fortuneServiceServer.increaseWarmth(message.sender_email, message.receiver_email, 1.5);
      }
    }
  } catch (e) {
    console.error('Error handling post-payment success:', e);
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const messageId = searchParams.get('messageId');
  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  if (!messageId) {
    return NextResponse.json({ error: 'Missing messageId' }, { status: 400 });
  }

  // Fallback / simulation check
  const isMock = !paymentKey || paymentKey.startsWith('mock_');

  if (isMock) {
    // Simulated Success
    await handlePaymentSuccess(messageId);

    // Save to Google Sheets if possible (background call)
    try {
      const message = await fortuneServiceServer.getMessage(messageId);
      if (message) {
        await fetch(`${request.nextUrl.origin}/api/sheets/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message),
        }).catch(e => console.error('Silent sheets save failure:', e));
      }
    } catch (e) {}

    return NextResponse.redirect(`${request.nextUrl.origin}/success?id=${messageId}`);
  }

  // Real Toss Payments confirmation
  const tossSecretKey = process.env.TOSS_SECRET_KEY || 'test_sk_BX7zk2yd8y6bBXN5DoPp3x9POLqK';
  const basicToken = Buffer.from(tossSecretKey + ':').toString('base64');

  try {
    const confirmResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount: Number(amount),
      }),
    });

    const data = await confirmResponse.json();

    if (confirmResponse.ok) {
      // Mark as paid and handle success logic
      await handlePaymentSuccess(messageId);

      // Save sheets (background)
      try {
        const message = await fortuneServiceServer.getMessage(messageId);
        if (message) {
          await fetch(`${request.nextUrl.origin}/api/sheets/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message),
          }).catch(e => console.error('Silent sheets save failure:', e));
        }
      } catch (e) {}

      return NextResponse.redirect(`${request.nextUrl.origin}/success?id=${messageId}`);
    } else {
      console.error('Toss Payments confirmation failed:', data);
      return NextResponse.redirect(
        `${request.nextUrl.origin}/pay/${messageId}?error=${encodeURIComponent(data.message || 'payment_failed')}`
      );
    }
  } catch (error: any) {
    console.error('Toss confirm error:', error);
    return NextResponse.redirect(
      `${request.nextUrl.origin}/pay/${messageId}?error=${encodeURIComponent(error.message || 'server_error')}`
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orderId, paymentKey, amount, messageId } = await request.json();
    const tossSecretKey = process.env.TOSS_SECRET_KEY || 'test_sk_BX7zk2yd8y6bBXN5DoPp3x9POLqK';
    const basicToken = Buffer.from(`${tossSecretKey}:`).toString('base64');

    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId, paymentKey, amount }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('토스 API 에러:', error);
      return NextResponse.json(error, { status: response.status });
    }

    const data = await response.json();
    
    // If messageId is passed, mark as paid in internal store
    if (messageId) {
      await handlePaymentSuccess(messageId);
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
