/**
 * teeteeStock Mail Service
 * 支援 Resend API 正式發信與本機開發免金鑰備援模式
 */

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface SendResetEmailResult {
  success: boolean;
  messageId?: string;
  isDevFallback?: boolean;
  resetUrl?: string;
  error?: string;
}

/**
 * 產生 teeteeStock 品牌專屬的重設密碼 HTML 電子郵件模板
 */
export function generatePasswordResetEmailHtml(resetUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>【teeteeStock】密碼重設通知</title>
</head>
<body style="margin: 0; padding: 0; background-color: #05080e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #EAECEF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #05080e; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- 容器卡片 -->
        <table role="presentation" width="100%" max-width="560px" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; background-color: #0a111a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          
          <!-- 頂部 Header -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; border-bottom: 1px solid #1e293b; text-align: center;">
              <div style="display: inline-block; font-size: 22px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">
                <span style="color: #38bdf8;">tee</span><span style="color: #ff69b4;">tee</span><span style="color: #10b981;">Stock</span>
              </div>
              <div style="font-size: 11px; font-family: monospace; color: #64748b; margin-top: 4px; letter-spacing: 1px;">
                SECURITY AUTHENTICATION
              </div>
            </td>
          </tr>

          <!-- 內容主體 -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #f8fafc;">
                重設您的帳號密碼
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                您好，我們收到了您要求重設 teeteeStock 帳號密碼的請求。請點擊下方按鈕以設定新密碼：
              </p>

              <!-- 按鈕 -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0;">
                <tr>
                  <td align="center" style="border-radius: 10px; background-color: #10b981;">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 12px 28px; font-size: 14px; font-weight: 700; color: #022c22; text-decoration: none; border-radius: 10px;">
                      重設我的密碼
                    </a>
                  </td>
                </tr>
              </table>

              <!-- 時效警告提示 -->
              <div style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 8px; padding: 12px 16px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #f87171;">
                  ⏱️ <strong>時效提醒：</strong>此連結有效時間為 <strong>15 分鐘</strong>，且僅能使用一次。逾時將自動失效。
                </p>
              </div>

              <p style="margin: 0 0 12px 0; font-size: 12px; line-height: 1.5; color: #64748b;">
                若按鈕無法點擊，您也可以複製下方網址至瀏覽器貼上開啟：
              </p>
              <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 6px; padding: 10px; word-break: break-all; font-family: monospace; font-size: 11px; color: #38bdf8;">
                ${resetUrl}
              </div>

              <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #1e293b;">
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #64748b;">
                  🔒 <strong>安全叮嚀：</strong>若您並未提出此重設請求，請忽略本信件，您的密碼將不會產生任何變更。
                </p>
              </div>
            </td>
          </tr>

          <!-- 底部資訊 -->
          <tr>
            <td style="padding: 20px 32px; background-color: #070c14; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0; font-size: 11px; color: #475569;">
                &copy; 2026 teeteeStock Exchange. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * 發送密碼重設電子郵件
 */
export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
): Promise<SendResetEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'teeteeStock <noreply@teeteestock.com>';
  const subject = '【teeteeStock】密碼重設驗證信（15分鐘內有效）';
  const html = generatePasswordResetEmailHtml(resetUrl);

  // 1. 若尚未配置 RESEND_API_KEY，切換至開發測試備援模式 (Dev Fallback)
  if (!apiKey || apiKey.trim() === '') {
    console.log('\n======================================================');
    console.log('📧 [teeteeStock Mail Service - DEV FALLBACK]');
    console.log(`收件者: ${email}`);
    console.log(`主旨: ${subject}`);
    console.log(`重設密碼連結 (15 分鐘內有效):`);
    console.log(`👉 ${resetUrl}`);
    console.log('======================================================\n');

    return {
      success: true,
      isDevFallback: true,
      resetUrl,
    };
  }

  // 2. 正式透過 Resend REST API 發信
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject,
        html,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error('[Mail] Resend API error:', data);
      return {
        success: false,
        error: data.message || '發送郵件失敗，請稍候再試。',
      };
    }

    return {
      success: true,
      messageId: data.id,
      resetUrl,
    };
  } catch (error: any) {
    console.error('[Mail] Network error while sending email:', error);
    return {
      success: false,
      error: error.message || '網路連線異常，無法送達郵件服務器。',
    };
  }
}
