import type { ReactNode } from 'react';

interface ConsolePanelProps {
    children: ReactNode;
    className?: string;
}

export function ConsolePanel({ children, className = '' }: ConsolePanelProps) {
    return (
        <section
            className={[
                'relative w-full border border-line bg-panel shadow-panel',
                'px-4 py-5 sm:px-6 sm:py-6',
                '[clip-path:polygon(18px_0,100%_0,100%_calc(100%-18px),calc(100%-18px)_100%,0_100%,0_18px)]',
                className,
            ].join(' ')}
        >
            <span aria-hidden="true" className="hud-corner hud-corner-tl" />
            <span aria-hidden="true" className="hud-corner hud-corner-br" />

            {children}
        </section>
    );
}
