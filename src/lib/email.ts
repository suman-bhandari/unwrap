import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const isDevelopment = !process.env.RESEND_API_KEY || 
  process.env.RESEND_API_KEY === 'your_resend_api_key_here' ||
  process.env.NODE_ENV === 'development';

interface SendGiftEmailParams {
  to: string;
  recipientName?: string;
  senderName: string;
  giftTitle: string;
  giftId: string;
  message?: string;
  scheduledFor?: Date;
}

export async function sendGiftEmail({
  to,
  recipientName,
  senderName,
  giftTitle,
  giftId,
  message,
  scheduledFor
}: SendGiftEmailParams) {
  const giftUrl = `${process.env.NEXT_PUBLIC_APP_URL}/gift/${giftId}`;
  
  // Development mode - simulate email sending
  if (isDevelopment) {
    console.log('📧 DEVELOPMENT MODE - Email would be sent to:', to);
    console.log('Subject:', `🎁 You have a gift from ${senderName}!`);
    console.log('Gift URL:', giftUrl);
    console.log('Message:', message);
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { 
      success: true, 
      messageId: 'dev-' + Date.now(),
      isDevelopment: true 
    };
  }
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'Unwrap <onboarding@resend.dev>',
      to: [to],
      subject: `🎁 You have a gift from ${senderName}!`,
      html: generateGiftEmailHTML({
        recipientName,
        senderName,
        giftTitle,
        giftUrl,
        message,
        scheduledFor
      }),
    });

    if (error) {
      console.error('Email send error:', error);
      
      // If it's a domain verification error or testing restriction, fall back to development mode
      const errorMessage = (error as { error?: string }).error || '';
      if (error.name === 'validation_error' && (
        errorMessage.includes('domain') || 
        errorMessage.includes('testing emails') ||
        errorMessage.includes('your own email address')
      )) {
        console.log('📧 Falling back to development mode due to Resend restrictions');
        console.log('📧 DEVELOPMENT MODE - Email would be sent to:', to);
        console.log('Subject:', `🎁 You have a gift from ${senderName}!`);
        console.log('Gift URL:', giftUrl);
        console.log('Message:', message);
        
        return { 
          success: true, 
          messageId: 'fallback-' + Date.now(),
          isDevelopment: true 
        };
      }
      
      throw new Error('Failed to send email');
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}

