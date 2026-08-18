import { useState } from 'react';
import type { MedioPago, Reparacion } from '../../../domain/tipos';

interface EntregaFormProps {
  reparacion: Reparacion;
  onSubmit: (data: { montoCobrado: number; medioPago: MedioPago; costoTecnico: number }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const MEDIOS_PAGO: { value: MedioPago; label: string }[] = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta_credito', label: 'Tarjeta de crédito' },
  { value: 'tarjeta_debito', label: 'Tarjeta de débito' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'otro', label: 'Otro' },
];

export default function EntregaForm({ reparacion, onSubmit, onCancel, isLoading = false }: EntregaFormProps) {
  const [montoCobrado, setMontoCobrado] = useState(reparacion.presupuesto ?? 0);
  const [medioPago, setMedioPago] = useState<MedioPago>('efectivo');
  const [costoTecnico, setCostoTecnico] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (montoCobrado <= 0) return;
    onSubmit({ montoCobrado, medioPago, costoTecnico });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Entregar y Cobrar</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Remito <strong>{reparacion.remito_id}</strong> — {reparacion.descripcion}
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Monto cobrado al cliente *
            </label>
            <input
              type="number"
              value={montoCobrado || ''}
              onChange={(e) => setMontoCobrado(parseFloat(e.target.value) || 0)}
              className="input-field w-full"
              step="0.01"
              min="0"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Medio de pago *
            </label>
            <select
              value={medioPago}
              onChange={(e) => setMedioPago(e.target.value as MedioPago)}
              className="input-field w-full"
              disabled={isLoading}
            >
              {MEDIOS_PAGO.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Pago al técnico (opcional)
            </label>
            <input
              type="number"
              value={costoTecnico || ''}
              onChange={(e) => setCostoTecnico(parseFloat(e.target.value) || 0)}
              className="input-field w-full"
              step="0.01"
              min="0"
              placeholder="Se registra como gasto"
              disabled={isLoading}
            />
          </div>

          <div className="card bg-gray-50 dark:bg-gray-900 text-sm space-y-1">
            <div className="flex justify-between">
              <span>Venta generada</span>
              <span className="font-semibold text-green-600">+${montoCobrado.toFixed(2)}</span>
            </div>
            {costoTecnico > 0 && (
              <div className="flex justify-between">
                <span>Gasto generado (técnico)</span>
                <span className="font-semibold text-red-600">-${costoTecnico.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onCancel} className="btn-secondary" disabled={isLoading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading || montoCobrado <= 0}>
              {isLoading ? 'Procesando...' : 'Confirmar Entrega'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
