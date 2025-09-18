import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if we can access environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    return NextResponse.json({
      status: 'ok',
      supabaseConfigured: !!(supabaseUrl && supabaseKey),
      supabaseUrl: supabaseUrl ? 'Set' : 'Missing',
      supabaseKey: supabaseKey ? 'Set' : 'Missing',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

