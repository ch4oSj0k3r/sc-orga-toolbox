import { CronTrigger } from './CronTrigger';

export function AdminToolbar() {
    return (
        <div
            className="
                sticky top-16 z-30
                -mx-4 mb-6
                flex flex-col gap-4
                border-b border-line
                bg-panel/95 px-4 py-4
                backdrop-blur-md
                sm:-mx-6 sm:flex-row sm:items-center sm:justify-between sm:px-6
            "
        >
            <div>
                <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
                    Orga Admin-Dashboard
                </h1>
                <p className="mt-1 font-mono text-xs text-text-dim">
                    Verwaltung der Benutzerregistrierungen und Sicherheitsstufen.
                </p>
            </div>
            <CronTrigger />
        </div>
    );
}
