require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function sendRegistrationEmail(userEmail, name) {
    const subject = "Welcome to Backend Ledger 🚀";

    const text = `Hello ${name},

Welcome to Backend Ledger!

We're thrilled to have you on board. Your journey toward smarter financial tracking and efficient backend management starts here.

If you have any questions or need assistance, feel free to reach out anytime.

Best regards,
The Backend Ledger Team`;

    const html = `
    <div style="margin:0; padding:0; font-family:Arial, sans-serif; background-color:#f4f6f8;">
        <div style="max-width:600px; margin:30px auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
            
            <!-- Header with gradient -->
            <div style="background:linear-gradient(135deg, #4f46e5, #9333ea); padding:30px; text-align:center; color:white;">
                <h1 style="margin:0;">Welcome, ${name}! 🎉</h1>
                <p style="margin-top:10px; font-size:14px;">We're excited to have you at Backend Ledger</p>
            </div>

            <!-- Body -->
            <div style="padding:30px; color:#333;">
                <p style="font-size:16px;">Hello <strong>${name}</strong>,</p>
                
                <p style="line-height:1.6;">
                    Thank you for registering at <strong>Backend Ledger</strong>.  
                    We're excited to have you on board!
                </p>

                <p style="line-height:1.6;">
                    You can now start managing your data efficiently and explore powerful backend features designed to simplify your workflow.
                </p>

                <!-- CTA Button -->
                <div style="text-align:center; margin:30px 0;">
                    <a href="#" style="background:#4f46e5; color:white; padding:12px 25px; border-radius:5px; text-decoration:none; font-weight:bold;">
                        Get Started
                    </a>
                </div>

                <p style="line-height:1.6;">
                    If you need any help, just reply to this email — we're always here for you.
                </p>

                <p style="margin-top:30px;">
                    Best regards,<br>
                    <strong>The Backend Ledger Team</strong>
                </p>
            </div>

            <!-- Footer -->
            <div style="background:#f9fafb; padding:15px; text-align:center; font-size:12px; color:#777;">
                © ${new Date().getFullYear()} Backend Ledger. All rights reserved.
            </div>
        </div>
    </div>
    `;

    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name, amount, toAccount) {
    const subject = 'Transaction Successful!';
    const text = `Hello ${name},\n\nYour transaction of $${amount} to account ${toAccount} was successful.\n\nBest regards,\nThe Backend Ledger Team`;
    const html = `<p>Hello ${name},</p><p>Your transaction of $${amount} to account ${toAccount} was successful.</p><p>Best regards,<br>The Backend Ledger Team</p>`;

    await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail, name, amount, toAccount) {
    const subject = 'Transaction Failed';
    const text = `Hello ${name},\n\nWe regret to inform you that your transaction of $${amount} to account ${toAccount} has failed. Please try again later.\n\nBest regards,\nThe Backend Ledger Team`;
    const html = `<p>Hello ${name},</p><p>We regret to inform you that your transaction of $${amount} to account ${toAccount} has failed. Please try again later.</p><p>Best regards,<br>The Backend Ledger Team</p>`;

    await sendEmail(userEmail, subject, text, html);
}
module.exports = {
    sendRegistrationEmail,
    sendTransactionEmail,
    sendTransactionFailureEmail
};