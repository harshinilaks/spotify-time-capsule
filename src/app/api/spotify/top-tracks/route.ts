//this essentially pulls your top 10 tracks over the past 6 months - also refreshes the token
//if necessary
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getValidSpotifyAccessToken } from '@/utils/getValidSpotifyAccessToken';
import axios from 'axios';

export async function GET(request: NextRequest) {
  // TODO: Replace with dynamic user ID later
  const cookieStore = await cookies();
  const spotify_id = cookieStore.get('spotify_id')?.value;

if (!spotify_id) {
  return NextResponse.json({ error: 'No Spotify ID found in cookies' }, { status: 401 });
}

  const token = await getValidSpotifyAccessToken(spotify_id);

  if (!token) {
    return NextResponse.json({ error: 'Failed to get access token' }, { status: 500 });
  }

  try {
    const response = await axios.get('https://api.spotify.com/v1/me/top/tracks', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        limit: 10,
        time_range: 'medium_term', // Options: short_term, medium_term, long_term
      },
    });

    const simplified = response.data.items.map((track: any) => ({
      name: track.name,
      artist: track.artists.map((a: any) => a.name).join(', '),
      url: track.external_urls.spotify,
      albumImage: track.album.images?.[0]?.url || null,
    }));

    return NextResponse.json(simplified);
  } catch (err: any) {
    console.error('Error fetching top tracks:', err.message);
    return NextResponse.json({ error: 'Spotify API error' }, { status: 500 });
  }
}
