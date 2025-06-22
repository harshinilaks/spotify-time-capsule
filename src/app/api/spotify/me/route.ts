export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getValidSpotifyAccessToken } from '@/utils/getValidSpotifyAccessToken';
import { cookies } from 'next/headers';
import axios from 'axios';

export async function GET() {
  // TEMP: hardcoded for dev
  //cookies -> allow for application to dynamically use whichever spotify user is 
  //currently authenticated
  const cookieStore = await cookies();
  const spotify_id = cookieStore.get('spotify_id')?.value;

if (!spotify_id) {
  return NextResponse.json({ error: 'No Spotify ID found in cookies' }, { status: 401 });
}
  const token = await getValidSpotifyAccessToken(spotify_id);

  if (!token) {
    return NextResponse.json({ error: 'No token' }, { status: 401 });
  }

  try {
    const profileRes = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${token}` },
    });

    return NextResponse.json({
      email: profileRes.data.email,
      display_name: profileRes.data.display_name,
      id: profileRes.data.id,
    });
  } catch (error) {
    console.error('Spotify profile fetch failed:', error);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
}
