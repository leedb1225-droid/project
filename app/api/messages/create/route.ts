import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/authOptions';
import { fortuneServiceServer } from '../../../../lib/fortuneServiceServer';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const sender_email = session?.user?.email || null;

    const body = await request.json();
    const { sender_nickname, receiver_name, receiver_email, receiver_phone, message_content, coupon_type, is_public, cookie_skin, unlock_at } = body;

    if (!message_content || message_content.trim().length === 0) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    if (!coupon_type) {
      return NextResponse.json({ error: 'Coupon selection is required' }, { status: 400 });
    }

    // Determine price amount by coupon type
    let payment_amount = 3000;
    if (coupon_type === 'dessert') {
      payment_amount = 4000;
    } else if (coupon_type === 'meal') {
      payment_amount = 5000;
    }

    // Validate receiver_email format if provided
    const trimmedReceiverEmail = receiver_email?.trim() || null;
    if (trimmedReceiverEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedReceiverEmail)) {
      return NextResponse.json({ error: '올바른 이메일 형식이 아닙니다.' }, { status: 400 });
    }

    const trimmedReceiverPhone = receiver_phone?.trim() || null;

    // Insert message into store
    const newMessage = await fortuneServiceServer.createMessage({
      sender_nickname: sender_nickname ? sender_nickname.trim() : '익명',
      sender_email,
      receiver_name: receiver_name ? receiver_name.trim() : '받는 사람',
      receiver_email: trimmedReceiverEmail,
      receiver_phone: trimmedReceiverPhone,
      message_content: message_content.trim(),
      coupon_type,
      is_public: !!is_public,
      cookie_skin: cookie_skin || 'original',
      unlock_at: unlock_at || null,
    });

    return NextResponse.json({
      message_id: newMessage.id,
      payment_amount,
    });
  } catch (error: any) {
    console.error('[API Create Message Error]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
