import { useState } from 'react';
import { calcularProrrateoEnvio } from '../../../domain/compras';
import EscanerCodigo from '../Shared/EscanerCodigo';
import type { ItemCompraInput } from '../../hooks/useCompras';

interface CompraFormProps {
  categorias: any[];
  onSubmit: (data: { proveedor: string; costoEnvio: number; items: ItemCompraInput[] }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const itemVacio: ItemCompraInput = {
  categoria_id: '',
  imei: '',
  descripcion: '',
  color: '',
  modelo: '',
  marca: '',
  bateria_porcentaje: 100,
  costo_unitario: 0,
  cantidad: 1,
  precio_minorista: 0,
  precio_mayorista: 0,
  imagen: null,
};

export default function CompraForm({ categorias, onSubmit, onCancel, isLoading = false }: CompraFormProps) {
  const [proveedor, setProveedor] = useState('');
  const [costoEnvio, setCostoEnvio] = useState(0);
  const [items, setItems] = useState<ItemCompraInput[]>([{ ...itemVacio }]);
  const [escaneandoIndex, setEscaneandoIndex] = useState<number | null>(null);

  const actualizarItem = (index: number, campo: keyof ItemCompraInput, valor: any) => {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [campo]: valor } : it))
    );
  };

  const agregarItem = () => setItems((prev) => [...prev, { ...itemVacio }]);

  const quitarItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalCosto = items.reduce((sum, it) => sum + it.costo_unitario * it.cantidad, 0);
  const prorrateo = calcularProrrateoEnvio(items, costoEnvio);

  const itemsCompletos = items.every(
    (it) => it.categoria_id && it.imei && it.descripcion && it.color && it.costo_unitario > 0 && it.precio_minorista > 0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proveedor.trim() || !itemsCompletos) return;
    onSubmit({ proveedor: proveedor.trim(), costoEnvio, items });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nueva Compra</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Proveedor *
              </label>
              <input
                type="text"
                value={proveedor}
                onChange={(e) => setProveedor(e.target.value)}
                className="input-field w-full"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Costo de Envío Total (USD)
              </label>
              <input
                type="number"
                value={costoEnvio || ''}
                onChange={(e) => setCostoEnvio(parseFloat(e.target.value) || 0)}
                className="input-field w-full"
                step="0.01"
                min="0"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Se prorratea entre los productos según su valor de compra
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="card border border-gray-200 dark:border-gray-700 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Producto {index + 1}
                  </h3>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => quitarItem(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                      disabled={isLoading}
                    >
                      🗑 Quitar
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      IMEI / Código *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={item.imei}
                        onChange={(e) => actualizarItem(index, 'imei', e.target.value)}
                        className="input-field w-full text-sm"
                        placeholder="Escribí o escaneá"
                        required
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setEscaneandoIndex(index)}
                        className="btn-secondary px-3 flex-shrink-0"
                        disabled={isLoading}
                        title="Escanear con la cámara"
                      >
                        📷
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Categoría *
                    </label>
                    <select
                      value={item.categoria_id}
                      onChange={(e) => actualizarItem(index, 'categoria_id', e.target.value)}
                      className="input-field w-full text-sm"
                      required
                      disabled={isLoading}
                    >
                      <option value="">Seleccionar</option>
                      {categorias.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Descripción *
                    </label>
                    <input
                      type="text"
                      value={item.descripcion}
                      onChange={(e) => actualizarItem(index, 'descripcion', e.target.value)}
                      className="input-field w-full text-sm"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Color *
                    </label>
                    <input
                      type="text"
                      value={item.color}
                      onChange={(e) => actualizarItem(index, 'color', e.target.value)}
                      className="input-field w-full text-sm"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Modelo
                    </label>
                    <input
                      type="text"
                      value={item.modelo}
                      onChange={(e) => actualizarItem(index, 'modelo', e.target.value)}
                      className="input-field w-full text-sm"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Marca
                    </label>
                    <input
                      type="text"
                      value={item.marca}
                      onChange={(e) => actualizarItem(index, 'marca', e.target.value)}
                      className="input-field w-full text-sm"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Batería (%) *
                    </label>
                    <input
                      type="number"
                      value={item.bateria_porcentaje}
                      onChange={(e) => actualizarItem(index, 'bateria_porcentaje', parseFloat(e.target.value) || 0)}
                      className="input-field w-full text-sm"
                      min="0"
                      max="100"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cantidad *
                    </label>
                    <input
                      type="number"
                      value={item.cantidad}
                      onChange={(e) => actualizarItem(index, 'cantidad', parseInt(e.target.value) || 1)}
                      className="input-field w-full text-sm"
                      min="1"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Costo Unitario (USD) *
                    </label>
                    <input
                      type="number"
                      value={item.costo_unitario || ''}
                      onChange={(e) => actualizarItem(index, 'costo_unitario', parseFloat(e.target.value) || 0)}
                      className="input-field w-full text-sm"
                      step="0.01"
                      min="0"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Precio Minorista *
                    </label>
                    <input
                      type="number"
                      value={item.precio_minorista || ''}
                      onChange={(e) => actualizarItem(index, 'precio_minorista', parseFloat(e.target.value) || 0)}
                      className="input-field w-full text-sm"
                      step="0.01"
                      min="0"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Precio Mayorista *
                    </label>
                    <input
                      type="number"
                      value={item.precio_mayorista || ''}
                      onChange={(e) => actualizarItem(index, 'precio_mayorista', parseFloat(e.target.value) || 0)}
                      className="input-field w-full text-sm"
                      step="0.01"
                      min="0"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Foto (celular)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => actualizarItem(index, 'imagen', e.target.files?.[0] ?? null)}
                      className="input-field w-full text-sm"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Costo final estimado (c/envío prorrateado): $
                  {prorrateo[index]?.costo_final_unitario.toFixed(2) ?? '0.00'} por unidad
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={agregarItem}
            className="btn-secondary w-full"
            disabled={isLoading}
          >
            ➕ Agregar otro producto
          </button>

          <div className="card bg-gray-50 dark:bg-gray-900 space-y-1">
            <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
              <span>Total mercadería</span>
              <span>${totalCosto.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
              <span>Envío</span>
              <span>${costoEnvio.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 dark:text-white">
              <span>Total compra</span>
              <span>${(totalCosto + costoEnvio).toFixed(2)}</span>
            </div>
          </div>
        </form>

        <div className="flex gap-3 justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onCancel} className="btn-secondary" disabled={isLoading}>
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary"
            disabled={isLoading || !proveedor.trim() || !itemsCompletos}
          >
            {isLoading ? 'Guardando...' : 'Guardar Compra'}
          </button>
        </div>
      </div>

      {escaneandoIndex !== null && (
        <EscanerCodigo
          onDetectado={(codigo) => {
            actualizarItem(escaneandoIndex, 'imei', codigo);
            setEscaneandoIndex(null);
          }}
          onCerrar={() => setEscaneandoIndex(null)}
        />
      )}
    </div>
  );
}
