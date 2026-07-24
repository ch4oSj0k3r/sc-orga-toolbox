interface AccessGroupAssignmentSummaryProps {
    memberCount: number;
    moduleCount: number;
}

export function AccessGroupAssignmentSummary({
    memberCount,
    moduleCount,
}: AccessGroupAssignmentSummaryProps) {
    return (
        <div className="grid gap-3 border border-line bg-panel-alt p-4 sm:grid-cols-2">
            <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-dim">
                    Benutzerzuordnungen
                </p>

                <p className="mt-1 font-display text-xl text-text">{memberCount}</p>
            </div>

            <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-dim">
                    Modulzuordnungen
                </p>

                <p className="mt-1 font-display text-xl text-text">{moduleCount}</p>
            </div>
        </div>
    );
}
