import type { ModuleConfigurationViewModel } from '../moduleManagementTypes';

interface ModuleConfigurationHeaderProps {
    module: ModuleConfigurationViewModel;
    title: string;
    enabled: boolean;
}

export function ModuleConfigurationHeader({
    module,
    title,
    enabled,
}: ModuleConfigurationHeaderProps) {
    const categoryLabel = module.category === 'administration' ? 'Administration' : 'Toolbox-Modul';

    return (
        <summary className="focus-terminal flex cursor-pointer list-none flex-col gap-4 outline-none focus-terminal sm:flex-row sm:items-center sm:justify-between [&::-webkit-details-marker]:hidden">
            <div>
                <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-display text-xl uppercase tracking-wider text-text">
                        {title}
                    </h2>

                    <span
                        className={[
                            'border px-2 py-1 font-mono text-[10px] uppercase tracking-widest',
                            enabled ? 'border-cyan/50 text-cyan' : 'border-line text-text-dim',
                        ].join(' ')}
                    >
                        {enabled ? 'Aktiv' : 'Deaktiviert'}
                    </span>

                    <span className="border border-line px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-text-dim">
                        {module.hasPersistentConfiguration ? 'Überschrieben' : 'Standard'}
                    </span>
                </div>

                <p className="mt-2 font-mono text-xs text-text-dim">
                    SYS::{module.id.toUpperCase()}
                </p>
            </div>

            <div className="flex items-center justify-between gap-6 sm:justify-end">
                <div className="text-left font-mono text-xs text-text-dim sm:text-right">
                    <p>{categoryLabel}</p>
                    <p className="mt-1">{module.href}</p>
                </div>

                <span
                    aria-hidden="true"
                    className="font-mono text-lg text-cyan transition-transform duration-200 group-open:rotate-180"
                >
                    ↓
                </span>
            </div>
        </summary>
    );
}