function generateGiftEmailHTML({
  recipientName,
  senderName,
  giftTitle,
  giftUrl,
  message,
  scheduledFor
}: {
  recipientName?: string;
  senderName: string;
  giftTitle: string;
  giftUrl: string;
  message?: string;
  scheduledFor?: Date;
}) {
  const greeting = recipientName ? `Hi ${recipientName}` : 'Hi there';
  const isScheduled = scheduledFor && scheduledFor > new Date();
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>You have a gift!</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #fdf2f8 0%, #ffffff 50%, #f0fdfa 100%);
          line-height: 1.6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .gift-box {
          width: 120px;
          height: 120px;
          background: linear-gradient(135deg, #ff6b6b, #ee5a52);
          border-radius: 12px;
          position: relative;
          margin: 20px auto;
          box-shadow: 0 10px 25px -5px rgba(255, 107, 107, 0.3);
        }
        .gift-box::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 16px;
          height: 100%;
          background: linear-gradient(180deg, #ffd93d, #f7cc2d);
        }
        .gift-box::after {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 100%;
          height: 16px;
          background: linear-gradient(90deg, #ffd93d, #f7cc2d);
        }
        .bow {
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 32px;
          height: 24px;
          background: linear-gradient(135deg, #ffd93d, #f7cc2d);
          border-radius: 50%;
        }
        .card {
          background: white;
          border-radius: 16px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin: 20px 0;
        }
        .title {
          color: #2c3e50;
          font-size: 28px;
          font-weight: 700;
          margin: 20px 0 10px;
          background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .subtitle {
          color: #6b7280;
          font-size: 16px;
          margin-bottom: 30px;
        }
        .message {
          background: linear-gradient(135deg, #ff6b6b10, #4ecdc410);
          padding: 20px;
          border-radius: 12px;
          margin: 20px 0;
          font-style: italic;
          color: #374151;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #ff6b6b, #ee5a52);
          color: white;
          text-decoration: none;
          padding: 16px 32px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 18px;
          margin: 20px 0;
          transition: transform 0.2s ease;
        }
        .button:hover {
          transform: translateY(-2px);
        }
        .scheduled {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          color: #92400e;
          padding: 12px;
          border-radius: 8px;
          margin: 20px 0;
          font-size: 14px;
        }
        .footer {
          text-align: center;
          color: #6b7280;
          font-size: 14px;
          margin-top: 40px;
        }
        .sparkle {
          display: inline-block;
          font-size: 20px;
          animation: sparkle 2s ease-in-out infinite;
        }
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 20px;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2">
              <polyline points="20,12 20,22 4,22 4,12"></polyline>
              <rect x="2" y="7" width="20" height="5"></rect>
              <line x1="12" y1="22" x2="12" y2="7"></line>
              <path d="m12,7 0,-3 1.5,0 0,-1.5 -3,0 0,1.5 1.5,0 0,3"></path>
            </svg>
            <h1 style="color: #ff6b6b; font-size: 24px; font-weight: 700; margin: 0;">Unwrap</h1>
          </div>
          
          <h2>${greeting}! <span class="sparkle">✨</span></h2>
          
          <div class="gift-box">
            <div class="bow"></div>
          </div>
          
          <h1 class="title">You have a gift!</h1>
          <p class="subtitle">From ${senderName} with love</p>
          
          <h3 style="color: #374151; font-size: 20px; margin: 20px 0 10px;">${giftTitle}</h3>
          
          ${message ? `<div class="message">"${message}"</div>` : ''}
          
          ${isScheduled ? `
            <div class="scheduled">
              <strong>🕐 Scheduled Delivery</strong><br>
              This gift will be available on ${scheduledFor.toLocaleDateString()} at ${scheduledFor.toLocaleTimeString()}
            </div>
          ` : ''}
          
          <a href="${giftUrl}" class="button">
            🎁 Open Your Gift
          </a>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            Click the button above to unwrap your magical gift experience!
          </p>
        </div>
        
        <div class="footer">
          <p>Made with ❤️ by Unwrap</p>
          <p style="font-size: 12px; color: #9ca3af;">
            This email was sent because someone created a gift for you. 
            If you believe this was sent in error, you can safely ignore this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendThankYouEmail({
  senderEmail,
  senderName,
  recipientName,
  giftTitle
}: {
  senderEmail: string;
  senderName: string;
  recipientName: string;
  giftTitle: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Unwrap <onboarding@resend.dev>',
      to: [senderEmail],
      subject: `💝 ${recipientName} says thank you!`,
      html: generateThankYouEmailHTML({
        senderName,
        recipientName,
        giftTitle
      }),
    });

    if (error) {
      console.error('Thank you email send error:', error);
      throw new Error('Failed to send thank you email');
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Thank you email send error:', error);
    throw error;
  }
}

function generateThankYouEmailHTML({
  senderName,
  recipientName,
  giftTitle
}: {
  senderName: string;
  recipientName: string;
  giftTitle: string;
}) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank you received!</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #fdf2f8 0%, #ffffff 50%, #f0fdfa 100%);
          line-height: 1.6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .card {
          background: white;
          border-radius: 16px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin: 20px 0;
        }
        .title {
          color: #2c3e50;
          font-size: 28px;
          font-weight: 700;
          margin: 20px 0 10px;
          background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .heart {
          font-size: 48px;
          margin: 20px 0;
          animation: heartbeat 1.5s ease-in-out infinite;
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 20px;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2">
              <polyline points="20,12 20,22 4,22 4,12"></polyline>
              <rect x="2" y="7" width="20" height="5"></rect>
              <line x1="12" y1="22" x2="12" y2="7"></line>
              <path d="m12,7 0,-3 1.5,0 0,-1.5 -3,0 0,1.5 1.5,0 0,3"></path>
            </svg>
            <h1 style="color: #ff6b6b; font-size: 24px; font-weight: 700; margin: 0;">Unwrap</h1>
          </div>
          
          <div class="heart">❤️</div>
          
          <h1 class="title">Thank you received!</h1>
          
          <p style="color: #374151; font-size: 18px; margin: 20px 0;">
            Hi ${senderName}!
          </p>
          
          <p style="color: #6b7280; font-size: 16px; margin: 20px 0;">
            Great news! ${recipientName} has opened and loved their gift: 
            <strong>"${giftTitle}"</strong>
          </p>
          
          <p style="color: #6b7280; font-size: 16px; margin: 20px 0;">
            Your thoughtful gift has brought joy to someone special. 
            Thank you for using Unwrap to create magical moments! ✨
          </p>
          
          <div style="background: linear-gradient(135deg, #ff6b6b10, #4ecdc410); padding: 20px; border-radius: 12px; margin: 30px 0;">
            <p style="color: #374151; font-weight: 600; margin: 0;">
              💝 Mission accomplished! You've successfully created a memorable gift experience.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 40px;">
          <p>Made with ❤️ by Unwrap</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
