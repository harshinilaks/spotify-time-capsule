import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';

//this essentially - grabs spotify ID from cookies, accepts a POST body
//with enriched track and metadata information, and 
//subsequently inserts that data into the Supabase snapshots table
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const cookieStore =  await Promise.resolve(cookies());
    const spotify_id = cookieStore.get('spotify_id')?.value;
    if (!spotify_id) {
      return NextResponse.json({ error: 'No Spotify ID found' }, { status: 401 });
    }

    const { tracks, title, note, mood, dominant_color, vibe_score, delivery_date } = await request.json();

    if (!Array.isArray(tracks) || tracks.length === 0) {
      return NextResponse.json({ error: 'Invalid track list' }, { status: 400 });
    }

    const { error } = await supabase.from('snapshots').insert({
      spotify_id,
      title: title || 'Untitled Snapshot',
      note: note || '',
      tracks,
      mood,
      dominant_color,
      vibe_score,
      delivery_date: delivery_date ? new Date(delivery_date) : null,
    });

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to save snapshot' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Snapshot creation error:', err);
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}
