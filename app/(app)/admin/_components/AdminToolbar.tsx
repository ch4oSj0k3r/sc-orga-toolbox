import { CronTrigger } from './CronTrigger';

export function AdminToolbar() {
    return (
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-line">
            <div>
                <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
                    Orga Admin-Dashboard
                </h1>
                <p className="font-mono text-xs text-text-dim mt-1">
                    Verwaltung der Benutzerregistrierungen und Sicherheitsstufen.
                </p>
            </div>
            <CronTrigger />
        </div>
    );
}
