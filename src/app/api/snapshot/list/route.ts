//this essentially fetches all snapshots for the current useer
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET() {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const spotify_id = cookieStore.get('spotify_id')?.value;
    
    console.log('🍪 All cookies received by list API:', allCookies);
    console.log('🎧 spotify_id received in list API:', spotify_id);

  if (!spotify_id) {
    return NextResponse.json({ error: 'Missing Spotify ID' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('snapshots')
    .select('*')
    .eq('spotify_id', spotify_id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch snapshots' }, { status: 500 });
  }

  return NextResponse.json(data);
}
