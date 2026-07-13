import { HudCorners } from './HudCorners';

interface TerminalPanelProps {
    children: React.ReactNode;
    className?: string;
    showCorners?: boolean;
}

export function TerminalPanel({
    children,
    className = '',
    showCorners = true,
}: TerminalPanelProps) {
    return (
        <div className={`terminal-panel ${className}`}>
            {showCorners && <HudCorners />}
            {children}
        </div>
    );
}
