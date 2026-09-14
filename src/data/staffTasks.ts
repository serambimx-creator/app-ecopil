export interface StaffTask {
  id: string;
  fecha: string;
  titulo: string;
  responsable?: string;
  detalle?: string;
}

export const STAFF_TASKS: StaffTask[] = [
  { id: 'video-encuentro', fecha: '10 dic', titulo: 'Video del Encuentro', responsable: 'Serambi' },
  { id: 'inventario-pintura', fecha: '10 dic', titulo: 'Inventario de pintura', responsable: 'Wendy' },
  {
    id: 'mural-jasso',
    fecha: '10 dic',
    titulo: 'Mural Jasso · materiales',
    detalle: '2 L blanco · 1 L amarillo · 1 L azul · 1 L negro',
  },
  { id: 'mural-alejandro', fecha: '10 dic', titulo: 'Mural Alejandro' },
];
