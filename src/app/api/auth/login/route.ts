import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const scope = [
    'user-read-email',
    'user-read-private',
    'user-top-read',
    'playlist-read-private',
  ].join(' ');

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    scope,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
  });

  return NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`
  );
}
