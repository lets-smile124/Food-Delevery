import nodemailer from "nodemailer";

class EmailService {
  /**
   * Get fresh transporter based on current environment variables
   */
  getTransporter() {
    const user = process.env.EMAIL_USER || "ankitanone12@gmail.com";
    const pass = (process.env.EMAIL_PASS || process.env.GMAIL_APP_PASSWORD || "").trim();

    if (!pass) {
      return null;
    }

    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: user,
        pass: pass,
      },
    });
  }

  /**
   * Send 6-digit OTP email for registration or password reset
   * @param {Object} params - { email, otp, purpose, name }
   */
  async sendOTPEmail({ email, otp, purpose = "register", name = "" }) {
    if (!email || !otp) return { success: false, message: "Missing email or OTP" };

    const senderEmail = process.env.EMAIL_USER || "ankitanone12@gmail.com";
    const isReset = purpose === "forgot_password";
    const subject = isReset
      ? `Password Reset Code: ${otp} - Tomato Food Delivery`
      : `Verify Your Email: ${otp} - Tomato Food Delivery`;

    const title = isReset ? "Password Reset Request" : "Verify Your Account";
    const actionDesc = isReset
      ? "We received a request to reset your password. Use the verification code below to set your new password:"
      : "Thank you for joining Tomato! Use the verification code below to complete your registration:";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #faf8f5; margin: 0; padding: 24px; color: #1e1b18; }
          .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #f0e6dc; }
          .header { background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em; }
          .content { padding: 32px 28px; line-height: 1.6; }
          .title { font-size: 20px; font-weight: 700; color: #1e1b18; margin-bottom: 12px; }
          .message { font-size: 14.5px; color: #57534e; margin-bottom: 24px; }
          .otp-card { background: #fff7ed; border: 2px dashed #ea580c; border-radius: 14px; padding: 24px; text-align: center; margin: 24px 0; }
          .otp-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px; color: #ea580c; margin-bottom: 8px; }
          .otp-value { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #ea580c; font-family: monospace; }
          .otp-expiry { font-size: 12px; color: #9a3412; margin-top: 8px; }
          .warning { font-size: 13px; color: #8c827a; background: #faf8f5; padding: 12px 16px; border-radius: 10px; margin-top: 20px; }
          .footer { background: #f5efe8; padding: 18px 24px; text-align: center; font-size: 12px; color: #8c827a; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Tomato.</h1>
          </div>
          <div class="content">
            <div class="title">${title}</div>
            <p class="message">${actionDesc}</p>

            <div class="otp-card">
              <div class="otp-label">Your Verification Code</div>
              <div class="otp-value">${otp}</div>
              <div class="otp-expiry">⏱️ Valid for 10 minutes</div>
            </div>

            <div class="warning">
              🔒 <strong>Security Tip:</strong> Never share this code with anyone. If you did not make this request, you can safely ignore this email.
            </div>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Tomato. All rights reserved. • Sent from: ${senderEmail}
          </div>
        </div>
      </body>
      </html>
    `;

    const transporter = this.getTransporter();

    if (transporter) {
      try {
        const info = await transporter.sendMail({
          from: `"Tomato Food Delivery" <${senderEmail}>`,
          to: email,
          subject,
          html: htmlContent,
        });
        console.log(`[EmailService] Live OTP email successfully sent to ${email} (MessageId: ${info.messageId})`);
        return { success: true, live: true, messageId: info.messageId };
      } catch (err) {
        console.error(`[EmailService] Live SMTP error sending OTP to ${email}:`, err.message);
        console.log(`[EmailService] Fallback Simulated OTP for ${email}: [ ${otp} ] (purpose: ${purpose})`);
        return { success: true, live: false, simulated: true, otp, error: err.message };
      }
    } else {
      console.log(`[EmailService] Notice: EMAIL_PASS is not set in backend/.env. Simulated OTP for ${email}: [ ${otp} ] (purpose: ${purpose})`);
      return { success: true, live: false, simulated: true, otp };
    }
  }

  /**
   * Send a warm thank you welcome email to newly registered users
   * @param {Object} params - { email, name }
   */
  async sendWelcomeEmail({ email, name }) {
    if (!email) return { success: false, message: "No recipient email provided" };

    const senderEmail = process.env.EMAIL_USER || "ankitanone12@gmail.com";
    const recipientName = name ? name.split(" ")[0] : "Food Lover";
    const subject = "Welcome to Tomato! 🎁 Here is your 20% OFF Welcome Gift";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #faf8f5; margin: 0; padding: 24px; color: #1e1b18; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #f0e6dc; }
          .header { background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); padding: 36px 30px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.02em; }
          .header p { margin: 8px 0 0; font-size: 15px; opacity: 0.95; }
          .content { padding: 32px 30px; line-height: 1.6; }
          .greeting { font-size: 20px; font-weight: 700; color: #1e1b18; margin-bottom: 12px; }
          .promo-box { background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); border: 2px dashed #ea580c; border-radius: 16px; padding: 22px; text-align: center; margin: 24px 0; }
          .promo-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #ea580c; }
          .promo-code { font-size: 32px; font-weight: 800; color: #c2410c; letter-spacing: 4px; font-family: monospace; margin: 8px 0; }
          .promo-benefit { font-size: 14px; font-weight: 600; color: #7c2d12; }
          .cta-btn { display: inline-block; background: #ea580c; color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 9999px; margin-top: 16px; box-shadow: 0 4px 14px rgba(234, 88, 12, 0.35); }
          .footer { background: #f5efe8; padding: 20px 30px; text-align: center; font-size: 12.5px; color: #8c827a; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Tomato.</h1>
            <p>Handcrafted Flavors • Delivered in 30 Mins</p>
          </div>
          <div class="content">
            <div class="greeting">Hi ${recipientName}, welcome to the family! 🎉</div>
            <p>
              We are delighted to have you with us. From farm-fresh garden salads to handcrafted pasta and artisan desserts, our kitchen is ready to elevate your dining experience.
            </p>

            <div class="promo-box">
              <div class="promo-title">Your Exclusive Welcome Gift</div>
              <div class="promo-code">NEW_USER</div>
              <div class="promo-benefit">✨ Get Flat 20% OFF on your very first order! ✨</div>
            </div>

            <p style="text-align: center;">
              Apply coupon <strong>NEW_USER</strong> at checkout to claim your savings.
            </p>

            <div style="text-align: center; margin: 28px 0 12px;">
              <a href="http://localhost:5173" class="cta-btn">Order Your First Feast →</a>
            </div>
          </div>
          <div class="footer">
            Sent with ❤️ from ankitanone12@gmail.com<br />
            © ${new Date().getFullYear()} Tomato Food Delivery. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    const transporter = this.getTransporter();
    if (transporter) {
      try {
        const info = await transporter.sendMail({
          from: `"Tomato Food Delivery" <${senderEmail}>`,
          to: email,
          subject,
          html: htmlContent,
        });
        console.log(`[EmailService] Welcome email sent to ${email} (MessageId: ${info.messageId})`);
        return { success: true, live: true, messageId: info.messageId };
      } catch (err) {
        console.error(`[EmailService] Error sending welcome email to ${email}:`, err.message);
        return { success: false, error: err.message };
      }
    } else {
      console.log(`[EmailService] (Local Mode) Welcome email simulated for ${email} with promo NEW_USER`);
      return { success: true, simulated: true };
    }
  }
}

const emailService = new EmailService();
export default emailService;
export { EmailService };
