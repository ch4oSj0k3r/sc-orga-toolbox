import { Suspense } from 'react';
import { LoginPageClient } from './_components/LoginPageClient';

export default function LoginPage() {
    return (
        <Suspense fallback={<LoginFormFallback />}>
            <LoginPageClient />
        </Suspense>
    );
}

function LoginFormFallback() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-950 text-white">
            <p className="text-slate-400 animate-pulse">Lädt...</p>
        </div>
    );
}
