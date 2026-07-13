'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAuthErrorMessage } from '@/lib/auth/auth-errors';

export default function LoginPageClient() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Falls die Middleware oder NextAuth einen Fehler mitgibt (z.B. ?error=Rejected)
    const errorParam = searchParams.get('error');
    // Falls der User von einer bestimmten Seite kam, leiten wir ihn nach dem Login dorthin
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

    const [scHandle, setScHandle] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);
    const error = localError || getAuthErrorMessage(errorParam);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setLocalError(null);

        // Aufruf des NextAuth Credentials-Providers
        const result = await signIn('credentials', {
            sc_handle: scHandle,
            password: password,
            redirect: false, // Wir handhaben den Redirect manuell für bessere Kontrolle
        });

        if (result?.error) {
            setLocalError(getAuthErrorMessage(result.error));
            setLoading(false);
        } else {
            // Login erfolgreich -> Weiterleitung an die Callback-URL oder das Dashboard
            router.push(callbackUrl);
            router.refresh(); // Aktualisiert den Session-State in der Next.js App
        }
    };

    return (
        <div className="w-full max-w-md space-y-8 rounded-xl bg-slate-900 p-8 border border-slate-800 shadow-2xl">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight">Anmeldung</h2>
                <p className="mt-2 text-sm text-slate-400">
                    Gib dein RSI Handle ein, um fortzufahren
                </p>
            </div>

            {error && (
                <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20 text-center">
                    {error}
                </div>
            )}

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4 rounded-md shadow-sm">
                    <div>
                        <label
                            htmlFor="sc_handle"
                            className="block text-sm font-medium text-slate-300 mb-1"
                        >
                            RSI Handle
                        </label>
                        <input
                            id="sc_handle"
                            name="sc_handle"
                            type="text"
                            required
                            value={scHandle}
                            onChange={(e) => setScHandle(e.target.value)}
                            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 sm:text-sm"
                            placeholder="z.B. RobertsSpaceInd"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-slate-300 mb-1"
                        >
                            Passwort
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 sm:text-sm"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative flex w-full justify-center rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Verifiziere...' : 'Einloggen'}
                    </button>
                </div>
            </form>
        </div>
    );
}
