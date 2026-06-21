import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/authOptions';
import { fortuneServiceServer } from '../../../lib/fortuneServiceServer';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user.email;
    const searchParams = request.nextUrl.searchParams;
    const searchVal = searchParams.get('search');

    const profile = await fortuneServiceServer.getUserProfile(email);

    if (searchVal) {
      const searchResult = await fortuneServiceServer.searchUser(searchVal);
      const warmth = searchResult ? (profile.friendWarmth?.[searchResult.email] ?? 36.5) : 36.5;
      const cleanedResult = searchResult ? {
        email: searchResult.email,
        name: searchResult.name,
        avatar_url: searchResult.avatar_url,
        warmth,
      } : null;
      return NextResponse.json({ searchResult: cleanedResult });
    }

    // Fetch full profiles of friends, incoming, outgoing lists
    const friends = await fortuneServiceServer.getMutualFriends(email);
    const friendsWithWarmth = friends.map(f => {
      const warmth = profile.friendWarmth?.[f.email] ?? 36.5;
      return {
        email: f.email,
        name: f.name,
        avatar_url: f.avatar_url,
        phone: f.phone,
        warmth,
      };
    });
    
    const incomingList = await Promise.all(
      (profile.incomingRequests || []).map(async (e) => {
        return await fortuneServiceServer.getUserProfile(e);
      })
    );

    const outgoingList = await Promise.all(
      (profile.outgoingRequests || []).map(async (e) => {
        return await fortuneServiceServer.getUserProfile(e);
      })
    );

    return NextResponse.json({
      friends: friendsWithWarmth,
      incoming: incomingList,
      outgoing: outgoingList,
    });
  } catch (error: any) {
    console.error('[GET /api/friends]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user.email;
    const body = await request.json();
    const { action, target } = body;

    if (!action || !target) {
      return NextResponse.json({ error: 'Missing action or target' }, { status: 400 });
    }

    if (action === 'request') {
      const result = await fortuneServiceServer.sendFriendRequest(email, target);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'accept') {
      const success = await fortuneServiceServer.acceptFriendRequest(email, target);
      return NextResponse.json({ success });
    }

    if (action === 'decline') {
      const success = await fortuneServiceServer.declineFriendRequest(email, target);
      return NextResponse.json({ success });
    }

    if (action === 'remove') {
      const success = await fortuneServiceServer.removeFriend(email, target);
      return NextResponse.json({ success });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('[POST /api/friends]', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
