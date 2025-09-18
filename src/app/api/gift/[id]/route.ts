import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Create a clean Supabase client for server-side operations
    const supabase = await createServerSupabaseClient();
    
    // Fetch gift from database
    const { data: gift, error } = await supabase
      .from('gifts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching gift:', error);
      return NextResponse.json(
        { error: 'Gift not found', details: error.message },
        { status: 404 }
      );
    }

    if (!gift) {
      return NextResponse.json(
        { error: 'Gift not found' },
        { status: 404 }
      );
    }

    // Return gift data
    return NextResponse.json({
      success: true,
      gift: {
        id: gift.id,
        title: gift.title,
        message: gift.message,
        recipient_name: gift.recipient_name,
        sender_name: gift.sender_name,
        video_url: gift.video_url,
        reservation_details: gift.reservation_details,
        scheduled_for: gift.scheduled_for,
        is_opened: gift.is_opened,
        opened_at: gift.opened_at,
        created_at: gift.created_at,
        updated_at: gift.updated_at
      }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Create a clean Supabase client for server-side operations
    const supabase = await createServerSupabaseClient();
    
    // Update gift in database
    const { data: gift, error } = await supabase
      .from('gifts')
      .update({ 
        is_opened: body.is_opened || true,
        opened_at: body.is_opened ? new Date().toISOString() : null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating gift:', error);
      return NextResponse.json(
        { error: 'Failed to update gift', details: error.message },
        { status: 500 }
      );
    }

    // Track the opening event
    if (body.is_opened) {
      await supabase
        .from('gift_opens')
        .insert({
          gift_id: id,
          opened_at: new Date().toISOString(),
          user_agent: request.headers.get('user-agent') || 'Unknown'
        });
    }

    return NextResponse.json({
      success: true,
      gift: {
        id: gift.id,
        title: gift.title,
        message: gift.message,
        recipient_name: gift.recipient_name,
        sender_name: gift.sender_name,
        video_url: gift.video_url,
        reservation_details: gift.reservation_details,
        scheduled_for: gift.scheduled_for,
        is_opened: gift.is_opened,
        opened_at: gift.opened_at,
        created_at: gift.created_at,
        updated_at: gift.updated_at
      }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
