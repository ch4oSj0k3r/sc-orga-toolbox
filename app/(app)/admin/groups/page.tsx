import { requireAdminSession } from '@/lib/auth/require-session';

export default async function AccessGroupManagementPage() {
    await requireAdminSession();

    return (
        <div className="mx-auto max-w-7xl space-y-8">
            <section className="border-b border-line pb-8">
                <p className="eyebrow">
                    <span className="eyebrow-dot" />
                    Restricted Access
                </p>

                <h1 className="mt-3 font-display text-3xl uppercase tracking-[0.06em] text-text md:text-4xl">
                    Zugriffsgruppen
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-text-dim">
                    Gruppen erstellen und Benutzer sowie Module zuordnen.
                </p>
            </section>

            <div className="border border-dashed border-line bg-panel/50 px-6 py-10 text-center">
                <p className="font-mono text-xs uppercase tracking-[0.08em] text-text-dim">
                    Noch keine Zugriffsgruppen vorhanden.
                </p>
            </div>
        </div>
    );
}
