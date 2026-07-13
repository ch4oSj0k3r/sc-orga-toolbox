interface TerminalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary';
}

export function TerminalButton({
    variant = 'primary',
    className = '',
    ...props
}: TerminalButtonProps) {
    const variantClass = variant === 'primary' ? 'btn-terminal' : 'btn-terminal-secondary';
    return <button className={`${variantClass} ${className}`} {...props} />;
}
