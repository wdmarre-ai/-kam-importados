import type { Producto } from '../../../domain/tipos';

interface ProductoTableProps {
  productos: Producto[];
  isLoading: boolean;
  onEdit: (producto: Producto) => void;
  onDelete: (id: string) => void;
}

export default function ProductoTable({
  productos,
  isLoading,
  onEdit,
  onDelete,
}: ProductoTableProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        <div className="inline-block w-8 h-8 border-4 border-kam-gold border-t-transparent rounded-full animate-spin" />
        <p className="mt-2">Cargando productos...</p>
      </div>
    );
  }

  if (!productos.length) {
    return (
      <div className="text-center py-12 text-gray-600 dark:text-gray-400">
        <p className="text-lg">📦 No hay productos en inventario</p>
        <p className="text-sm mt-2">Creá el primer producto para comenzar</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
              IMEI / Modelo
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
              Color / Batería
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
              Costo
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
              Minorista
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
              Mayorista
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
              Estado
            </th>
            <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr
              key={producto.id}
              className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <td className="py-3 px-4">
                <div className="font-mono text-xs text-gray-600 dark:text-gray-400">
                  {producto.imei}
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {producto.modelo}
                </div>
              </td>
              <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                <div>{producto.color || '—'}</div>
                <div className="text-xs">🔋 {producto.bateria_porcentaje}%</div>
              </td>
              <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                ${producto.costo_unitario.toFixed(2)}
              </td>
              <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                ${producto.precio_minorista.toFixed(2)}
              </td>
              <td className="py-3 px-4 text-sm font-semibold text-kam-gold">
                ${producto.precio_mayorista.toFixed(2)}
              </td>
              <td className="py-3 px-4 text-sm">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    producto.estado === 'en_stock'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : producto.estado === 'en_reparacion'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : producto.estado === 'vendido'
                          ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}
                >
                  {producto.estado === 'en_stock'
                    ? 'En Stock'
                    : producto.estado === 'en_reparacion'
                      ? 'Reparación'
                      : producto.estado === 'vendido'
                        ? 'Vendido'
                        : 'Rechazado'}
                </span>
              </td>
              <td className="py-3 px-4 text-center">
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => onEdit(producto)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDelete(producto.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
