import { useState } from 'react';
import type { NuevaReparacionInput } from '../../hooks/useReparaciones';

interface ReparacionFormProps {
  onSubmit: (data: NuevaReparacionInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const manana = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

export default function ReparacionForm({ onSubmit, onCancel, isLoading = false }: ReparacionFormProps) {
  const [form, setForm] = useState<NuevaReparacionInput>({
    clienteNombre: '',
    clienteTelefono: '',
    imei: '',
    descripcion: '',
    color: '',
    bateria_porcentaje: 100,
    detalles: '',
    fecha_estimada_entrega: manana(),
    presupuesto: null,
    foto: null,
  });

  const actualizar = (campo: keyof NuevaReparacionInput, valor: any) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const completo =
    form.clienteNombre.trim() &&
    form.clienteTelefono.trim() &&
    form.imei.trim() &&
    form.descripcion.trim() &&
    form.color.trim() &&
    form.fecha_estimada_entrega;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completo) return;
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nueva Reparación</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre del cliente *
              </label>
              <input
                type="text"
                value={form.clienteNombre}
                onChange={(e) => actualizar('clienteNombre', e.target.value)}
                className="input-field w-full"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Teléfono (WhatsApp) *
              </label>
              <input
                type="tel"
                value={form.clienteTelefono}
                onChange={(e) => actualizar('clienteTelefono', e.target.value)}
                className="input-field w-full"
                placeholder="+54 9 2611234567"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                IMEI *
              </label>
              <input
                type="text"
                value={form.imei}
                onChange={(e) => actualizar('imei', e.target.value)}
                className="input-field w-full"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Color *
              </label>
              <input
                type="text"
                value={form.color}
                onChange={(e) => actualizar('color', e.target.value)}
                className="input-field w-full"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Batería (%)
              </label>
              <input
                type="number"
                value={form.bateria_porcentaje}
                onChange={(e) => actualizar('bateria_porcentaje', parseFloat(e.target.value) || 0)}
                className="input-field w-full"
                min="0"
                max="100"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha estimada de entrega *
              </label>
              <input
                type="date"
                value={form.fecha_estimada_entrega}
                onChange={(e) => actualizar('fecha_estimada_entrega', e.target.value)}
                className="input-field w-full"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Presupuesto ($)
              </label>
              <input
                type="number"
                value={form.presupuesto ?? ''}
                onChange={(e) => actualizar('presupuesto', e.target.value ? parseFloat(e.target.value) : null)}
                className="input-field w-full"
                step="0.01"
                min="0"
                placeholder="A confirmar según diagnóstico"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Foto del aparato
              </label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => actualizar('foto', e.target.files?.[0] ?? null)}
                className="input-field w-full text-sm"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción del equipo *
            </label>
            <input
              type="text"
              value={form.descripcion}
              onChange={(e) => actualizar('descripcion', e.target.value)}
              className="input-field w-full"
              placeholder="iPhone 13 Pro 128GB"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Detalles / falla reportada
            </label>
            <textarea
              value={form.detalles}
              onChange={(e) => actualizar('detalles', e.target.value)}
              className="input-field w-full"
              rows={3}
              placeholder="No enciende, pantalla rota, etc"
              disabled={isLoading}
            />
          </div>
        </form>

        <div className="flex gap-3 justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onCancel} className="btn-secondary" disabled={isLoading}>
            Cancelar
          </button>
          <button onClick={handleSubmit} className="btn-primary" disabled={isLoading || !completo}>
            {isLoading ? 'Guardando...' : 'Ingresar Reparación'}
          </button>
        </div>
      </div>
    </div>
  );
}
