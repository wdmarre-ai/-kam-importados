import type { Reparacion, EstadoReparacion } from '../../../domain/tipos';

interface ReparacionesTableProps {
  reparaciones: Reparacion[];
  isLoading?: boolean;
  onCambiarEstado: (id: string, estado: EstadoReparacion) => void;
  onEntregar: (reparacion: Reparacion) => void;
  onVerConstancia: (reparacion: Reparacion) => void;
}

const ESTADO_LABEL: Record<EstadoReparacion, string> = {
  ingresado: 'Ingresado',
  en_reparacion: 'En reparación',
  pendiente_entrega: 'Listo para retirar',
  entregado: 'Entregado',
  rechazado: 'Rechazado',
};

const ESTADO_COLOR: Record<EstadoReparacion, string> = {
  ingresado: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  en_reparacion: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:bg-opacity-30 dark:text-orange-400',
  pendiente_entrega: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:bg-opacity-30 dark:text-yellow-400',
  entregado: 'bg-green-100 text-green-700 dark:bg-green-900 dark:bg-opacity-30 dark:text-green-400',
  rechazado: 'bg-red-100 text-red-700 dark:bg-red-900 dark:bg-opacity-30 dark:text-red-400',
};

export default function ReparacionesTable({
  reparaciones,
  isLoading,
  onCambiarEstado,
  onEntregar,
  onVerConstancia,
}: ReparacionesTableProps) {
  if (isLoading) {
    return <div className="text-center py-8 text-gray-500 dark:text-gray-400">Cargando...</div>;
  }

  if (reparaciones.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No hay reparaciones cargadas todavía</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
            <th className="pb-2 pr-4">Remito</th>
            <th className="pb-2 pr-4">Cliente</th>
            <th className="pb-2 pr-4">Equipo</th>
            <th className="pb-2 pr-4">Entrega estimada</th>
            <th className="pb-2 pr-4">Estado</th>
            <th className="pb-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reparaciones.map((r) => (
            <tr key={r.id} className="border-b border-gray-100 dark:border-gray-800">
              <td className="py-2 pr-4 font-mono text-xs">{r.remito_id}</td>
              <td className="py-2 pr-4">{r.cliente?.nombre ?? '—'}</td>
              <td className="py-2 pr-4">
                {r.descripcion}
                <div className="text-xs text-gray-500">IMEI {r.imei}</div>
              </td>
              <td className="py-2 pr-4">{r.fecha_estimada_entrega}</td>
              <td className="py-2 pr-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${ESTADO_COLOR[r.estado]}`}>
                  {ESTADO_LABEL[r.estado]}
                </span>
              </td>
              <td className="py-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => onVerConstancia(r)}
                    className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 hover:border-kam-gold"
                  >
                    📄 Constancia
                  </button>
                  {r.estado === 'ingresado' && (
                    <button
                      onClick={() => onCambiarEstado(r.id, 'en_reparacion')}
                      className="text-xs px-2 py-1 rounded bg-orange-500 text-white"
                    >
                      Iniciar
                    </button>
                  )}
                  {r.estado === 'en_reparacion' && (
                    <button
                      onClick={() => onCambiarEstado(r.id, 'pendiente_entrega')}
                      className="text-xs px-2 py-1 rounded bg-yellow-500 text-white"
                    >
                      Listo
                    </button>
                  )}
                  {(r.estado === 'pendiente_entrega' || r.estado === 'en_reparacion' || r.estado === 'ingresado') && (
                    <button
                      onClick={() => onEntregar(r)}
                      className="text-xs px-2 py-1 rounded bg-kam-gold text-white"
                    >
                      💰 Entregar y Cobrar
                    </button>
                  )}
                  {r.estado !== 'entregado' && r.estado !== 'rechazado' && (
                    <button
                      onClick={() => onCambiarEstado(r.id, 'rechazado')}
                      className="text-xs px-2 py-1 rounded border border-red-300 text-red-600"
                    >
                      Rechazar
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
