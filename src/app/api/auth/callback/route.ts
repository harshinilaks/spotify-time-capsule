import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code || '',
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    client_secret: process.env.SPOTIFY_CLIENT_SECRET!,
  });

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      body.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, refresh_token, expires_in } = response.data;
    console.log('Access Token:', access_token);
    console.log('Refresh Token:', refresh_token);
    console.log('Expires In:', expires_in);

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/success`);
  } catch (error) {
    console.error('Error getting Spotify tokens:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/error`);
  }
}
