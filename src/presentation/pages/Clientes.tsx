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
  const { clientes, isLoading } = useClientes();
  const [busqueda, setBusqueda] = useState('');

  const filtrados = clientes.filter(
    (c) => c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || c.telefono.includes(busqueda)
  );

  const minoristas = clientes.filter((c) => c.tipo === 'minorista').length;
  const mayoristas = clientes.filter((c) => c.tipo === 'mayorista').length;

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Clientes</h1>

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
                  <th className="pb-2">Contacto</th>
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
                      <td className="py-2">
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
