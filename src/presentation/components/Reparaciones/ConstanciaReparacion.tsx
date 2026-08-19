import type { Reparacion } from '../../../domain/tipos';
import { linkWhatsapp, linkEmail, linkGmail, mensajeIngresoReparacion } from '../../../services/notificar';
import { useStore } from '../../../store';

interface ConstanciaReparacionProps {
  reparacion: Reparacion;
  onCerrar: () => void;
}

export default function ConstanciaReparacion({ reparacion, onCerrar }: ConstanciaReparacionProps) {
  const sucursal = useStore((s) => s.sucursal);

  const mensaje = mensajeIngresoReparacion({
    sucursal,
    remitoId: reparacion.remito_id,
    imei: reparacion.imei,
    descripcion: reparacion.descripcion,
    fechaEstimada: reparacion.fecha_estimada_entrega,
    presupuesto: reparacion.presupuesto ?? null,
  });

  const handleImprimir = () => window.print();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 print:bg-white print:static print:p-0">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full print:shadow-none print:max-w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 print:hidden">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Constancia de Recepción</h2>
          <button onClick={onCerrar} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl">
            ✕
          </button>
        </div>

        <div id="constancia-imprimible" className="p-8 space-y-4 text-gray-900 dark:text-white print:text-black">
          <div className="text-center border-b border-gray-300 dark:border-gray-600 pb-4 mb-4">
            {sucursal?.logo_url && (
              <img src={sucursal.logo_url} alt="Logo" className="w-16 h-16 object-contain mx-auto mb-2" />
            )}
            {sucursal?.nombre && <h1 className="text-2xl font-bold">{sucursal.nombre}</h1>}
            {(sucursal?.direccion || sucursal?.ciudad) && (
              <p className="text-xs text-gray-600 dark:text-gray-400 print:text-gray-600">
                {[sucursal?.direccion, sucursal?.ciudad].filter(Boolean).join(', ')}
              </p>
            )}
            {sucursal?.telefono && (
              <p className="text-xs text-gray-600 dark:text-gray-400 print:text-gray-600">
                Tel: {sucursal.telefono}
              </p>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-600 mt-1">
              Constancia de Recepción de Equipo
            </p>
          </div>

          <div className="flex justify-between text-sm">
            <span className="font-semibold">N° de Remito:</span>
            <span className="font-mono">{reparacion.remito_id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-semibold">Fecha de ingreso:</span>
            <span>{reparacion.fecha_ingreso}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-semibold">Cliente:</span>
            <span>{reparacion.cliente?.nombre}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="font-semibold">Teléfono:</span>
            <span>{reparacion.cliente?.telefono}</span>
          </div>

          <div className="border-t border-gray-300 dark:border-gray-600 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-semibold">Equipo:</span>
              <span>{reparacion.descripcion}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-semibold">IMEI:</span>
              <span className="font-mono">{reparacion.imei}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-semibold">Color:</span>
              <span>{reparacion.color}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-semibold">Batería:</span>
              <span>{reparacion.bateria_porcentaje}%</span>
            </div>
            {reparacion.detalles && (
              <div className="text-sm">
                <span className="font-semibold">Falla reportada:</span>
                <p className="mt-1">{reparacion.detalles}</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-300 dark:border-gray-600 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-semibold">Fecha estimada de entrega:</span>
              <span>{reparacion.fecha_estimada_entrega}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-semibold">Presupuesto:</span>
              <span>
                {reparacion.presupuesto ? `$${reparacion.presupuesto.toFixed(2)}` : 'A confirmar según verificación'}
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600 border-t border-gray-300 dark:border-gray-600 pt-4">
            El equipo se entrega bajo las condiciones informadas al momento de la recepción. Presentar este remito
            para retirar el equipo.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-end p-6 border-t border-gray-200 dark:border-gray-700 print:hidden">
          {reparacion.cliente?.telefono && (
            <a
              href={linkWhatsapp(reparacion.cliente.telefono, mensaje)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              💬 Enviar por WhatsApp
            </a>
          )}
          {reparacion.cliente?.email && (
            <>
              <a
                href={linkEmail(reparacion.cliente.email, `Recibo ${reparacion.remito_id}`, mensaje)}
                className="btn-secondary"
              >
                ✉️ Email (app del sistema)
              </a>
              <a
                href={linkGmail(reparacion.cliente.email, `Recibo ${reparacion.remito_id}`, mensaje)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                📧 Gmail (navegador)
              </a>
            </>
          )}
          <button onClick={handleImprimir} className="btn-primary">
            🖨️ Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}
