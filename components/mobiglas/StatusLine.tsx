type StatusVariant = 'neutral' | 'active' | 'granted' | 'denied';

interface StatusLineProps {
    children: React.ReactNode;
    variant?: StatusVariant;
}

const variantClass: Record<StatusVariant, string> = {
    neutral: '',
    active: 'status-line-active',
    granted: 'status-line-granted',
    denied: 'status-line-denied',
};

export function StatusLine({ children, variant = 'neutral' }: StatusLineProps) {
    return <div className={`status-line ${variantClass[variant]}`}>{children}</div>;
}
