'use client';

import { useEffect, useState } from 'react';

type Track = {
  name: string;
  artist: string;
  url: string;
  albumImage: string;
};

type UserProfile = {
  email: string;
  display_name: string;
};

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  //for my testing recently played route!
  const fetchRecentlyPlayed = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/spotify/recently-played');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTracks(data);
      } else {
        console.error('Unexpected response:', data);
        setTracks([]); // fallback to empty
      }
    } catch (err) {
      console.error('Failed to fetch recent tracks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopTracks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/spotify/top-tracks');
      const data = await res.json();
      setTracks(data);
    } catch (err) {
      console.error('Failed to fetch tracks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/spotify/me');
        const data = await res.json();
        if (!data.error) setUser(data);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      }
    };

    fetchUser();
  }, []);

  const handleLogin = () => {
    window.location.href = '/api/auth/login';
  };

  const handleSaveSnapshot = async () => {
    try {
      const enrichedTracks = tracks.map((track: any) => ({
        name: track.name,
        artist: track.artist,
        albumImage: track.albumImage,
        url: track.url,
      }));
  
      const payload = {
        title: prompt('Enter a title for this snapshot:', 'My Vibe') || 'Untitled Snapshot',
        note: prompt('Add an optional note?') || '',
        tracks: enrichedTracks,
        mood: 'chill', // TODO: make this dynamic later!
        dominant_color: '#f2c94c', // TODO: extract from album art later!
        vibe_score: 0.8, // placeholder
      };
  
      const res = await fetch('/api/snapshot/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      const data = await res.json();
      if (res.ok) {
        alert('✅ Snapshot saved successfully!');
      } else {
        console.error('Snapshot save failed:', data);
        alert('❌ Failed to save snapshot.');
      }
    } catch (err) {
      console.error('Unexpected error saving snapshot:', err);
      alert('❌ Something went wrong.');
    }
  };
  

  return (
    <main className="flex flex-col items-center py-10 px-6 min-h-screen justify-between">
      <div className="w-full flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-8 text-center">Spotify Time Capsule 🎶</h1>

        <div className="flex gap-4 mb-6">
          <button
            onClick={handleLogin}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg shadow"
          >
            Log in with Spotify
          </button>
          {/* testing for recently played for the time being */}
          <button
            onClick={fetchRecentlyPlayed}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg shadow"
          >
          {loading ? 'Loading...' : 'Recently Played'}
        </button>

          <button
            onClick={fetchTopTracks}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg shadow"
          >
            {loading ? 'Loading...' : 'Fetch My Top Tracks'}
          </button>

          {tracks.length > 0 && (
  <button
    onClick={handleSaveSnapshot}
    className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow"
  >
    💾 Save Snapshot
  </button>
)}
        </div>

        {tracks.length === 0 && (
          <p className="text-gray-400">No top tracks found. Start listening on Spotify 🎧</p>
        )}

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
          {tracks.map((track, idx) => (
            <li
              key={idx}
              className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg"
            >
              <img src={track.albumImage} alt="" className="w-16 h-16 rounded-md" />
              <div>
                <p className="text-lg font-semibold">{track.name}</p>
                <p className="text-sm text-gray-400">{track.artist}</p>
                <a
                  href={track.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-300 underline"
                >
                  Open in Spotify
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {user && (
        <footer className="mt-10 text-gray-400 text-sm">
          Logged in as: <span className="text-white">{user.email}</span>
        </footer>
      )}
    </main>
  );
}
