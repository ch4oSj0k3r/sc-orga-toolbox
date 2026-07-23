import Image from 'next/image';
import Link from 'next/link';

export function ToolboxBrand() {
    return (
        <Link
            href="/dashboard"
            className="eyebrow mb-0! focus-terminal"
            aria-label="Org Toolbox – Dashboard"
        >
            <Image
                src="/icons/header-logo-64.png"
                alt=""
                width={48}
                height={48}
                priority
                unoptimized
                className="shrink-0 rounded-md"
            />
            <span>ORG TOOLBOX</span>
        </Link>
    );
}
