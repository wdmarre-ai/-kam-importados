import { useState } from 'react';
import { useClientes } from '../hooks/useClientes';
import { useStore } from '../../store';
import { linkWhatsapp } from '../../services/notificar';

function semaforoFrecuencia(cantidadCompras: number): { color: string; texto: string; dot: string } {
  if (cantidadCompras >= 3) {
    return { color: 'text-green-600 dark:text-green-400', texto: 'Frecuente', dot: 'bg-green-500' };
  }
  if (cantidadCompras >= 1) {
    return { color: 'text-yellow-600 dark:text-yellow-400', texto: 'Ocasional', dot: 'bg-yellow-500' };
  }
  return { color: 'text-red-600 dark:text-red-400', texto: 'Sin compras', dot: 'bg-red-500' };
}

export default function Clientes() {
  const sucursal = useStore((s) => s.sucursal);
  const [busqueda, setBusqueda] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [soloConComprasEnPeriodo, setSoloConComprasEnPeriodo] = useState(false);

  const { clientes, isLoading, hayPeriodo, eliminar, isEliminando } = useClientes(
    from || undefined,
    to || undefined
  );

  const handleEliminar = (id: string, nombre: string, cantidadCompras: number) => {
    if (cantidadCompras > 0) {
      setErrorMsg(
        `❌ "${nombre}" tiene compras o reparaciones registradas, no se puede eliminar (se perdería el historial).`
      );
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }
    if (confirm(`¿Eliminar a "${nombre}"? Esta acción no se puede deshacer.`)) {
      setErrorMsg('');
      eliminar(id, {
        onError: (err: any) => setErrorMsg(`❌ Error al eliminar: ${err.message}`),
      });
    }
  };

  const filtrados = clientes
    .filter((c) => c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || c.telefono.includes(busqueda))
    .filter((c) => !hayPeriodo || !soloConComprasEnPeriodo || c.comprasEnPeriodo > 0);

  const minoristas = clientes.filter((c) => c.tipo === 'minorista').length;
  const mayoristas = clientes.filter((c) => c.tipo === 'mayorista').length;

  return (
    <div className="p-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Clientes</h1>
        <div className="flex items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Desde</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input-field text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Hasta</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input-field text-sm" />
          </div>
          {hayPeriodo && (
            <button
              onClick={() => {
                setFrom('');
                setTo('');
                setSoloConComprasEnPeriodo(false);
              }}
              className="btn-secondary text-sm"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {hayPeriodo && (
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
          <input
            type="checkbox"
            checked={soloConComprasEnPeriodo}
            onChange={(e) => setSoloConComprasEnPeriodo(e.target.checked)}
          />
          Mostrar solo clientes con compras en el período
        </label>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Clientes</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{clientes.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Minoristas</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{minoristas}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Mayoristas</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{mayoristas}</p>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre o teléfono..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input-field w-full"
        />
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-sm mb-4">
          {errorMsg}
        </div>
      )}

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Registro de Clientes ({filtrados.length})
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          🟢 3 o más compras · 🟡 1-2 compras · 🔴 sin compras (solo minorista)
        </p>
        {isLoading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            <p>No hay clientes cargados todavía</p>
            <p className="text-sm mt-2">Se registran automáticamente al hacer una venta o reparación</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-2 pr-4">Nombre</th>
                  <th className="pb-2 pr-4">Teléfono</th>
                  <th className="pb-2 pr-4">Email</th>
                  <th className="pb-2 pr-4">Tipo</th>
                  <th className="pb-2 pr-4">Última compra</th>
                  <th className="pb-2 pr-4">Frecuencia</th>
                  {hayPeriodo && <th className="pb-2 pr-4">Compras en el período</th>}
                  <th className="pb-2 pr-4">Contacto</th>
                  <th className="pb-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((c) => {
                  const semaforo = semaforoFrecuencia(c.cantidadCompras);
                  return (
                    <tr key={c.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2 pr-4">{c.nombre}</td>
                      <td className="py-2 pr-4">{c.telefono}</td>
                      <td className="py-2 pr-4">{c.email || '—'}</td>
                      <td className="py-2 pr-4 capitalize">{c.tipo}</td>
                      <td className="py-2 pr-4">{c.ultimaCompra ?? '—'}</td>
                      <td className="py-2 pr-4">
                        {c.tipo === 'minorista' ? (
                          <span className={`inline-flex items-center gap-1.5 ${semaforo.color}`}>
                            <span className={`w-2.5 h-2.5 rounded-full ${semaforo.dot}`} />
                            {semaforo.texto} ({c.cantidadCompras})
                          </span>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">
                            {c.cantidadCompras} compra{c.cantidadCompras === 1 ? '' : 's'}
                          </span>
                        )}
                      </td>
                      {hayPeriodo && (
                        <td className="py-2 pr-4">
                          {c.comprasEnPeriodo} compra{c.comprasEnPeriodo === 1 ? '' : 's'}
                        </td>
                      )}
                      <td className="py-2 pr-4">
                        <a
                          href={linkWhatsapp(
                            c.telefono,
                            `Hola ${c.nombre}, te escribimos${sucursal?.nombre ? ` de ${sucursal.nombre}` : ''}.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800"
                        >
                          💬 WhatsApp
                        </a>
                      </td>
                      <td className="py-2">
                        <button
                          onClick={() => handleEliminar(c.id, c.nombre, c.cantidadCompras)}
                          disabled={isEliminando}
                          className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                        >
                          🗑 Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
