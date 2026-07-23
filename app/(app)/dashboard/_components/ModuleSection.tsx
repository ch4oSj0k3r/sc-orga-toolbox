import type { ToolboxModule } from '../moduleRegistry';
import { ModuleCard } from './ModuleCard';

interface ModuleSectionProps {
    eyebrow: string;
    title: string;
    description: string;
    modules: ToolboxModule[];
    emptyMessage?: string;
}

export function ModuleSection({
    eyebrow,
    title,
    description,
    modules,
    emptyMessage,
}: ModuleSectionProps) {
    return (
        <section>
            <div className="mb-5">
                <p className="eyebrow">
                    <span className="eyebrow-dot" />
                    {eyebrow}
                </p>
                <h2 className="font-display text-2xl uppercase tracking-[0.05em] text-text">
                    {title}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-text-dim">{description}</p>
            </div>

            {modules.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {modules.map((module) => (
                        <ModuleCard key={module.id} module={module} />
                    ))}
                </div>
            ) : (
                <div className="border border-dashed border-line bg-panel/50 px-6 py-10 text-center">
                    <p className="font-mono text-xs uppercase tracking-[0.08em] text-text-dim">
                        {emptyMessage ?? 'Keine Systeme verfügbar.'}
                    </p>
                </div>
            )}
        </section>
    );
}
