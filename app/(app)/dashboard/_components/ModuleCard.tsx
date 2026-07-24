import Link from 'next/link';

import { TerminalPanel } from '@/components/mobiglas/TerminalPanel';

import type { ToolboxModule } from '@/lib/modules/moduleCatalog';

interface ModuleCardProps {
    module: ToolboxModule;
}

export function ModuleCard({ module }: ModuleCardProps) {
    const isAdministration = module.category === 'administration';

    return (
        <Link
            href={module.href}
            className="group block h-full focus-terminal"
            aria-label={`${module.title} öffnen`}
        >
            <TerminalPanel
                className={[
                    'h-full max-w-none! min-h-52 transition-all duration-200',
                    'group-hover:border-cyan group-hover:shadow-glow',
                ].join(' ')}
            >
                <div className="flex h-full flex-col">
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <span
                            className={[
                                'font-mono text-[10px] uppercase tracking-[0.14em]',
                                isAdministration ? 'text-amber' : 'text-cyan',
                            ].join(' ')}
                        >
                            {isAdministration ? 'Verwaltung' : 'Modul'}
                        </span>

                        <span className="font-mono text-[10px] text-text-dim">
                            SYS::{module.id.toUpperCase()}
                        </span>
                    </div>

                    <h3 className="font-display text-xl uppercase tracking-[0.05em] text-text transition-colors group-hover:text-cyan">
                        {module.title}
                    </h3>

                    <p className="mt-3 flex-1 text-sm leading-6 text-text-dim">
                        {module.description}
                    </p>

                    <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
                        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-dim">
                            System öffnen
                        </span>
                        <span
                            aria-hidden="true"
                            className="font-mono text-cyan transition-transform group-hover:translate-x-1"
                        >
                            →
                        </span>
                    </div>
                </div>
            </TerminalPanel>
        </Link>
    );
}
