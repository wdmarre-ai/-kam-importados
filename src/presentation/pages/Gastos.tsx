import { useState } from 'react';
import { useGastos } from '../hooks/useGastos';
import GastoForm from '../components/Gastos/GastoForm';
import type { CategoriaGasto } from '../../domain/tipos';

const CATEGORIA_LABEL: Record<CategoriaGasto, string> = {
  alquiler: 'Alquiler',
  servicios: 'Servicios',
  sueldos: 'Sueldos',
  impuestos: 'Impuestos',
  otro: 'Otro',
};

export default function Gastos() {
  const hoy = new Date();
  const inicioMes = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`;
  const finMes = hoy.toISOString().slice(0, 10);

  const { gastos, isLoading, crear, isCreando, eliminar } = useGastos(inicioMes, finMes);
  const [showForm, setShowForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleCrear = (data: any) => {
    setErrorMsg('');
    crear(data, {
      onSuccess: () => {
        setSuccessMsg('✅ Gasto registrado');
        setShowForm(false);
        setTimeout(() => setSuccessMsg(''), 2000);
      },
      onError: (err: any) => setErrorMsg(`❌ Error: ${err.message}`),
    });
  };

  const handleEliminar = (id: string, descripcion: string) => {
    if (confirm(`¿Eliminar el gasto "${descripcion}"?`)) {
      setErrorMsg('');
      eliminar(id, {
        onSuccess: () => {
          setSuccessMsg('✅ Gasto eliminado');
          setTimeout(() => setSuccessMsg(''), 2000);
        },
        onError: (err: any) => setErrorMsg(`❌ Error al eliminar: ${err.message}`),
      });
    }
  };

  const totalMes = gastos.reduce((sum, g) => sum + g.monto, 0);
  const porCategoria = (cat: CategoriaGasto) =>
    gastos.filter((g) => g.categoria === cat).reduce((sum, g) => sum + g.monto, 0);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Gastos</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Nuevo Gasto
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-sm mb-4">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-3 bg-green-50 dark:bg-green-900 dark:bg-opacity-20 border border-green-200 dark:border-green-800 rounded text-green-700 dark:text-green-400 text-sm mb-4">
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Gastos Mes</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">${totalMes.toFixed(2)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Alquiler</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${porCategoria('alquiler').toFixed(2)}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Servicios</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${porCategoria('servicios').toFixed(2)}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sueldos</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${porCategoria('sueldos').toFixed(2)}
          </p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Registro de Gastos ({gastos.length})
        </h2>
        {isLoading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">Cargando...</div>
        ) : gastos.length === 0 ? (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            <p>No hay gastos registrados este mes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-2 pr-4">Fecha</th>
                  <th className="pb-2 pr-4">Categoría</th>
                  <th className="pb-2 pr-4">Descripción</th>
                  <th className="pb-2 pr-4 text-right">Monto</th>
                  <th className="pb-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {gastos.map((g) => (
                  <tr key={g.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 pr-4">{g.fecha}</td>
                    <td className="py-2 pr-4">{CATEGORIA_LABEL[g.categoria as CategoriaGasto]}</td>
                    <td className="py-2 pr-4">{g.descripcion}</td>
                    <td className="py-2 pr-4 text-right font-semibold text-red-600 dark:text-red-400">
                      -${g.monto.toFixed(2)}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => handleEliminar(g.id, g.descripcion)}
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
      </div>

      {showForm && <GastoForm onSubmit={handleCrear} onCancel={() => setShowForm(false)} isLoading={isCreando} />}
    </div>
  );
}
