const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendOTPEmail = async (email, name, otp) => {
  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from: `"Moreleaf" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Kode OTP Reset Password - Moreleaf',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <div style="background: #1B5E20; padding: 24px; text-align: center;">
            <h1 style="color: #fff; margin: 0;">MORELEAF</h1>
            <p style="color: #81C784; margin: 4px 0 0;">Healthy Snack From Moringa Leaves</p>
          </div>
          <div style="padding: 24px; background: #f9f9f9;">
            <p>Halo ${name},</p>
            <p>Anda meminta untuk mereset password akun Moreleaf Anda. Gunakan kode OTP berikut:</p>
            <div style="background: #fff; border: 2px dashed #2E7D32; padding: 16px; text-align: center; margin: 16px 0;">
              <span style="font-size: 28px; font-weight: bold; color: #1B5E20; letter-spacing: 4px;">${otp}</span>
            </div>
            <p>Kode ini berlaku selama 15 menit. Jangan bagikan kode ini kepada siapapun.</p>
            <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
            <p style="margin-top: 24px;">Salam sehat,<br/>Tim Moreleaf</p>
          </div>
        </div>
      `,
    });
    console.log(`✅ OTP email sent to ${email}`);
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    throw new Error('Gagal mengirim email OTP');
  }
};

module.exports = { sendOTPEmail };
