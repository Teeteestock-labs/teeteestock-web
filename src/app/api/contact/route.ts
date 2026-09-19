import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, category, subject, message } = body;

    // 基礎格式驗證
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: '請提供您的稱呼或暱稱' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      return NextResponse.json({ error: '請輸入有效的電子郵件地址' }, { status: 400 });
    }

    if (!category || typeof category !== 'string') {
      return NextResponse.json({ error: '請選擇聯絡事項類別' }, { status: 400 });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 5) {
      return NextResponse.json({ error: '訊息內容請至少填寫 5 個字元' }, { status: 400 });
    }

    if (message.trim().length > 3000) {
      return NextResponse.json({ error: '訊息內容長度超過上限 (3000 字元)' }, { status: 400 });
    }

    // 擷取客戶端 IP（若有代理）
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               req.headers.get('x-real-ip') || 
               null;

    // 寫入資料庫
    const inquiry = await prisma.contactInquiry.create({
      data: {
        name: name.trim().slice(0, 50),
        email: email.trim().toLowerCase().slice(0, 100),
        category: category.trim().slice(0, 50),
        subject: subject ? subject.trim().slice(0, 100) : null,
        message: message.trim(),
        ip,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      id: inquiry.id,
      message: '您的訊息已成功送達後台，感謝您的回饋！',
    });
  } catch (error) {
    console.error('Failed to submit contact inquiry:', error);
    return NextResponse.json(
      { error: '伺服器處理失敗，請稍後再試。' },
      { status: 500 }
    );
  }
}
