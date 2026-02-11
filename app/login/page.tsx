'use client';

import { useState } from 'react';
import { createClient } from '@/app/api/supabase/client';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  const signInWithGoogle = async () => {
    setError(null);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signInError) setError(signInError.message);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/80 dark:bg-black/40 rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-semibold mb-2">Sign in</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          Use Google to save your survey results and recommendations.
        </p>

        <button
          onClick={signInWithGoogle}
          className="w-full py-2 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
        >
          Continue with Google
        </button>

        {error && <div className="text-red-500 text-sm mt-4">{error}</div>}
      </div>
    </main>
  );
}