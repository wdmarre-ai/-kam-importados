import type { TipoCliente, MedioPago } from '../../../domain/tipos';

interface CartItem {
  productoId: string;
  modelo: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

interface POSCartProps {
  items: CartItem[];
  tipo: TipoCliente;
  medioPago: MedioPago;
  precioDolar?: number;
  costoEnvio?: number;
  onRemoveItem: (productoId: string) => void;
  onChangeTipo: (tipo: TipoCliente) => void;
  onChangeMedioPago: (medio: MedioPago) => void;
  onChangeCantidad: (productoId: string, cantidad: number) => void;
  onCheckout: () => void;
  isProcessing?: boolean;
}

export default function POSCart({
  items,
  tipo,
  medioPago,
  precioDolar,
  costoEnvio = 0,
  onRemoveItem,
  onChangeTipo,
  onChangeMedioPago,
  onChangeCantidad,
  onCheckout,
  isProcessing = false,
}: POSCartProps) {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal + costoEnvio;
  const totalUsd = precioDolar ? total / precioDolar : 0;

  return (
    <div className="card h-full flex flex-col">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        🛒 Carrito ({items.length})
      </h2>

      {/* Items */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-2">
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>Carrito vacío</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.productoId}
              className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">
                    {item.modelo}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    ${item.precio.toFixed(2)} x {item.cantidad}
                  </p>
                </div>
                <button
                  onClick={() => onRemoveItem(item.productoId)}
                  className="text-red-600 hover:text-red-700 text-lg"
                  disabled={isProcessing}
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onChangeCantidad(item.productoId, Math.max(1, item.cantidad - 1))}
                  className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-sm font-medium"
                  disabled={isProcessing}
                >
                  −
                </button>
                <input
                  type="number"
                  value={item.cantidad}
                  onChange={(e) =>
                    onChangeCantidad(item.productoId, Math.max(1, parseInt(e.target.value) || 1))
                  }
                  className="input-field w-16 text-center py-1 text-sm"
                  min="1"
                  disabled={isProcessing}
                />
                <button
                  onClick={() => onChangeCantidad(item.productoId, item.cantidad + 1)}
                  className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-sm font-medium"
                  disabled={isProcessing}
                >
                  +
                </button>
                <div className="flex-1 text-right">
                  <p className="font-bold text-gray-900 dark:text-white">
                    ${item.subtotal.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4 space-y-3">
        {/* Tipo de venta */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Tipo de Venta
          </label>
          <select
            value={tipo}
            onChange={(e) => onChangeTipo(e.target.value as TipoCliente)}
            className="input-field w-full text-sm"
            disabled={isProcessing}
          >
            <option value="minorista">Minorista</option>
            <option value="mayorista">Mayorista</option>
          </select>
        </div>

        {/* Medio de pago */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Medio de Pago
          </label>
          <select
            value={medioPago}
            onChange={(e) => onChangeMedioPago(e.target.value as MedioPago)}
            className="input-field w-full text-sm"
            disabled={isProcessing}
          >
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta_credito">Tarjeta Crédito</option>
            <option value="tarjeta_debito">Tarjeta Débito</option>
            <option value="transferencia">Transferencia</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        {/* Total */}
        <div className="bg-kam-gold bg-opacity-10 p-3 rounded-lg border border-kam-gold">
          <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
            <span>Subtotal productos</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {costoEnvio > 0 && (
            <div className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
              <span>Envío</span>
              <span>${costoEnvio.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between mb-2 mt-1 pt-1 border-t border-kam-gold border-opacity-30">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total</span>
            <span className="font-bold text-gray-900 dark:text-white">
              ${total.toFixed(2)}
            </span>
          </div>
          {totalUsd > 0 && (
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>USD (${precioDolar?.toFixed(2)})</span>
              <span>${totalUsd.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Checkout */}
      <button
        onClick={onCheckout}
        disabled={isProcessing || items.length === 0}
        className="btn-primary w-full py-3 font-bold text-lg"
      >
        {isProcessing ? '⏳ Procesando...' : `💳 Cobrar $${total.toFixed(2)}`}
      </button>
    </div>
  );
}
