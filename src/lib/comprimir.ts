'use client';

// Comprime una foto en el navegador antes de subirla: la redimensiona al lado
// mayor indicado y la guarda como JPEG (lo leen todos los celulares, Safari incluido).
// Perfil: 512 px ≈ 40–80 KB. Evidencias: 1600 px ≈ 250–450 KB, suficiente para reportes.
export const FOTO_PERFIL = { lado: 512, calidad: 0.8 };
export const FOTO_EVIDENCIA = { lado: 1600, calidad: 0.78 };

export async function comprimirFoto(file: File, { lado, calidad }: { lado: number; calidad: number }): Promise<File> {
    try {
        // from-image respeta la rotación EXIF de las fotos de celular
        const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
        const k = Math.min(1, lado / Math.max(bmp.width, bmp.height));
        const w = Math.round(bmp.width * k), h = Math.round(bmp.height * k);
        const cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        const c = cv.getContext('2d')!;
        c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); // PNG con transparencia → fondo blanco
        c.drawImage(bmp, 0, 0, w, h);
        bmp.close();
        const blob = await new Promise<Blob | null>((r) => cv.toBlob(r, 'image/jpeg', calidad));
        if (!blob || blob.size >= file.size) return file; // ya venía ligera
        return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
    } catch {
        return file; // si el navegador no puede, se sube la original
    }
}
