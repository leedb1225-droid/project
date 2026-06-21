import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/authOptions';
import { fortuneServiceServer } from '../../../lib/fortuneServiceServer';

// GET /api/notifications — fetch current user's notifications
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userProfile = await fortuneServiceServer.getUserProfile(session.user.email, {
      name: session.user.name || undefined,
      avatar_url: session.user.image || undefined,
    });
    const userPhone = userProfile?.phone || null;

    const notifications = await fortuneServiceServer.getNotifications(session.user.email, userPhone);
    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error('[GET /api/notifications]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/notifications — mark notification(s) as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (body.markAll) {
      // Mark all notifications read for this user
      await fortuneServiceServer.markAllNotificationsRead(session.user.email);
      return NextResponse.json({ success: true });
    }

    if (body.id) {
      // Mark single notification read
      const success = await fortuneServiceServer.markNotificationRead(body.id);
      return NextResponse.json({ success });
    }

    return NextResponse.json({ error: 'Missing id or markAll' }, { status: 400 });
  } catch (error: any) {
    console.error('[PATCH /api/notifications]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
