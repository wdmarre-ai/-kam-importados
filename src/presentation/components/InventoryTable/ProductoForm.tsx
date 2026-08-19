import { useState } from 'react';
import type { Producto } from '../../../domain/tipos';

interface ProductoFormProps {
  producto?: Producto;
  categorias: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ProductoForm({
  producto,
  categorias,
  onSubmit,
  onCancel,
  isLoading = false,
}: ProductoFormProps) {
  const [formData, setFormData] = useState({
    imei: producto?.imei || '',
    descripcion: producto?.descripcion || '',
    color: producto?.color || '',
    modelo: producto?.modelo || '',
    marca: producto?.marca || '',
    bateria_porcentaje: producto?.bateria_porcentaje || 100,
    categoria_id: producto?.categoria_id || '',
    precio_minorista: producto?.precio_minorista || 0,
    precio_mayorista: producto?.precio_mayorista || 0,
    costo_unitario: producto?.costo_unitario || 0,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        ['bateria_porcentaje', 'precio_minorista', 'precio_mayorista', 'costo_unitario'].includes(
          name
        ) && value
          ? parseFloat(value)
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {producto ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                IMEI *
              </label>
              <input
                type="text"
                name="imei"
                value={formData.imei}
                onChange={handleChange}
                className="input-field w-full"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Modelo *
              </label>
              <input
                type="text"
                name="modelo"
                value={formData.modelo}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="iPhone 13 Pro, Samsung S21, etc"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Marca *
              </label>
              <input
                type="text"
                name="marca"
                value={formData.marca}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="Apple, Samsung, etc"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Color
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="Negro, Blanco, Dorado, etc"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Batería (%)
              </label>
              <input
                type="number"
                name="bateria_porcentaje"
                value={formData.bateria_porcentaje}
                onChange={handleChange}
                className="input-field w-full"
                min="0"
                max="100"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoría
              </label>
              <select
                name="categoria_id"
                value={formData.categoria_id}
                onChange={handleChange}
                className="input-field w-full"
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
                Costo Unitario ($) *
              </label>
              <input
                type="number"
                name="costo_unitario"
                value={formData.costo_unitario || ''}
                onChange={handleChange}
                className="input-field w-full"
                step="0.01"
                min="0"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Precio Minorista ($) *
              </label>
              <input
                type="number"
                name="precio_minorista"
                value={formData.precio_minorista || ''}
                onChange={handleChange}
                className="input-field w-full"
                step="0.01"
                min="0"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Precio Mayorista ($) *
              </label>
              <input
                type="number"
                name="precio_mayorista"
                value={formData.precio_mayorista || ''}
                onChange={handleChange}
                className="input-field w-full"
                step="0.01"
                min="0"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              className="input-field w-full"
              rows={2}
              placeholder="Detalles adicionales del equipo"
              disabled={isLoading}
            />
          </div>
        </form>

        <div className="flex gap-3 justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onCancel} className="btn-secondary" disabled={isLoading}>
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
