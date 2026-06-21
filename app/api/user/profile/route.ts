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

    const profile = await fortuneServiceServer.getUserProfile(session.user.email, {
      name: session.user.name || undefined,
      avatar_url: session.user.image || undefined,
    });

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error('[GET /api/user/profile]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: '이름은 필수 입력 항목입니다.' }, { status: 400 });
    }

    const updatedProfile = await fortuneServiceServer.updateUserProfile(session.user.email, {
      name: name.trim(),
      phone: phone ? phone.trim() : null,
    });

    return NextResponse.json(updatedProfile);
  } catch (error: any) {
    console.error('[POST /api/user/profile]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
