export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
            <div className="bg-starfield fixed inset-0 opacity-60 pointer-events-none" />
            <div className="bg-scanline-sweep fixed inset-0 h-35 opacity-[0.08] animate-sweep pointer-events-none" />
            {children}
        </div>
    );
}
