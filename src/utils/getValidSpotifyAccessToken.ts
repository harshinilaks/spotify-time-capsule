//right now, we are storing access_token, refresh_token, and expires_at in Supabase 
//access tokens expire after one hour - so, we need a system to detect when the token is expired, 
//and then refresh it using the stored refresh_token 

//quick recap of how spotify refresh tokens work -> you use the refresh_token to get a new access_token, 
//where no user interaction is required. 

//design of our refresh system 
//backend helper function that -> gets a user's current access_token from supabase, checks if it's 
//expired, and if expired: uses the refresh_token to get a new one & updates supabase. then, 
//it returns a valid token that you can use to make Spotify API calls 

import { supabase } from '@/lib/supabase';
import axios from 'axios';

export async function getValidSpotifyAccessToken(spotify_id: string): Promise<string | null> {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('spotify_id', spotify_id)
    .single();

  if (error || !user) {
    console.error('User not found:', error);
    return null;
  }

  const now = Math.floor(Date.now() / 1000);

  if (user.expires_at > now) {
    // this means that the token is still valid!
    return user.access_token;
  }

  // in the other case, we have to refresh the token!
  const refreshToken = user.refresh_token;

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: process.env.SPOTIFY_CLIENT_ID!,
    client_secret: process.env.SPOTIFY_CLIENT_SECRET!,
  });

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token', body.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token, expires_in } = response.data;

    const newExpiresAt = Math.floor(Date.now() / 1000) + expires_in;

    // here we are updating Supabase
    await supabase
      .from('users')
      .update({
        access_token,
        expires_at: newExpiresAt,
      })
      .eq('spotify_id', spotify_id);

    return access_token;
  } catch (err) {
    console.error('Error refreshing token:', err);
    return null;
  }
}
