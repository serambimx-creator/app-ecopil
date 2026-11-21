import Mixtli from '@/components/brand/Mixtli';

// Pantalla de carga: Mixtli mientras llega la página
export default function Loading() {
    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
            <div className="animate-bounce">
                <Mixtli pose="pala" height={150} priority />
            </div>
            <p className="font-futura text-sm font-bold opacity-70">Mixtli ya viene…</p>
        </div>
    );
}
