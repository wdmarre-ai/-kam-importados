export default function Mercaderia() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Mercadería
        </h1>
        <div className="flex gap-3">
          <button className="btn-secondary">Descargar Stock</button>
          <button className="btn-primary">+ Nueva Compra</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Valorizado Stock
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            $0,00
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Total Productos
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Categorías
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Inventario
        </h2>
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          <p>No hay productos en stock</p>
        </div>
      </div>
    </div>
  );
}
