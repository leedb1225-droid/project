import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const scriptUrl = process.env.GOOGLE_SHEETS_SCRIPT_URL;

    console.log('[Google Sheets Save] Data payload received:', body);

    if (scriptUrl) {
      let category = body.coupon_type || '';
      if (category === 'coffee') {
        category = '☕ 커피 쿠폰';
      } else if (category === 'dessert') {
        category = '🍰 디저트 쿠폰';
      } else if (category === 'meal') {
        category = '🍜 식사 쿠폰';
      }

      // 한국 표준시(KST) 기준으로 포맷팅 (YYYY-MM-DD HH:mm:ss)
      const now = new Date();
      const kstOffset = 9 * 60 * 60 * 1000;
      const kstDate = new Date(now.getTime() + kstOffset);
      const kstTimestamp = kstDate.toISOString().replace('T', ' ').substring(0, 19);

      // Forward the data to Google Apps Script Web App Deployment URL
      const response = await fetch(scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          timestamp: kstTimestamp,
          id: body.sender_email || body.id,
          sender: body.sender_nickname,
          receiver: body.receiver_name,
          category: category,
          message: body.message_content,
          is_public: body.is_public,
          likes: body.likes,
        }),
      });

      if (!response.ok) {
        throw new Error(`Google Sheets script responded with status: ${response.status}`);
      }

      const responseText = await response.text();
      return NextResponse.json({ success: true, method: 'google_script', response: responseText });
    }

    // Fallback/Simulated Google Sheets Save
    return NextResponse.json({
      success: true,
      method: 'simulation',
      message: 'Google Sheets URL (GOOGLE_SHEETS_SCRIPT_URL) is not defined. Data logged in server console.',
    });
  } catch (error: any) {
    console.error('[Google Sheets Save] Error saving data:', error);
    return NextResponse.json({ error: error.message || 'Failed to save to Google Sheets' }, { status: 500 });
  }
}
