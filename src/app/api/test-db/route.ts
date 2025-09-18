import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Test basic connection
    const { data, error } = await supabase
      .from('gifts')
      .select('count')
      .limit(1);
    
    if (error) {
      return NextResponse.json({
        status: 'error',
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      }, { status: 500 });
    }
    
    return NextResponse.json({
      status: 'ok',
      message: 'Database connection successful',
      data: data
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Test insert with minimal data
    const testGift = {
      sender_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      recipient_email: 'test@example.com',
      title: 'Test Gift',
      message: 'Test message'
    };
    
    const { data, error } = await supabase
      .from('gifts')
      .insert(testGift)
      .select()
      .single();
    
    if (error) {
      return NextResponse.json({
        status: 'error',
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      }, { status: 500 });
    }
    
    // Clean up test data
    await supabase
      .from('gifts')
      .delete()
      .eq('id', data.id);
    
    return NextResponse.json({
      status: 'ok',
      message: 'Database insert test successful',
      data: data
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
