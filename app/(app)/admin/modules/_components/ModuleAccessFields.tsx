import { Role } from '@/lib/generated/enums';

import type { ModuleConfigurationViewModel, ModuleFormState } from '../moduleManagementTypes';

interface ModuleAccessFieldsProps {
    module: ModuleConfigurationViewModel;
    formState: ModuleFormState;
    isPending: boolean;
    onChange: (changes: Partial<ModuleFormState>) => void;
}

const roleOptions = [Role.GUEST, Role.MEMBER, Role.ADMIN] satisfies readonly Role[];

const roleLabels: Record<Role, string> = {
    [Role.GUEST]: 'Gast',
    [Role.MEMBER]: 'Mitglied',
    [Role.ADMIN]: 'Administrator',
};

export function ModuleAccessFields({
    module,
    formState,
    isPending,
    onChange,
}: ModuleAccessFieldsProps) {
    function toggleRole(role: Role) {
        if (!module.configuration.allowedRoles || module.mandatoryRoles.includes(role)) {
            return;
        }

        const allowedRoles = formState.allowedRoles.includes(role)
            ? formState.allowedRoles.filter((allowedRole) => allowedRole !== role)
            : [...formState.allowedRoles, role];

        onChange({ allowedRoles });
    }

    return (
        <div className="grid gap-5 lg:grid-cols-2">
            <fieldset>
                <legend className="mb-3 font-mono text-xs uppercase tracking-[0.08em] text-text-dim">
                    Status
                </legend>

                <label className="flex items-center gap-3 border border-line bg-panel-alt px-4 py-3">
                    <input
                        type="checkbox"
                        checked={formState.enabled}
                        disabled={isPending || !module.configuration.enabled}
                        onChange={(event) => onChange({ enabled: event.target.checked })}
                        className="size-4 accent-cyan"
                    />

                    <span className="text-sm text-text">Modul aktiviert</span>
                </label>

                {!module.configuration.enabled && (
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-amber">
                        Dieses Kernmodul kann nicht deaktiviert werden.
                    </p>
                )}
            </fieldset>

            <fieldset>
                <legend className="mb-3 font-mono text-xs uppercase tracking-[0.08em] text-text-dim">
                    Rollenfreigaben
                </legend>

                <div className="space-y-2">
                    {roleOptions.map((role) => {
                        const isMandatory = module.mandatoryRoles.includes(role);

                        const isLocked = !module.configuration.allowedRoles || isMandatory;

                        return (
                            <label
                                key={role}
                                className="flex items-center justify-between gap-4 border border-line bg-panel-alt px-4 py-3"
                            >
                                <span className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={formState.allowedRoles.includes(role)}
                                        disabled={isPending || isLocked}
                                        onChange={() => toggleRole(role)}
                                        className="size-4 accent-cyan"
                                    />

                                    <span className="text-sm text-text">{roleLabels[role]}</span>
                                </span>

                                {isMandatory && (
                                    <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-amber">
                                        Pflicht
                                    </span>
                                )}
                            </label>
                        );
                    })}
                </div>

                {!module.configuration.allowedRoles && (
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-amber">
                        Rollen werden technisch vorgegeben.
                    </p>
                )}
            </fieldset>
        </div>
    );
}
