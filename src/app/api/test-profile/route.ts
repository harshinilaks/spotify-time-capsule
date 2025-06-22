export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getValidSpotifyAccessToken } from '@/utils/getValidSpotifyAccessToken';
import axios from 'axios';

export async function GET() {
  const spotify_id = '31jsd23u7wvqeo6wledqa4lfgf6q'; 

  const token = await getValidSpotifyAccessToken(spotify_id);

  if (!token) {
    return NextResponse.json({ error: 'Failed to get access token' }, { status: 500 });
  }

  try {
    const profileRes = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return NextResponse.json(profileRes.data);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error('Spotify API error:', {
        status: err.response?.status,
        data: err.response?.data,
      });
    } else {
      console.error('Unknown error:', (err as Error).message);
    }

    return NextResponse.json({ error: 'Spotify API error' }, { status: 500 });
  }
}
