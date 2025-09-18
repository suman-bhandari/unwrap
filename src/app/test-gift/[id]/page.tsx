'use client';

import { useState, useEffect } from 'react';

interface TestGiftPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TestGiftPage({ params }: TestGiftPageProps) {
  const [gift, setGift] = useState<{ id: string; title: string; message: string; recipient_name: string; sender_name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testGiftAccess = async () => {
      try {
        setLoading(true);
        const resolvedParams = await params;
        
        console.log('Testing gift access for ID:', resolvedParams.id);
        
        // Test with a simple fetch to Supabase REST API
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/gifts?id=eq.${resolvedParams.id}&select=*`,
          {
            headers: {
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', errorText);
          setError(`API Error: ${response.status} - ${errorText}`);
          return;
        }

        const data = await response.json();
        console.log('API Response:', data);

        if (data && data.length > 0) {
          setGift(data[0]);
        } else {
          setError('No gift found');
        }
      } catch (err) {
        console.error('Test error:', err);
        setError(`Test error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    testGiftAccess();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2">Testing gift access...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">Success!</h1>
        <p className="text-gray-600">Gift found and accessible</p>
        <pre className="mt-4 p-4 bg-gray-100 rounded text-left text-sm overflow-auto">
          {JSON.stringify(gift, null, 2)}
        </pre>
      </div>
    </div>
  );
}
