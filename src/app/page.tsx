'use client';

export default function Home() {
  const handleLogin = () => {
    window.location.href = '/api/auth/login';
  };

  return (
    <main className="flex h-screen justify-center items-center flex-col">
      <h1 className="text-4xl font-bold mb-8">Spotify Time Capsule 🎵</h1>
      <button
        onClick={handleLogin}
        className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transition"
      >
        Login with Spotify
      </button>
    </main>
  );
}
