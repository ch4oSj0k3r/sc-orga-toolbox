interface TerminalInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

export function TerminalInput({ label, id, className = '', ...props }: TerminalInputProps) {
    return (
        <div className="mb-3.5">
            <label htmlFor={id} className="label-terminal">
                {label}
            </label>
            <input id={id} className={`input-terminal ${className}`} {...props} />
        </div>
    );
}
