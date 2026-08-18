import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reparacionRepo, clienteRepo, storageRepo, ventaRepo, gastoRepo } from '../../data/repo';
import { useStore } from '../../store';
import type { EstadoReparacion, MedioPago, Reparacion } from '../../domain/tipos';

export interface NuevaReparacionInput {
  clienteNombre: string;
  clienteTelefono: string;
  imei: string;
  descripcion: string;
  color: string;
  bateria_porcentaje: number;
  detalles: string;
  fecha_estimada_entrega: string;
  presupuesto: number | null;
  foto?: File | null;
}

function generarRemito(cantidadExistente: number): string {
  const secuencia = (cantidadExistente + 1).toString().padStart(4, '0');
  return `R-${secuencia}-${Date.now().toString().slice(-4)}`;
}

export interface EntregaConCobroInput {
  reparacion: Reparacion;
  montoCobrado: number;
  medioPago: MedioPago;
  costoTecnico: number;
}

export function useReparaciones() {
  const sucursal = useStore((s) => s.sucursal);
  const user = useStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: reparaciones = [], isLoading } = useQuery({
    queryKey: ['reparaciones', sucursal?.id],
    queryFn: () => (sucursal ? reparacionRepo.getAll(sucursal.id) : Promise.resolve([])),
    enabled: !!sucursal,
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['reparaciones', sucursal?.id] });

  const crearMutation = useMutation({
    mutationFn: async (input: NuevaReparacionInput) => {
      if (!sucursal) throw new Error('No hay sucursal seleccionada');

      const cliente = await clienteRepo.getOrCreate(input.clienteTelefono, sucursal.id, {
        nombre: input.clienteNombre,
        tipo: 'minorista',
      });

      let fotoUrl: string | undefined;
      if (input.foto) {
        const path = `${sucursal.id}/${Date.now()}-${input.imei}.jpg`;
        await storageRepo.uploadFoto('reparacion-fotos', path, input.foto);
        fotoUrl = storageRepo.getPublicUrl('reparacion-fotos', path);
      }

      const remitoId = generarRemito(reparaciones.length);

      return reparacionRepo.create({
        remito_id: remitoId,
        cliente_id: cliente.id,
        imei: input.imei,
        descripcion: input.descripcion,
        color: input.color,
        bateria_porcentaje: input.bateria_porcentaje,
        detalles: input.detalles,
        estado: 'ingresado',
        fecha_estimada_entrega: input.fecha_estimada_entrega,
        presupuesto: input.presupuesto,
        foto_url: fotoUrl,
        sucursal_id: sucursal.id,
      });
    },
    onSuccess: invalidar,
  });

  const cambiarEstadoMutation = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoReparacion }) => {
      const updates: any = { estado };
      if (estado === 'entregado') updates.fecha_real_entrega = new Date().toISOString().slice(0, 10);
      return reparacionRepo.update(id, updates);
    },
    onSuccess: invalidar,
  });

  const entregarConCobroMutation = useMutation({
    mutationFn: async ({ reparacion, montoCobrado, medioPago, costoTecnico }: EntregaConCobroInput) => {
      if (!sucursal) throw new Error('No hay sucursal seleccionada');
      if (!user) throw new Error('No hay usuario logueado');

      // Se crean venta y gasto primero: si algo falla acá, la reparación
      // queda sin tocar en vez de marcarse "entregado" sin haber cobrado.
      await ventaRepo.create({
        cliente_id: reparacion.cliente_id,
        medio_pago: medioPago,
        tipo: 'minorista',
        total_pesos: montoCobrado,
        usuario_id: user.id,
        sucursal_id: sucursal.id,
        conformidad: true,
        info_garantia: `Service ${reparacion.remito_id}`,
        reparacion_id: reparacion.id,
      });

      if (costoTecnico > 0) {
        await gastoRepo.create({
          fecha: new Date().toISOString().slice(0, 10),
          categoria: 'otro',
          descripcion: `Pago técnico - reparación ${reparacion.remito_id} (${reparacion.descripcion})`,
          monto: costoTecnico,
          sucursal_id: sucursal.id,
          usuario_id: user.id,
        });
      }

      await reparacionRepo.update(reparacion.id, {
        estado: 'entregado',
        fecha_real_entrega: new Date().toISOString().slice(0, 10),
        presupuesto: montoCobrado,
      });
    },
    onSuccess: invalidar,
  });

  return {
    reparaciones,
    isLoading,
    crear: crearMutation.mutate,
    isCreando: crearMutation.isPending,
    crearError: crearMutation.error,
    cambiarEstado: cambiarEstadoMutation.mutate,
    isCambiandoEstado: cambiarEstadoMutation.isPending,
    entregarConCobro: entregarConCobroMutation.mutate,
    isEntregando: entregarConCobroMutation.isPending,
  };
}
