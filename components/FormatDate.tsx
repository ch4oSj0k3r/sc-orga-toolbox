'use client';

interface FormatDateProps {
    date: Date | string | null;
    withTime?: boolean;
}

export function FormatDate({ date, withTime }: FormatDateProps) {
    if (!date) return <span className="text-zinc-500">-</span>;

    const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        ...(withTime && { hour: '2-digit', minute: '2-digit' }),
    };

    const formattedDate = new Date(date).toLocaleDateString('de-DE', options);

    return (
        <span>
            {formattedDate}
            {withTime ? ' Uhr' : ''}
        </span>
    );
}
