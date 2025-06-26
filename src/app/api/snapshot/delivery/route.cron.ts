import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const config = {
  schedule: '0 8 * * *', 
};

export const runtime = 'nodejs';

export async function GET() {
  const today = new Date().toISOString().split('T')[0];

  const { data: snapshots, error } = await supabase
    .from('snapshots')
    .select('*')
    .eq('delivery_date', today);

  if (error) {
    return NextResponse.json({ error: 'Error fetching snapshots' }, { status: 500 });
  }

  for (const snap of snapshots) {
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/snapshot/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        spotify_id: snap.spotify_id,
        snapshot_id: snap.id,
      }),
    });
  }

  return NextResponse.json({ success: true });
}