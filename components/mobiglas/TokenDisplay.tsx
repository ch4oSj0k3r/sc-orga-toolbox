interface TokenDisplayProps {
    token: string;
    label?: string;
}

export function TokenDisplay({ token, label = 'DEIN VERIFIZIERUNGS-CODE' }: TokenDisplayProps) {
    return (
        <div className="bg-bg border border-line rounded flex flex-col items-center justify-center gap-2 p-4">
            <span className="font-mono text-[10px] text-text-dim uppercase tracking-[0.14em]">
                {label}
            </span>
            <span className="font-mono text-2xl font-bold text-cyan tracking-[0.2em] bg-panel px-4 py-2 border border-line select-all">
                {token}
            </span>
        </div>
    );
}
