'use client';

import { useEffect, useState } from 'react';
//updating to use Supabase Auth
type Track = {
  name: string;
  artist: string;
  url: string;
  albumImage: string;
};

type Snapshot = {
  id: string;
  title: string;
  mood: string;
  dominant_color: string;
  created_at: string;
  note: string;
  vibe_score: number;
  delivery_date: string | null;
  tracks: Track[];
};

type UserProfile = {
  email: string;
  display_name: string;
};

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

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

    const fetchSnapshots = async () => {
      try {
        const res = await fetch('/api/snapshot/list', {
          method: 'GET',
          credentials: 'include', // ✅ include cookie
        });
        const data = await res.json();
        console.log('📦 Snapshot fetch result:', data);
        if (Array.isArray(data)) setSnapshots(data);
      } catch (err) {
        console.error('Error fetching snapshots:', err);
      }
    };

    fetchUser();
    fetchSnapshots();
  }, []);

  const handleLogin = () => {
    window.location.href = '/api/auth/login';
  };

  const fetchRecentlyPlayed = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/spotify/recently-played');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTracks(data);
      } else {
        console.error('Unexpected response:', data);
        setTracks([]);
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

  const handleSaveSnapshot = async () => {
    try {
      const enrichedTracks = tracks.map((track: any) => ({
        name: track.name,
        artist: track.artist,
        albumImage: track.albumImage,
        url: track.url,
      }));

      const deliveryDateInput = prompt('when do you want this to be delivered? (YYYY-MM-DD)');

      const payload = {
        title: prompt('Enter a title for this snapshot:', 'My Vibe') || 'Untitled Snapshot',
        note: prompt('Add an optional note?') || '',
        tracks: enrichedTracks,
        mood: 'chill',
        dominant_color: '#f2c94c',
        vibe_score: 0.8,
        delivery_date: deliveryDateInput ? new Date(deliveryDateInput).toISOString() : null,
      };

      const res = await fetch('/api/snapshot/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include', // ✅ ensure cookie is sent
      });

      const data = await res.json();
      if (res.ok) {
        alert('✅ Snapshot saved!');
        const newList = await fetch('/api/snapshot/list', {
          method: 'GET',
          credentials: 'include',
        }).then((r) => r.json());
        console.log('🆕 Snapshot list after save:', newList);
        setSnapshots(newList);
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

        <div className="flex gap-4 mb-6 flex-wrap justify-center">
          <button
            onClick={handleLogin}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg shadow"
          >
            Log in with Spotify
          </button>

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
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg shadow"
            >
              💾 Save Snapshot
            </button>
          )}
        </div>

        {tracks.length === 0 && (
          <p className="text-gray-400 mb-4">No top tracks found. Start listening on Spotify 🎧</p>
        )}

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl mb-10">
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

        {snapshots.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mt-12 mb-4">📦 Your Snapshots</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
              {snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="p-4 rounded-xl shadow-md text-white"
                  style={{ background: snap.dominant_color || '#333' }}
                >
                  <h3 className="text-xl font-semibold">{snap.title || 'Untitled Snapshot'}</h3>
                  <p className="text-sm text-white/80 italic mb-2">{snap.mood || 'Unknown Mood'}</p>
                  <p className="text-sm text-white/60 mb-2">
                    Saved on {new Date(snap.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-white/60 mb-2">
                   🎨 your color hexcode: {snap.dominant_color}
                  </p>
                  <p className="text-sm text-white/60 mb-2">
                   📝 your note: {snap.note}
                  </p>
                  <p className="text-sm text-white/60 mb-2">
                   💃 danceability: {snap.vibe_score}
                  </p>
                  <p className="text-sm text-white/60 mb-2">
                  Delivery Date: {snap.delivery_date ? new Date(snap.delivery_date).toLocaleDateString() : 'Immediately'}
                  </p>
                  {Array.isArray(snap.tracks) && snap.tracks.length > 0 && (
                    <ul className="text-sm list-disc ml-5">
                      {snap.tracks.slice(0, 3).map((track, i) => (
                        <li key={i}>
                          {track.name} — {track.artist}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {user && (
        <footer className="mt-10 text-gray-400 text-sm">
          Logged in as: <span className="text-white">{user.email}</span>
        </footer>
      )}
    </main>
  );
}
