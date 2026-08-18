import { useState } from 'react';
import { useGestion } from '../hooks/useGestion';

const MEDIO_PAGO_LABEL: Record<string, string> = {
  efectivo: 'Efectivo',
  tarjeta_credito: 'Tarjeta de crédito',
  tarjeta_debito: 'Tarjeta de débito',
  transferencia: 'Transferencia',
  otro: 'Otro',
};

function inicioDeMes(): string {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`;
}

export default function Dashboard() {
  const [from, setFrom] = useState(inicioDeMes());
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));

  const {
    isLoading,
    ventas,
    estadoResultados,
    flujoCaja,
    productoMasVendido,
    ventasPorCategoria,
    ventasPorUsuario,
    participacionMedioPago,
    ventasPorTipo,
    eliminarVenta,
  } = useGestion(from, to);
  const [errorMsg, setErrorMsg] = useState('');

  const handleEliminarVenta = (venta: any) => {
    if (confirm(`¿Eliminar la venta de $${venta.total_pesos.toFixed(2)}? Se repone el stock vendido.`)) {
      setErrorMsg('');
      eliminarVenta(venta, {
        onError: (err: any) => setErrorMsg(`❌ No se pudo eliminar: ${err.message}`),
      });
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Gestión</h1>
        <div className="flex items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Desde</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input-field text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Hasta</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input-field text-sm" />
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-sm mb-4">
          {errorMsg}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">Cargando datos del período...</div>
      ) : (
        <div className="space-y-8">
          {/* Estado de Resultados */}
          <section className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📊 Estado de Resultados
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Ingresos por ventas</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  ${estadoResultados.ingresosVentas.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Costo de mercadería</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  -${estadoResultados.costoVentas.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Margen bruto</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  ${estadoResultados.margenBruto.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Gastos operacionales</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  -${estadoResultados.gastosOperacionales.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Ganancia neta</p>
                <p
                  className={`text-xl font-bold ${
                    estadoResultados.gananciaNeta >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  ${estadoResultados.gananciaNeta.toFixed(2)}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              Costo de mercadería estimado a partir de las compras del período (aproximación).
            </p>
          </section>

          {/* Flujo de Caja */}
          <section className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">💵 Flujo de Caja</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Entradas (ventas)</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  +${flujoCaja.entradas.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Salidas (compras + gastos)</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  -${flujoCaja.salidas.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">Flujo neto</p>
                <p
                  className={`text-xl font-bold ${
                    flujoCaja.flujoNeto >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  ${flujoCaja.flujoNeto.toFixed(2)}
                </p>
              </div>
            </div>
          </section>

          {/* Dashboard de Ventas */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📈 Dashboard de Ventas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Producto más vendido</h3>
                {productoMasVendido ? (
                  <p className="text-sm">
                    <span className="font-bold text-kam-gold">{productoMasVendido[0]}</span> —{' '}
                    {productoMasVendido[1]} unidades
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sin ventas en el período</p>
                )}
              </div>

              <div className="card">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Ventas por categoría</h3>
                {ventasPorCategoria.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sin datos</p>
                ) : (
                  <div className="space-y-1">
                    {ventasPorCategoria.map(([cat, monto]) => (
                      <div key={cat} className="flex justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">{cat}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">${monto.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Ventas por usuario</h3>
                {ventasPorUsuario.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sin datos</p>
                ) : (
                  <div className="space-y-1">
                    {ventasPorUsuario.map(([nombre, monto]) => (
                      <div key={nombre} className="flex justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300">{nombre}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">${monto.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Minorista vs Mayorista</h3>
                {ventasPorTipo.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sin datos</p>
                ) : (
                  <div className="space-y-1">
                    {ventasPorTipo.map(([tipo, monto]) => (
                      <div key={tipo} className="flex justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300 capitalize">{tipo}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">${monto.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card md:col-span-2">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Participación por medio de pago</h3>
                {participacionMedioPago.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sin datos</p>
                ) : (
                  <div className="space-y-2">
                    {participacionMedioPago.map(({ medio, monto, porcentaje }) => (
                      <div key={medio}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700 dark:text-gray-300">{MEDIO_PAGO_LABEL[medio] ?? medio}</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            ${monto.toFixed(2)} ({porcentaje.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-kam-gold h-2 rounded-full"
                            style={{ width: `${porcentaje}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Registro de Ventas */}
          <section className="card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📋 Registro de Ventas ({ventas.length})
            </h2>
            {ventas.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
                No hay ventas en el período seleccionado
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      <th className="pb-2 pr-4">Fecha</th>
                      <th className="pb-2 pr-4">Cliente</th>
                      <th className="pb-2 pr-4">Medio de pago</th>
                      <th className="pb-2 pr-4">Tipo</th>
                      <th className="pb-2 pr-4 text-right">Total</th>
                      <th className="pb-2 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(ventas as any[]).map((v) => (
                      <tr key={v.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-2 pr-4">{v.fecha}</td>
                        <td className="py-2 pr-4">{v.cliente?.nombre ?? '—'}</td>
                        <td className="py-2 pr-4">{MEDIO_PAGO_LABEL[v.medio_pago] ?? v.medio_pago}</td>
                        <td className="py-2 pr-4 capitalize">{v.tipo}</td>
                        <td className="py-2 pr-4 text-right font-semibold text-gray-900 dark:text-white">
                          ${v.total_pesos.toFixed(2)}
                        </td>
                        <td className="py-2 text-right">
                          <button
                            onClick={() => handleEliminarVenta(v)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            🗑
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
