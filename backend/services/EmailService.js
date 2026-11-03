
class EmailService {
  getBrevoConfig() {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    const senderName = process.env.BREVO_SENDER_NAME || "Tomato Food Delivery";

    if (!apiKey || !senderEmail) {
      throw new Error("Brevo configuration is missing");
    }

    return { apiKey, senderEmail, senderName };
  }

  async sendEmail({ email, subject, htmlContent }) {
    const { apiKey, senderEmail, senderName } = this.getBrevoConfig();

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "accept": "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [{ email }],
        subject,
        htmlContent,
      }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("[EmailService] Brevo API error:", response.status, result);
      throw new Error(result.message || `Brevo API failed (${response.status})`);
    }

    return result;
  }

  async sendOTPEmail({ email, otp, purpose = "register", name = "" }) {
    if (!email || !otp) {
      return { success: false, message: "Missing email or OTP" };
    }

    const isReset = purpose === "forgot_password";

    const subject = isReset
      ? `Password Reset Code: ${otp} - Tomato Food Delivery`
      : `Verify Your Email: ${otp} - Tomato Food Delivery`;

    const title = isReset
      ? "Password Reset Request"
      : "Verify Your Account";

    const actionDesc = isReset
      ? "We received a request to reset your password. Use the verification code below to set your new password:"
      : "Thank you for joining Tomato! Use the verification code below to complete your registration:";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; background-color: #faf8f5; margin: 0; padding: 24px; color: #1e1b18; }
          .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #f0e6dc; }
          .header { background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 26px; }
          .content { padding: 32px 28px; line-height: 1.6; }
          .title { font-size: 20px; font-weight: 700; margin-bottom: 12px; }
          .message { font-size: 14.5px; color: #57534e; margin-bottom: 24px; }
          .otp-card { background: #fff7ed; border: 2px dashed #ea580c; border-radius: 14px; padding: 24px; text-align: center; margin: 24px 0; }
          .otp-label { font-size: 12px; font-weight: 700; color: #ea580c; margin-bottom: 8px; }
          .otp-value { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #ea580c; font-family: monospace; }
          .otp-expiry { font-size: 12px; color: #9a3412; margin-top: 8px; }
          .warning { font-size: 13px; color: #8c827a; background: #faf8f5; padding: 12px 16px; border-radius: 10px; margin-top: 20px; }
          .footer { background: #f5efe8; padding: 18px 24px; text-align: center; font-size: 12px; color: #8c827a; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>Tomato.</h1></div>
          <div class="content">
            <div class="title">${title}</div>
            <p class="message">${actionDesc}</p>
            <div class="otp-card">
              <div class="otp-label">Your Verification Code</div>
              <div class="otp-value">${otp}</div>
              <div class="otp-expiry">Valid for 10 minutes</div>
            </div>
            <div class="warning">
              <strong>Security Tip:</strong> Never share this code with anyone.
              If you did not make this request, ignore this email.
            </div>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Tomato. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const result = await this.sendEmail({ email, subject, htmlContent });

      console.log(`[EmailService] OTP email accepted by Brevo for ${email}`);

      return {
        success: true,
        live: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error("[EmailService] OTP email failed:", error.message);

      return {
        success: false,
        live: false,
        message: "Unable to send verification email. Please try again later.",
      };
    }
  }

  async sendWelcomeEmail({ email, name }) {
    if (!email) {
      return { success: false, message: "No recipient email provided" };
    }

    const recipientName = name ? name.split(" ")[0] : "Food Lover";
    const subject = "Welcome to Tomato! Here is your 20% OFF Welcome Gift";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; background:#faf8f5; padding:24px; color:#1e1b18;">
        <div style="max-width:580px; margin:auto; background:white; border-radius:20px; overflow:hidden;">
          <div style="background:#ea580c; padding:36px; text-align:center; color:white;">
            <h1>Tomato.</h1>
            <p>Handcrafted Flavors • Delivered in 30 Mins</p>
          </div>
          <div style="padding:32px;">
            <h2>Hi ${recipientName}, welcome to the family!</h2>
            <p>We are delighted to have you with us. Our kitchen is ready to elevate your dining experience.</p>
            <div style="background:#fff7ed; border:2px dashed #ea580c; border-radius:16px; padding:22px; text-align:center;">
              <h3>Your Exclusive Welcome Gift</h3>
              <h1 style="color:#c2410c;">NEW_USER</h1>
              <p>Get Flat 20% OFF on your very first order!</p>
            </div>
            <p style="text-align:center;">
              Apply coupon <strong>NEW_USER</strong> at checkout.
            </p>
          </div>
          <div style="background:#f5efe8; padding:20px; text-align:center; font-size:12px;">
            Sent with love from Tomato Food Delivery.
            © ${new Date().getFullYear()} Tomato. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      const result = await this.sendEmail({ email, subject, htmlContent });

      console.log(`[EmailService] Welcome email accepted by Brevo for ${email}`);

      return {
        success: true,
        live: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error("[EmailService] Welcome email failed:", error.message);

      return {
        success: false,
        error: error.message,
      };
    }
  }
}

const emailService = new EmailService();

export default emailService;
export { EmailService };
