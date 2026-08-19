import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProductos } from '../hooks/useProductos';
import { useCompras } from '../hooks/useCompras';
import { useCategorias } from '../hooks/useCategorias';
import { useStore } from '../../store';
import ProductoForm from '../components/InventoryTable/ProductoForm';
import ProductoTable from '../components/InventoryTable/ProductoTable';
import CompraForm from '../components/InventoryTable/CompraForm';
import ActualizarCostoDolarForm from '../components/InventoryTable/ActualizarCostoDolarForm';
import CategoriasForm from '../components/InventoryTable/CategoriasForm';
import { descargarCsvStock } from '../../services/exportStock';
import type { Producto } from '../../domain/tipos';

export default function Mercaderia() {
  const sucursal = useStore((s) => s.sucursal);
  const { productos, isLoading, isUpdating, update, actualizarCostosPorCategoria, isActualizandoCostos } =
    useProductos();
  const {
    categorias,
    crear: crearCategoria,
    renombrar: renombrarCategoria,
    eliminar: eliminarCategoria,
    isCreando: isCreandoCategoria,
    isRenombrando: isRenombrandoCategoria,
    isEliminando: isEliminandoCategoria,
  } = useCategorias();
  const { createCompraCompleta, isCreating: isCreandoCompra } = useCompras();

  const [showCompraForm, setShowCompraForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDolarForm, setShowDolarForm] = useState(false);
  const [showCategoriasForm, setShowCategoriasForm] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleEditProducto = (producto: Producto) => {
    setEditingProducto(producto);
    setShowEditForm(true);
  };

  const handleEditSubmit = (data: any) => {
    if (!editingProducto) return;
    setErrorMsg('');
    setSuccessMsg('');
    update(
      { id: editingProducto.id, updates: data },
      {
        onSuccess: () => {
          setSuccessMsg('✅ Producto actualizado correctamente');
          setShowEditForm(false);
          setTimeout(() => setSuccessMsg(''), 2000);
        },
        onError: (err: any) => setErrorMsg(`❌ Error: ${err.message}`),
      }
    );
  };

  const handleCompraSubmit = (data: any) => {
    setErrorMsg('');
    setSuccessMsg('');
    createCompraCompleta(data, {
      onSuccess: () => {
        setSuccessMsg('✅ Compra registrada. Los productos ya están en stock.');
        setShowCompraForm(false);
        setTimeout(() => setSuccessMsg(''), 3000);
      },
      onError: (err: any) => setErrorMsg(`❌ Error al registrar la compra: ${err.message}`),
    });
  };

  const handleDolarSubmit = (data: { categoriaId: string; factor: number }) => {
    setErrorMsg('');
    setSuccessMsg('');
    actualizarCostosPorCategoria(data, {
      onSuccess: () => {
        setSuccessMsg('✅ Costos y precios actualizados por cotización del dólar');
        setShowDolarForm(false);
        setTimeout(() => setSuccessMsg(''), 3000);
      },
      onError: (err: any) => setErrorMsg(`❌ Error al actualizar: ${err.message}`),
    });
  };

  const handleDeleteProducto = async (id: string) => {
    if (confirm('¿Estás seguro de que querés eliminar este producto?')) {
      setErrorMsg('');
      try {
        const { productoRepo } = await import('../../data/repo');
        await productoRepo.delete(id);
        setSuccessMsg('✅ Producto eliminado');
        setTimeout(() => setSuccessMsg(''), 2000);
      } catch (err: any) {
        setErrorMsg(`❌ Error al eliminar: ${err.message}`);
      }
    }
  };

  const filteredProductos = productos.filter(
    (p) =>
      p.imei.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.marca.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValorizado = productos.reduce((sum, p) => sum + p.costo_unitario, 0);

  return (
    <div className="p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Mercadería</h1>
        <div className="flex flex-wrap gap-3">
          <button className="btn-secondary" onClick={() => descargarCsvStock(productos)}>
            📥 Descargar Stock
          </button>
          <button className="btn-secondary" onClick={() => setShowDolarForm(true)}>
            💱 Actualizar por Dólar
          </button>
          <button className="btn-secondary" onClick={() => setShowCategoriasForm(true)}>
            🏷️ Categorías
          </button>
          <button onClick={() => setShowCompraForm(true)} className="btn-primary">
            ➕ Nueva Compra
          </button>
        </div>
      </div>

      {/* Mensajes */}
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

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Productos</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{productos.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Valorizado Estimado {sucursal?.modo_moneda === 'costo_usd_precio_ars' ? '(USD)' : ''}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${totalValorizado.toFixed(2)}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cotización del Dólar</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {sucursal?.cotizacion_dolar_actual ? `$${sucursal.cotizacion_dolar_actual.toFixed(2)}` : '—'}
          </p>
          <Link to="/admin" className="text-xs text-kam-gold hover:underline">
            Editar en Administración
          </Link>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sucursal</p>
          <p className="text-xl font-semibold text-kam-gold">
            {sucursal?.nombre || 'No seleccionada'}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por IMEI, modelo o marca..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field w-full"
        />
      </div>

      {/* Table */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Inventario ({filteredProductos.length})
        </h2>
        <ProductoTable
          productos={filteredProductos}
          isLoading={isLoading}
          onEdit={handleEditProducto}
          onDelete={handleDeleteProducto}
        />
      </div>

      {showCompraForm && (
        <CompraForm
          categorias={categorias}
          onSubmit={handleCompraSubmit}
          onCancel={() => setShowCompraForm(false)}
          isLoading={isCreandoCompra}
        />
      )}

      {showEditForm && editingProducto && (
        <ProductoForm
          producto={editingProducto}
          categorias={categorias}
          onSubmit={handleEditSubmit}
          onCancel={() => setShowEditForm(false)}
          isLoading={isUpdating}
        />
      )}

      {showDolarForm && (
        <ActualizarCostoDolarForm
          categorias={categorias}
          cotizacionActual={sucursal?.cotizacion_dolar_actual}
          modoMoneda={sucursal?.modo_moneda ?? 'costo_usd_precio_ars'}
          onSubmit={handleDolarSubmit}
          onCancel={() => setShowDolarForm(false)}
          isLoading={isActualizandoCostos}
        />
      )}

      {showCategoriasForm && (
        <CategoriasForm
          categorias={categorias}
          onCrear={crearCategoria}
          onRenombrar={renombrarCategoria}
          onEliminar={eliminarCategoria}
          onCerrar={() => setShowCategoriasForm(false)}
          isLoading={isCreandoCategoria || isRenombrandoCategoria || isEliminandoCategoria}
        />
      )}
    </div>
  );
}
