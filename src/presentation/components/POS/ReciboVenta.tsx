import { useState } from 'react';
import type { Sucursal } from '../../../domain/tipos';
import { linkWhatsapp, linkEmail, mensajeComprobanteVenta } from '../../../services/notificar';
import { descargarComoImagen } from '../../../services/comprobanteImagen';

interface ItemRecibo {
  modelo: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

interface ReciboVentaProps {
  sucursal?: Partial<Sucursal> | null;
  clienteNombre: string;
  clienteTelefono?: string;
  clienteEmail?: string;
  items: ItemRecibo[];
  costoEnvio: number;
  total: number;
  medioPago: string;
  infoGarantia?: string;
  onCerrar: () => void;
}

const MEDIO_PAGO_LABEL: Record<string, string> = {
  efectivo: 'Efectivo',
  tarjeta_credito: 'Tarjeta de crédito',
  tarjeta_debito: 'Tarjeta de débito',
  transferencia: 'Transferencia',
  otro: 'Otro',
};

export default function ReciboVenta({
  sucursal,
  clienteNombre,
  clienteTelefono,
  clienteEmail,
  items,
  costoEnvio,
  total,
  medioPago,
  infoGarantia,
  onCerrar,
}: ReciboVentaProps) {
  const [descargando, setDescargando] = useState(false);
  const subtotal = total - costoEnvio;

  const mensaje = mensajeComprobanteVenta({
    sucursal,
    clienteNombre,
    items,
    costoEnvio,
    total,
    medioPago,
    infoGarantia,
    incluyeImagenAdjunta: true,
  });

  const handleDescargar = async () => {
    setDescargando(true);
    try {
      await descargarComoImagen('recibo-imprimible', `comprobante-${Date.now()}`);
    } finally {
      setDescargando(false);
    }
  };

  const handleImprimir = () => window.print();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 print:bg-white print:static print:p-0">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col print:shadow-none print:max-w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 print:hidden">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Comprobante de Compra</h2>
          <button onClick={onCerrar} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl">
            ✕
          </button>
        </div>

        <div
          id="recibo-imprimible"
          className="p-8 space-y-4 text-gray-900 dark:text-white print:text-black overflow-y-auto bg-white dark:bg-gray-800"
        >
          <div className="text-center border-b border-gray-300 dark:border-gray-600 pb-4 mb-4">
            <h1 className="text-2xl font-bold">{sucursal?.nombre ?? 'KAM Importados'}</h1>
            {(sucursal?.direccion || sucursal?.ciudad) && (
              <p className="text-xs text-gray-600 dark:text-gray-400 print:text-gray-600">
                {[sucursal?.direccion, sucursal?.ciudad].filter(Boolean).join(', ')}
              </p>
            )}
            {sucursal?.telefono && (
              <p className="text-xs text-gray-600 dark:text-gray-400 print:text-gray-600">Tel: {sucursal.telefono}</p>
            )}
            {sucursal?.cuit && (
              <p className="text-xs text-gray-600 dark:text-gray-400 print:text-gray-600">CUIT: {sucursal.cuit}</p>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600 mt-1">
              Comprobante de Compra
            </p>
          </div>

          <div className="flex justify-between text-sm">
            <span className="font-semibold">Fecha:</span>
            <span>{new Date().toLocaleDateString('es-AR')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-semibold">Cliente:</span>
            <span>{clienteNombre}</span>
          </div>
          {clienteTelefono && (
            <div className="flex justify-between text-sm">
              <span className="font-semibold">Teléfono:</span>
              <span>{clienteTelefono}</span>
            </div>
          )}

          <div className="border-t border-gray-300 dark:border-gray-600 pt-4 space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>
                  {item.modelo} x{item.cantidad}
                </span>
                <span>${item.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-300 dark:border-gray-600 pt-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {costoEnvio > 0 && (
              <div className="flex justify-between text-sm">
                <span>Envío</span>
                <span>${costoEnvio.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-1 border-t border-gray-300 dark:border-gray-600">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Medio de pago</span>
              <span>{MEDIO_PAGO_LABEL[medioPago] ?? medioPago}</span>
            </div>
          </div>

          {infoGarantia && (
            <div className="border-t border-gray-300 dark:border-gray-600 pt-4 text-sm">
              <span className="font-semibold">Garantía:</span> {infoGarantia}
            </div>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600 border-t border-gray-300 dark:border-gray-600 pt-4">
            Este comprobante certifica la compra realizada. No es una factura fiscal.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-end p-6 border-t border-gray-200 dark:border-gray-700 print:hidden">
          {clienteTelefono && (
            <a href={linkWhatsapp(clienteTelefono, mensaje)} target="_blank" rel="noopener noreferrer" className="btn-secondary">
              💬 WhatsApp
            </a>
          )}
          {clienteEmail && (
            <a href={linkEmail(clienteEmail, 'Comprobante de compra', mensaje)} className="btn-secondary">
              ✉️ Email
            </a>
          )}
          <button onClick={handleDescargar} className="btn-secondary" disabled={descargando}>
            {descargando ? 'Generando...' : '🖼️ Descargar Imagen'}
          </button>
          <button onClick={handleImprimir} className="btn-primary">
            🖨️ Imprimir / PDF
          </button>
        </div>
      </div>
    </div>
  );
}
