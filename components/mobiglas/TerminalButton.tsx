interface TerminalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
}

const variantClass: Record<NonNullable<TerminalButtonProps['variant']>, string> = {
    primary: 'btn-terminal',
    secondary: 'btn-terminal-secondary',
    danger: 'btn-terminal-danger',
};

export function TerminalButton({
    variant = 'primary',
    className = '',
    ...props
}: TerminalButtonProps) {
    return <button className={`${variantClass[variant]} ${className}`} {...props} />;
}
