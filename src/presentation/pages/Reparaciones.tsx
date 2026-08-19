import { useState } from 'react';
import { useReparaciones } from '../hooks/useReparaciones';
import ReparacionForm from '../components/Reparaciones/ReparacionForm';
import ReparacionesTable from '../components/Reparaciones/ReparacionesTable';
import EntregaForm from '../components/Reparaciones/EntregaForm';
import ConstanciaReparacion from '../components/Reparaciones/ConstanciaReparacion';
import { linkWhatsapp, mensajeActualizacionReparacion } from '../../services/notificar';
import { useStore } from '../../store';
import type { Reparacion, EstadoReparacion } from '../../domain/tipos';

const hoyISO = () => new Date().toISOString().slice(0, 10);
const mananaISO = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
};

export default function Reparaciones() {
  const sucursal = useStore((s) => s.sucursal);
  const { reparaciones, isLoading, crear, isCreando, cambiarEstado, entregarConCobro, isEntregando } =
    useReparaciones();

  const [showForm, setShowForm] = useState(false);
  const [entregando, setEntregando] = useState<Reparacion | null>(null);
  const [verConstancia, setVerConstancia] = useState<Reparacion | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [linkConfirmacion, setLinkConfirmacion] = useState<string | null>(null);

  const handleCrear = (data: any) => {
    setErrorMsg('');
    setSuccessMsg('');
    crear(data, {
      onSuccess: () => {
        setSuccessMsg('✅ Reparación ingresada correctamente');
        setShowForm(false);
        setTimeout(() => setSuccessMsg(''), 3000);
      },
      onError: (err: any) => setErrorMsg(`❌ Error: ${err.message}`),
    });
  };

  const handleCambiarEstado = (id: string, estado: EstadoReparacion) => {
    cambiarEstado({ id, estado });
  };

  const handleEntregar = (data: { montoCobrado: number; medioPago: any; costoTecnico: number }) => {
    if (!entregando) return;
    setErrorMsg('');
    const reparacionEntregada = entregando;
    entregarConCobro(
      { reparacion: entregando, ...data },
      {
        onSuccess: () => {
          setSuccessMsg('✅ Reparación entregada. Venta registrada.');
          setEntregando(null);
          // El mensaje al cliente solo informa lo que pagó por su equipo.
          // Nunca incluye el pago al técnico: eso es interno del negocio.
          if (reparacionEntregada.cliente?.telefono) {
            const mensaje = mensajeActualizacionReparacion({
              sucursal,
              remitoId: reparacionEntregada.remito_id,
              estado: 'entregado',
              detalle: `Monto abonado: $${data.montoCobrado.toFixed(2)}. ¡Gracias por confiar en nosotros!`,
            });
            setLinkConfirmacion(linkWhatsapp(reparacionEntregada.cliente.telefono, mensaje));
          }
          setTimeout(() => setSuccessMsg(''), 3000);
        },
        onError: (err: any) => setErrorMsg(`❌ Error al entregar: ${err.message}`),
      }
    );
  };

  const enReparacion = reparaciones.filter((r) => r.estado === 'en_reparacion').length;
  const pendienteEntrega = reparaciones.filter((r) => r.estado === 'pendiente_entrega').length;
  const entregadasMes = reparaciones.filter(
    (r) => r.estado === 'entregado' && r.fecha_real_entrega?.slice(0, 7) === hoyISO().slice(0, 7)
  ).length;
  const ingresosMes = reparaciones
    .filter((r) => r.estado === 'entregado' && r.fecha_real_entrega?.slice(0, 7) === hoyISO().slice(0, 7))
    .reduce((sum, r) => sum + (r.presupuesto ?? 0), 0);

  const pendientesHoyManana = reparaciones.filter(
    (r) =>
      r.estado !== 'entregado' &&
      r.estado !== 'rechazado' &&
      (r.fecha_estimada_entrega === hoyISO() || r.fecha_estimada_entrega === mananaISO())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Reparaciones</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Nueva Reparación
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
      {linkConfirmacion && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 border border-blue-200 dark:border-blue-800 rounded text-sm mb-4 flex items-center justify-between gap-3">
          <span className="text-blue-700 dark:text-blue-400">
            Avisale al cliente que su equipo está listo
          </span>
          <div className="flex gap-2">
            <a href={linkConfirmacion} target="_blank" rel="noopener noreferrer" className="btn-secondary">
              💬 Enviar por WhatsApp
            </a>
            <button onClick={() => setLinkConfirmacion(null)} className="text-blue-700 dark:text-blue-400 px-2">
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card border-l-4 border-l-orange-500">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">En Reparación</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{enReparacion}</p>
        </div>
        <div className="card border-l-4 border-l-yellow-500">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pendiente Entrega</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{pendienteEntrega}</p>
        </div>
        <div className="card border-l-4 border-l-green-500">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Entregadas (Mes)</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{entregadasMes}</p>
        </div>
        <div className="card border-l-4 border-l-blue-500">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ingresos Repara.</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">${ingresosMes.toFixed(2)}</p>
        </div>
      </div>

      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          ⏰ Pendientes de Hoy y Mañana
        </h2>
        {pendientesHoyManana.length === 0 ? (
          <div className="text-center py-6 text-gray-600 dark:text-gray-400">
            <p>No hay reparaciones con entrega estimada para hoy o mañana</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendientesHoyManana.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 rounded-lg text-sm"
              >
                <span>
                  <strong>{r.remito_id}</strong> — {r.cliente?.nombre} — {r.descripcion}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {r.fecha_estimada_entrega === hoyISO() ? 'Hoy' : 'Mañana'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Todas las Reparaciones ({reparaciones.length})
        </h2>
        <ReparacionesTable
          reparaciones={reparaciones}
          isLoading={isLoading}
          onCambiarEstado={handleCambiarEstado}
          onEntregar={setEntregando}
          onVerConstancia={setVerConstancia}
        />
      </div>

      {showForm && (
        <ReparacionForm onSubmit={handleCrear} onCancel={() => setShowForm(false)} isLoading={isCreando} />
      )}

      {entregando && (
        <EntregaForm
          reparacion={entregando}
          onSubmit={handleEntregar}
          onCancel={() => setEntregando(null)}
          isLoading={isEntregando}
        />
      )}

      {verConstancia && (
        <ConstanciaReparacion reparacion={verConstancia} onCerrar={() => setVerConstancia(null)} />
      )}
    </div>
  );
}
