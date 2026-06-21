import { NextResponse } from 'next/server';
import { fortuneServiceServer } from '../../../../lib/fortuneServiceServer';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const message = await fortuneServiceServer.getMessage(id);

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    return NextResponse.json(message);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, reply } = body;

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }

    switch (action) {
      case 'markAsPaid': {
        const success = await fortuneServiceServer.markAsPaid(id);
        return NextResponse.json({ success });
      }
      case 'markAsOpened': {
        const success = await fortuneServiceServer.markAsOpened(id);
        return NextResponse.json({ success });
      }
      case 'saveReply': {
        if (typeof reply !== 'string') {
          return NextResponse.json({ error: 'Missing reply content' }, { status: 400 });
        }
        const success = await fortuneServiceServer.saveReply(id, reply);
        if (success) {
          const message = await fortuneServiceServer.getMessage(id);
          if (message && message.sender_email && message.receiver_email) {
            await fortuneServiceServer.increaseWarmth(message.sender_email, message.receiver_email, 1.0);
          }
        }
        return NextResponse.json({ success });
      }
      case 'toggleLike': {
        const likes = await fortuneServiceServer.toggleLike(id);
        return NextResponse.json({ likes });
      }
      default:
        return NextResponse.json({ error: `Unsupported action: ${action}` }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}


