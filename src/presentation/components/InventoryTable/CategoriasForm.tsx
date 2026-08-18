import { useState } from 'react';

interface Categoria {
  id: string;
  nombre: string;
}

interface CategoriasFormProps {
  categorias: Categoria[];
  onCrear: (nombre: string) => void;
  onRenombrar: (data: { id: string; nombre: string }) => void;
  onEliminar: (id: string) => void;
  onCerrar: () => void;
  isLoading?: boolean;
}

export default function CategoriasForm({
  categorias,
  onCrear,
  onRenombrar,
  onEliminar,
  onCerrar,
  isLoading = false,
}: CategoriasFormProps) {
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nombreEditado, setNombreEditado] = useState('');

  const handleCrear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaCategoria.trim()) return;
    onCrear(nuevaCategoria.trim());
    setNuevaCategoria('');
  };

  const empezarEdicion = (cat: Categoria) => {
    setEditandoId(cat.id);
    setNombreEditado(cat.nombre);
  };

  const guardarEdicion = (id: string) => {
    if (!nombreEditado.trim()) return;
    onRenombrar({ id, nombre: nombreEditado.trim() });
    setEditandoId(null);
  };

  const handleEliminar = (id: string, nombre: string) => {
    if (confirm(`¿Eliminar la categoría "${nombre}"? Los productos que la usan quedarán sin categoría.`)) {
      onEliminar(id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Categorías</h2>
          <button
            onClick={onCerrar}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <form onSubmit={handleCrear} className="flex gap-2">
            <input
              type="text"
              value={nuevaCategoria}
              onChange={(e) => setNuevaCategoria(e.target.value)}
              className="input-field flex-1"
              placeholder="Nueva categoría (ej: Notebooks)"
              disabled={isLoading}
            />
            <button type="submit" className="btn-primary" disabled={isLoading || !nuevaCategoria.trim()}>
              ➕
            </button>
          </form>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {categorias.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">No hay categorías todavía.</p>
            )}
            {categorias.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-2 p-2 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                {editandoId === cat.id ? (
                  <>
                    <input
                      type="text"
                      value={nombreEditado}
                      onChange={(e) => setNombreEditado(e.target.value)}
                      className="input-field flex-1 text-sm"
                      disabled={isLoading}
                      autoFocus
                    />
                    <button
                      onClick={() => guardarEdicion(cat.id)}
                      className="text-green-600 hover:text-green-800 text-sm px-2"
                      disabled={isLoading}
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setEditandoId(null)}
                      className="text-gray-500 hover:text-gray-700 text-sm px-2"
                      disabled={isLoading}
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-gray-900 dark:text-white">{cat.nombre}</span>
                    <button
                      onClick={() => empezarEdicion(cat)}
                      className="text-gray-500 hover:text-kam-gold text-sm px-2"
                      disabled={isLoading}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleEliminar(cat.id, cat.nombre)}
                      className="text-red-500 hover:text-red-700 text-sm px-2"
                      disabled={isLoading}
                    >
                      🗑
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onCerrar} className="btn-secondary">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
