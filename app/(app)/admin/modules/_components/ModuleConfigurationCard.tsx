'use client';

import { type FormEvent, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { TerminalPanel } from '@/components/mobiglas/TerminalPanel';

import { resetModuleConfiguration, saveModuleConfiguration } from '../actions';
import { createDefaultModuleFormState, createInitialModuleFormState } from '../moduleFormState';
import type { ModuleConfigurationViewModel, ModuleFormState } from '../moduleManagementTypes';
import { ModuleAccessFields } from './ModuleAccessFields';
import { ModuleConfigurationActions } from './ModuleConfigurationActions';
import { ModuleConfigurationHeader } from './ModuleConfigurationHeader';
import { ModuleGeneralFields } from './ModuleGeneralFields';

interface ModuleConfigurationCardProps {
    module: ModuleConfigurationViewModel;
}

export function ModuleConfigurationCard({ module }: ModuleConfigurationCardProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [formState, setFormState] = useState<ModuleFormState>(() =>
        createInitialModuleFormState(module)
    );

    function updateFormState(changes: Partial<ModuleFormState>) {
        setFormState((current) => ({
            ...current,
            ...changes,
        }));
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        startTransition(async () => {
            const result = await saveModuleConfiguration({
                moduleId: module.id,
                title: formState.title,
                description: formState.description,
                enabled: formState.enabled,
                sortOrder: formState.sortOrder,
                allowedRoles: formState.allowedRoles,
            });

            if (!result.success) {
                toast.error(result.message);
                return;
            }

            toast.success(result.message);
            router.refresh();
        });
    }

    function handleReset() {
        startTransition(async () => {
            const result = await resetModuleConfiguration(module.id);

            if (!result.success) {
                toast.error(result.message);
                return;
            }

            const defaultState = createDefaultModuleFormState(module.id);

            if (defaultState) {
                setFormState(defaultState);
            }

            toast.success(result.message);
            router.refresh();
        });
    }

    return (
        <TerminalPanel className="max-w-none">
            <details className="group">
                <ModuleConfigurationHeader
                    module={module}
                    title={formState.title}
                    enabled={formState.enabled}
                />

                <form onSubmit={handleSubmit} className="mt-5 space-y-6 border-t border-line pt-6">
                    <ModuleGeneralFields
                        module={module}
                        formState={formState}
                        isPending={isPending}
                        onChange={updateFormState}
                    />

                    <ModuleAccessFields
                        module={module}
                        formState={formState}
                        isPending={isPending}
                        onChange={updateFormState}
                    />

                    <ModuleConfigurationActions
                        isPending={isPending}
                        canReset={module.hasPersistentConfiguration}
                        onReset={handleReset}
                    />
                </form>
            </details>
        </TerminalPanel>
    );
}
