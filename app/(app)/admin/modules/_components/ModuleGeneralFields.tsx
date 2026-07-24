import type { ModuleConfigurationViewModel, ModuleFormState } from '../moduleManagementTypes';

interface ModuleGeneralFieldsProps {
    module: ModuleConfigurationViewModel;
    formState: ModuleFormState;
    isPending: boolean;
    onChange: (changes: Partial<ModuleFormState>) => void;
}

export function ModuleGeneralFields({
    module,
    formState,
    isPending,
    onChange,
}: ModuleGeneralFieldsProps) {
    return (
        <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-2">
                <label className="block">
                    <span className="mb-2 block font-mono text-xs uppercase tracking-[0.08em] text-text-dim">
                        Bezeichnung
                    </span>

                    <input
                        type="text"
                        required
                        maxLength={80}
                        value={formState.title}
                        disabled={isPending || !module.configuration.title}
                        onChange={(event) => onChange({ title: event.target.value })}
                        className="w-full border border-line bg-panel-alt px-3 py-2 text-sm text-text outline-none transition focus:border-cyan disabled:cursor-not-allowed disabled:opacity-50"
                    />

                    {!module.configuration.title && (
                        <span className="mt-2 block font-mono text-[10px] uppercase tracking-[0.08em] text-amber">
                            Technisch geschützt
                        </span>
                    )}
                </label>

                <label className="block">
                    <span className="mb-2 block font-mono text-xs uppercase tracking-[0.08em] text-text-dim">
                        Sortierreihenfolge
                    </span>

                    <input
                        type="number"
                        min={0}
                        max={9999}
                        step={1}
                        value={formState.sortOrder}
                        disabled={isPending || !module.configuration.sortOrder}
                        onChange={(event) =>
                            onChange({
                                sortOrder: Number(event.target.value),
                            })
                        }
                        className="w-full border border-line bg-panel-alt px-3 py-2 font-mono text-sm text-text outline-none transition focus:border-cyan disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </label>
            </div>

            <label className="block">
                <span className="mb-2 block font-mono text-xs uppercase tracking-[0.08em] text-text-dim">
                    Beschreibung
                </span>

                <textarea
                    required
                    rows={4}
                    maxLength={300}
                    value={formState.description}
                    disabled={isPending || !module.configuration.description}
                    onChange={(event) => onChange({ description: event.target.value })}
                    className="w-full resize-y border border-line bg-panel-alt px-3 py-2 text-sm leading-6 text-text outline-none transition focus:border-cyan disabled:cursor-not-allowed disabled:opacity-50"
                />
            </label>
        </div>
    );
}
