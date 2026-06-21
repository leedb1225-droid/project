import { NextResponse } from 'next/server';
import { fortuneServiceServer } from '../../../lib/fortuneServiceServer';

export async function GET() {
  try {
    const messages = await fortuneServiceServer.getPublicMessages();
    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
