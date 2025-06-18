export const runtime = 'nodejs'; 

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { supabase } from '@/lib/supabase';

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

    // Fetch user profile info from Spotify
    const userResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const { id: spotify_id, display_name } = userResponse.data;

    const expires_at = Math.floor(Date.now() / 1000) + expires_in;

    // Upsert user into Supabase
    await supabase.from('users').upsert(
      {
        spotify_id,
        display_name,
        access_token,
        refresh_token,
        expires_at,
      },
      { onConflict: 'spotify_id' }
    );

    const redirectResponse = NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/`);
    redirectResponse.cookies.set('spotify_id', spotify_id, {
      path: '/',
      httpOnly: false, // client needs access
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
    });

    return redirectResponse;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('OAuth callback error:', {
        message: error.message,
        stack: error.stack,
      });
    }

    if (typeof error === 'object' && error && 'response' in error) {
      const response = (error as any).response?.data;
      console.error('Spotify API error response:', response);
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/error`);
  }
}
