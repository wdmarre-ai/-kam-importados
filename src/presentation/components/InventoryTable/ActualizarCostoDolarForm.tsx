import { useState } from 'react';

interface ActualizarCostoDolarFormProps {
  categorias: any[];
  onSubmit: (data: { categoriaId: string; factor: number }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ActualizarCostoDolarForm({
  categorias,
  onSubmit,
  onCancel,
  isLoading = false,
}: ActualizarCostoDolarFormProps) {
  const [categoriaId, setCategoriaId] = useState('');
  const [dolarAnterior, setDolarAnterior] = useState(0);
  const [dolarNuevo, setDolarNuevo] = useState(0);

  const factor = dolarAnterior > 0 ? dolarNuevo / dolarAnterior : 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoriaId || dolarAnterior <= 0 || dolarNuevo <= 0) return;
    onSubmit({ categoriaId, factor });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Actualizar Costo por Dólar
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoría *
            </label>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="input-field w-full"
              required
              disabled={isLoading}
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Dólar usado al comprar *
            </label>
            <input
              type="number"
              value={dolarAnterior || ''}
              onChange={(e) => setDolarAnterior(parseFloat(e.target.value) || 0)}
              className="input-field w-full"
              step="0.01"
              min="0"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Dólar actual *
            </label>
            <input
              type="number"
              value={dolarNuevo || ''}
              onChange={(e) => setDolarNuevo(parseFloat(e.target.value) || 0)}
              className="input-field w-full"
              step="0.01"
              min="0"
              required
              disabled={isLoading}
            />
          </div>

          {dolarAnterior > 0 && dolarNuevo > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Costos y precios de esa categoría se multiplican por{' '}
              <strong>{factor.toFixed(4)}</strong>
            </p>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onCancel} className="btn-secondary" disabled={isLoading}>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading || !categoriaId || dolarAnterior <= 0 || dolarNuevo <= 0}
            >
              {isLoading ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
