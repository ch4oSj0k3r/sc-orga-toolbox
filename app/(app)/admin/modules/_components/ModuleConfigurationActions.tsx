import { TerminalButton } from '@/components/mobiglas/TerminalButton';

interface ModuleConfigurationActionsProps {
    isPending: boolean;
    canReset: boolean;
    onReset: () => void;
}

export function ModuleConfigurationActions({
    isPending,
    canReset,
    onReset,
}: ModuleConfigurationActionsProps) {
    return (
        <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
            <TerminalButton
                variant="secondary"
                className="w-auto!"
                type="button"
                disabled={isPending || !canReset}
                onClick={onReset}
            >
                Standard wiederherstellen
            </TerminalButton>

            <TerminalButton
                variant="primary"
                className="w-auto!"
                type="submit"
                disabled={isPending}
            >
                {isPending ? 'Verarbeitung läuft …' : 'Konfiguration speichern'}
            </TerminalButton>
        </div>
    );
}
