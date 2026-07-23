import { TerminalPanel } from '@/components/mobiglas/TerminalPanel';

export default function ModuleManagementPage() {
    return (
        <div className="mx-auto max-w-7xl space-y-8">
            <section className="border-b border-line pb-8">
                <p className="eyebrow">
                    <span className="eyebrow-dot" />
                    Restricted Access
                </p>

                <h1 className="mt-3 font-display text-3xl uppercase tracking-[0.06em] text-text md:text-4xl">
                    Modulverwaltung
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-text-dim">
                    Dashboard-Module aktivieren, konfigurieren und sortieren.
                </p>
            </section>

            <TerminalPanel className="max-w-none">
                <div className="px-4 py-8 text-center sm:px-8">
                    <p className="font-mono text-xs uppercase tracking-[0.08em] text-cyan">
                        Modulverwaltung vorbereitet
                    </p>

                    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-text-dim">
                        Die Oberfläche ist angelegt. Im nächsten Schritt ergänzen wir das
                        Datenmodell sowie die Konfiguration für Status, Bezeichnung, Beschreibung,
                        Reihenfolge und Rollenfreigaben.
                    </p>
                </div>
            </TerminalPanel>
        </div>
    );
}
