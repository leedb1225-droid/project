import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/authOptions';
import { fortuneServiceServer } from '../../../../lib/fortuneServiceServer';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user.email;
    const profile = await fortuneServiceServer.getUserProfile(email);
    const phone = profile?.phone || null;

    const messages = await fortuneServiceServer.getReceivedMessages(email, phone);
    return NextResponse.json(messages);
  } catch (error: any) {
    console.error('[GET /api/messages/inbox]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
