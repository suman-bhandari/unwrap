import { NextRequest, NextResponse } from 'next/server';
import { sendGiftEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      recipientEmail,
      recipientName,
      title,
      message,
      scheduledFor,
      senderName
    } = body;

    // Validate required fields
    if (!recipientEmail || !title || !senderName) {
      return NextResponse.json(
        { error: 'Missing required fields: recipientEmail, title, senderName' },
        { status: 400 }
      );
    }

    // For now, we'll use the demo gift page
    // In a real app, you'd save to the database first and create a unique ID
    const mockGiftId = 'demo';

    // Send the email
    const emailResult = await sendGiftEmail({
      to: recipientEmail,
      recipientName,
      senderName,
      giftTitle: title,
      giftId: mockGiftId,
      message,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
    });

    return NextResponse.json({
      success: true,
      giftId: mockGiftId,
      emailSent: emailResult.success,
      messageId: emailResult.messageId,
    });

  } catch (error) {
    console.error('Send gift error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to send gift';
    if (error instanceof Error && error.message.includes('domain')) {
      errorMessage = 'Email configuration error. Please check your Resend setup.';
    } else if (error instanceof Error && error.message.includes('API key')) {
      errorMessage = 'Invalid email API key. Please check your Resend configuration.';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
