import { NextResponse } from 'next/server';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET() {
  const scope = [
    'user-read-email',
    'user-read-private',
    'user-top-read',
    'playlist-read-private',
    'user-read-recently-played'
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
