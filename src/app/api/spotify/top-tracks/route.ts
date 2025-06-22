export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getValidSpotifyAccessToken } from '@/utils/getValidSpotifyAccessToken';
import axios from 'axios';

type SpotifyArtist = { name: string };
type SpotifyTrack = {
  name: string;
  artists: SpotifyArtist[];
  external_urls: { spotify: string };
  album: { images: { url: string }[] };
};

export async function GET() {
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
    const response = await axios.get<{ items: SpotifyTrack[] }>(
      'https://api.spotify.com/v1/me/top/tracks',
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 10, time_range: 'medium_term' },
      }
    );

    const simplified = response.data.items.map((track) => ({
      name: track.name,
      artist: track.artists.map((a) => a.name).join(', '),
      url: track.external_urls.spotify,
      albumImage: track.album.images?.[0]?.url || null,
    }));

    return NextResponse.json(simplified);
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      console.error('Spotify API error:', {
        status: err.response.status,
        data: err.response.data,
      });
    } else {
      console.error('Error fetching top tracks:', (err as Error).message);
    }

    return NextResponse.json({ error: 'Spotify API error' }, { status: 500 });
  }
}
