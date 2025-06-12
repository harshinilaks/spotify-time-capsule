export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getValidSpotifyAccessToken } from '@/utils/getValidSpotifyAccessToken';
import { cookies } from 'next/headers';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const spotify_id = cookieStore.get('spotify_id')?.value;

  if (!spotify_id) {
    return NextResponse.json({ error: 'No Spotify ID found in cookies' }, { status: 401 });
  }

  const token = await getValidSpotifyAccessToken(spotify_id);

  if (!token) {
    return NextResponse.json({ error: 'Failed to get access token' }, { status: 500 });
  }

  try {
    const response = await axios.get(
      'https://api.spotify.com/v1/me/player/recently-played',
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 10 },
      }
    );

    const simplified = response.data.items.map((item: any) => {
      const track = item.track;
      return {
        name: track.name,
        artist: track.artists.map((a: any) => a.name).join(', '),
        url: track.external_urls.spotify,
        albumImage: track.album.images?.[0]?.url || null,
        playedAt: item.played_at,
      };
    });

    return NextResponse.json(simplified);
} catch (err: any) {
    if (err.response) {
      console.error('Spotify API error response:', {
        status: err.response.status,
        data: err.response.data,
      });
    } else {
      console.error('Error fetching recently played:', err.message);
    }
  
    return NextResponse.json({ error: 'Spotify API error' }, { status: 500 });
  }
}
