'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [successData, setSuccessData] = useState<{ token: string; handle: string } | null>(null);

    async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        const formData = new FormData(event.currentTarget);
        const sc_handle = formData.get('sc_handle');
        const password = formData.get('password');

        startTransition(async () => {
            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sc_handle, password }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Etwas ist schiefgelaufen.');
                }

                // Erfolg: Wir speichern die Daten, um den Token anzuzeigen
                setSuccessData({
                    token: data.user.verification_token,
                    handle: data.user.sc_handle,
                });
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('Ein unerwarteter Fehler ist aufgetreten.');
                }
            }
        });
    }

    // Wenn die Registrierung erfolgreich war, zeigen wir den Verifizierungstoken an
    if (successData) {
        return (
            <div
                style={{
                    maxWidth: '400px',
                    margin: '40px auto',
                    padding: '20px',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                }}
            >
                <h2>Registrierung erfolgreich! 🚀</h2>
                <p>
                    Hallo <strong>{successData.handle}</strong>, dein Account wurde im System
                    angelegt.
                </p>

                <div
                    style={{
                        background: '#f0f0f0',
                        padding: '15px',
                        borderRadius: '4px',
                        margin: '20px 0',
                        borderLeft: '4px solid #0070f3',
                    }}
                >
                    <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>
                        Dein persönlicher Verifizierungscode:
                    </p>
                    <code
                        style={{
                            fontSize: '18px',
                            letterSpacing: '1px',
                            display: 'block',
                            textAlign: 'center',
                            background: '#fff',
                            padding: '8px',
                            borderRadius: '4px',
                        }}
                    >
                        {successData.token}
                    </code>
                </div>

                <p style={{ fontSize: '14px', color: '#555' }}>
                    Füge diesen Code bitte jetzt in dein{' '}
                    <strong>RSI-Profil (Bio oder Moniker)</strong> ein, damit wir deine Identität im
                    nächsten Schritt bestätigen können.
                </p>

                <button
                    onClick={() => router.push('/login')}
                    style={{
                        width: '100%',
                        padding: '10px',
                        background: '#0070f3',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    Weiter zum Login
                </button>
            </div>
        );
    }

    return (
        <div
            style={{
                maxWidth: '400px',
                margin: '40px auto',
                padding: '20px',
                border: '1px solid #ccc',
                borderRadius: '8px',
            }}
        >
            <h2>Orga-Registrierung</h2>
            <p style={{ color: '#666', fontSize: '14px' }}>
                Gib deinen exakten RSI-Handle an, um dich anzumelden.
            </p>

            {error && (
                <div
                    style={{
                        color: 'red',
                        background: '#ffebee',
                        padding: '10px',
                        borderRadius: '4px',
                        marginBottom: '15px',
                    }}
                >
                    {error}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label htmlFor="sc_handle">RSI Handle</label>
                    <input
                        id="sc_handle"
                        name="sc_handle"
                        type="text"
                        required
                        placeholder="z.B. ChrisRoberts"
                        disabled={isPending}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label htmlFor="password">Passwort (min. 8 Zeichen)</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        minLength={8}
                        placeholder="••••••••"
                        disabled={isPending}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    style={{
                        padding: '10px',
                        background: isPending ? '#ccc' : '#0070f3',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isPending ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                    }}
                >
                    {isPending ? 'Prüfe RSI-Datenbank...' : 'Registrieren'}
                </button>
            </form>
        </div>
    );
}
