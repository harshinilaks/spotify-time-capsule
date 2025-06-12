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
    // fetching user's Spotify profile info here
    const userResponse = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      const { id: spotify_id, display_name } = userResponse.data;
      // here we are calculating token expiry timestamp (in UNIX time)
      const expires_at = Math.floor(Date.now() / 1000) + expires_in;

      // upserting this into Supabase - analyze this
      await supabase.from('users').upsert({
        spotify_id,
        display_name,
        access_token,
        refresh_token,
        expires_at,
      }, { onConflict: 'spotify_id' });
      //replacing hardcoded spotify_id(rn the app is always pulling from the original user's 
      //token in Supabase. so now, we are going to store the current spotify ID in a cookie.)
      const res = NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/`);
      res.cookies.set('spotify_id', spotify_id, {
        path: '/',
        httpOnly: false, // frontend needs accesss
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return res;
  
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
