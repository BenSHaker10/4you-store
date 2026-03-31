import nodemailer from "nodemailer";

// Create transporter using Gmail SMTP
function createTransporter() {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    console.warn("[Email] GMAIL_USER or GMAIL_APP_PASSWORD not configured. Emails will not be sent.");
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });
}

export async function sendVerificationEmail(
  toEmail: string,
  toName: string,
  verificationUrl: string
): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) return false;

  const fromEmail = process.env.GMAIL_USER;

  try {
    await transporter.sendMail({
      from: `"4 YOU Store" <${fromEmail}>`,
      to: toEmail,
      subject: "تأكيد بريدك الإلكتروني - 4 YOU Store",
      html: `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تأكيد البريد الإلكتروني</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%);padding:40px;text-align:center;">
              <h1 style="color:#d4af37;margin:0;font-size:32px;letter-spacing:4px;font-weight:300;">4 YOU</h1>
              <p style="color:#888;margin:8px 0 0;font-size:13px;letter-spacing:2px;">PREMIUM BEAUTY STORE</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:50px 40px;text-align:center;">
              <div style="width:70px;height:70px;background:#fff8e1;border-radius:50%;margin:0 auto 24px;display:flex;align-items:center;justify-content:center;">
                <span style="font-size:36px;">✉️</span>
              </div>
              <h2 style="color:#1a1a1a;margin:0 0 16px;font-size:24px;font-weight:600;">مرحباً ${toName}!</h2>
              <p style="color:#555;font-size:16px;line-height:1.7;margin:0 0 32px;">
                شكراً لتسجيلك في متجر <strong>4 YOU</strong>. لإتمام إنشاء حسابك وتفعيله، يرجى تأكيد عنوان بريدك الإلكتروني بالنقر على الزر أدناه.
              </p>
              <a href="${verificationUrl}" 
                 style="display:inline-block;background:linear-gradient(135deg,#d4af37,#b8941f);color:#1a1a1a;text-decoration:none;padding:16px 48px;border-radius:50px;font-size:16px;font-weight:700;letter-spacing:1px;box-shadow:0 4px 15px rgba(212,175,55,0.4);">
                تأكيد البريد الإلكتروني
              </a>
              <p style="color:#999;font-size:13px;margin:32px 0 0;line-height:1.6;">
                هذا الرابط صالح لمدة <strong>24 ساعة</strong> فقط.<br>
                إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذا البريد.
              </p>
            </td>
          </tr>
          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #f0f0f0;margin:0;">
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:30px 40px;text-align:center;">
              <p style="color:#aaa;font-size:12px;margin:0;line-height:1.6;">
                © 2025 4 YOU Premium Beauty Store. جميع الحقوق محفوظة.<br>
                إذا كان لديك أي استفسار، تواصل معنا على 
                <a href="mailto:support@4youstore.com" style="color:#d4af37;text-decoration:none;">support@4youstore.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });
    console.log(`[Email] Verification email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send verification email:", error);
    return false;
  }
}

export async function sendWelcomeEmail(toEmail: string, toName: string): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) return false;

  const fromEmail = process.env.GMAIL_USER;

  try {
    await transporter.sendMail({
      from: `"4 YOU Store" <${fromEmail}>`,
      to: toEmail,
      subject: "مرحباً بك في 4 YOU Store! 🌟",
      html: `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>مرحباً بك</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%);padding:40px;text-align:center;">
              <h1 style="color:#d4af37;margin:0;font-size:32px;letter-spacing:4px;font-weight:300;">4 YOU</h1>
              <p style="color:#888;margin:8px 0 0;font-size:13px;letter-spacing:2px;">PREMIUM BEAUTY STORE</p>
            </td>
          </tr>
          <tr>
            <td style="padding:50px 40px;text-align:center;">
              <h2 style="color:#1a1a1a;margin:0 0 16px;font-size:24px;">🎉 مرحباً بك ${toName}!</h2>
              <p style="color:#555;font-size:16px;line-height:1.7;margin:0 0 24px;">
                تم تأكيد حسابك بنجاح! أنت الآن عضو في عائلة <strong>4 YOU</strong> للجمال الفاخر.
              </p>
              <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 32px;">
                استمتع بتسوق أرقى العطور والمكياج ومنتجات العناية بالبشرة من أشهر الماركات العالمية.
              </p>
              <a href="${process.env.VITE_FRONTEND_URL || 'https://for4u.info'}/products" 
                 style="display:inline-block;background:linear-gradient(135deg,#d4af37,#b8941f);color:#1a1a1a;text-decoration:none;padding:16px 48px;border-radius:50px;font-size:16px;font-weight:700;">
                ابدأ التسوق الآن
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;text-align:center;">
              <p style="color:#aaa;font-size:12px;margin:0;">© 2025 4 YOU Premium Beauty Store</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });
    return true;
  } catch (error) {
    console.error("[Email] Failed to send welcome email:", error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  toEmail: string,
  toName: string,
  resetUrl: string
): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) return false;

  const fromEmail = process.env.GMAIL_USER;

  try {
    await transporter.sendMail({
      from: `"4 YOU Store" <${fromEmail}>`,
      to: toEmail,
      subject: "إعادة تعيين كلمة المرور - 4 YOU Store",
      html: `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>إعادة تعيين كلمة المرور</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:0;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background:#000000;padding:40px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:28px;letter-spacing:6px;font-weight:300;font-family:Georgia,serif;font-style:italic;">4 YOU</h1>
              <div style="width:40px;height:1px;background:rgba(255,255,255,0.2);margin:12px auto 0;"></div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:50px 40px;text-align:center;">
              <div style="width:60px;height:60px;border:1px solid #e0e0e0;border-radius:50%;margin:0 auto 24px;line-height:60px;">
                <span style="font-size:28px;">🔐</span>
              </div>
              <h2 style="color:#000;margin:0 0 12px;font-size:22px;font-weight:400;font-family:Georgia,serif;">إعادة تعيين كلمة المرور</h2>
              <p style="color:#666;font-size:14px;line-height:1.8;margin:0 0 32px;font-family:Arial,sans-serif;">
                مرحباً <strong>${toName}</strong>،<br>
                لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في <strong>4 YOU</strong>.<br>
                انقر على الزر أدناه لإنشاء كلمة مرور جديدة.
              </p>
              <a href="${resetUrl}" 
                 style="display:inline-block;background:#000000;color:#ffffff;text-decoration:none;padding:14px 48px;font-size:12px;font-weight:400;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">
                إعادة تعيين كلمة المرور
              </a>
              <p style="color:#999;font-size:12px;margin:32px 0 0;line-height:1.7;font-family:Arial,sans-serif;">
                هذا الرابط صالح لمدة <strong>ساعة واحدة</strong> فقط.<br>
                إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد بأمان.
              </p>
            </td>
          </tr>
          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #f0f0f0;margin:0;">
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:30px 40px;text-align:center;">
              <p style="color:#bbb;font-size:11px;margin:0;line-height:1.6;font-family:Arial,sans-serif;">
                &copy; 2025 4 YOU. جميع الحقوق محفوظة.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });
    console.log(`[Email] Password reset email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error("[Email] Failed to send password reset email:", error);
    return false;
  }
}
