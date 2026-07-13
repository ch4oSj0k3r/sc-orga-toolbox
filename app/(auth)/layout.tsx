import { Starfield } from '@/components/mobiglas/Starfield';
import { ScanlineSweep } from '@/components/mobiglas/ScanlineSweep';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
            <Starfield />
            <ScanlineSweep />
            {children}
        </div>
    );
}
