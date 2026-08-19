import { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useGestion } from '../hooks/useGestion';

const MEDIO_PAGO_LABEL: Record<string, string> = {
  efectivo: 'Efectivo',
  tarjeta_credito: 'Tarjeta de crédito',
  tarjeta_debito: 'Tarjeta de débito',
  transferencia: 'Transferencia',
  otro: 'Otro',
};

const PALETA = ['#D4A574', '#2563EB', '#16A34A', '#DC2626', '#7C3AED', '#0891B2'];
const EJE_COLOR = '#9CA3AF';

function MensajeSinDatos() {
  return (
    <div className="h-56 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
      Sin datos en el período
    </div>
  );
}

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
    topProductos,
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
                <p className="text-gray-600 dark:text-gray-400">Costo de Mercadería Vendida</p>
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
              Costo real de los productos vendidos en el período (a su costo del momento de la venta).
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Top Productos Vendidos</h3>
                {topProductos.length === 0 ? (
                  <MensajeSinDatos />
                ) : (
                  <ResponsiveContainer width="100%" height={224}>
                    <BarChart data={topProductos} layout="vertical" margin={{ left: 8, right: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                      <XAxis type="number" allowDecimals={false} tick={{ fill: EJE_COLOR, fontSize: 12 }} />
                      <YAxis
                        type="category"
                        dataKey="nombre"
                        width={110}
                        tick={{ fill: EJE_COLOR, fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={(value: any) => [`${value} unidades`, "Vendidas"]}
                        contentStyle={{ fontSize: 13 }}
                      />
                      <Bar dataKey="cantidad" fill={PALETA[0]} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="card">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Ventas por Categoría</h3>
                {ventasPorCategoria.length === 0 ? (
                  <MensajeSinDatos />
                ) : (
                  <ResponsiveContainer width="100%" height={224}>
                    <PieChart>
                      <Pie
                        data={ventasPorCategoria.map(([nombre, monto]) => ({ nombre, monto }))}
                        dataKey="monto"
                        nameKey="nombre"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {ventasPorCategoria.map((_, i) => (
                          <Cell key={i} fill={PALETA[i % PALETA.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} contentStyle={{ fontSize: 13 }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="card">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Ventas por Usuario</h3>
                {ventasPorUsuario.length === 0 ? (
                  <MensajeSinDatos />
                ) : (
                  <ResponsiveContainer width="100%" height={224}>
                    <BarChart
                      data={ventasPorUsuario.map(([nombre, monto]) => ({ nombre, monto }))}
                      layout="vertical"
                      margin={{ left: 8, right: 16 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                      <XAxis type="number" tick={{ fill: EJE_COLOR, fontSize: 12 }} />
                      <YAxis
                        type="category"
                        dataKey="nombre"
                        width={110}
                        tick={{ fill: EJE_COLOR, fontSize: 12 }}
                      />
                      <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} contentStyle={{ fontSize: 13 }} />
                      <Bar dataKey="monto" fill={PALETA[1]} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="card">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Minorista vs Mayorista</h3>
                {ventasPorTipo.length === 0 ? (
                  <MensajeSinDatos />
                ) : (
                  <ResponsiveContainer width="100%" height={224}>
                    <PieChart>
                      <Pie
                        data={ventasPorTipo.map(([tipo, monto]) => ({
                          tipo: tipo === 'minorista' ? 'Minorista' : 'Mayorista',
                          monto,
                        }))}
                        dataKey="monto"
                        nameKey="tipo"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {ventasPorTipo.map((_, i) => (
                          <Cell key={i} fill={PALETA[i % PALETA.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} contentStyle={{ fontSize: 13 }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="card lg:col-span-2">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Participación por Medio de Pago</h3>
                {participacionMedioPago.length === 0 ? (
                  <MensajeSinDatos />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <ResponsiveContainer width="100%" height={224}>
                      <PieChart>
                        <Pie
                          data={participacionMedioPago.map(({ medio, monto }) => ({
                            medio: MEDIO_PAGO_LABEL[medio] ?? medio,
                            monto,
                          }))}
                          dataKey="monto"
                          nameKey="medio"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                        >
                          {participacionMedioPago.map((_, i) => (
                            <Cell key={i} fill={PALETA[i % PALETA.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} contentStyle={{ fontSize: 13 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-2">
                      {participacionMedioPago.map(({ medio, monto, porcentaje }, i) => (
                        <div key={medio} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <span
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: PALETA[i % PALETA.length] }}
                            />
                            {MEDIO_PAGO_LABEL[medio] ?? medio}
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            ${monto.toFixed(2)} ({porcentaje.toFixed(0)}%)
                          </span>
                        </div>
                      ))}
                    </div>
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
