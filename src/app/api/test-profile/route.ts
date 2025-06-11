export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getValidSpotifyAccessToken } from '@/utils/getValidSpotifyAccessToken';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const spotify_id = '31jsd23u7wvqeo6wledqa4lfgf6q'; // ← Replace with your actual Spotify ID (you can get it from your Supabase row)

  const token = await getValidSpotifyAccessToken(spotify_id);

  if (!token) {
    return NextResponse.json({ error: 'Failed to get access token' }, { status: 500 });
  }

  try {
    const profile = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return NextResponse.json(profile.data);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Spotify API error' }, { status: 500 });
  }
}
