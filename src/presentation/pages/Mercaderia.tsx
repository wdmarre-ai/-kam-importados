import { useState } from 'react';
import { useProductos } from '../hooks/useProductos';
import { useStore } from '../../store';
import ProductoForm from '../components/InventoryTable/ProductoForm';
import ProductoTable from '../components/InventoryTable/ProductoTable';
import type { Producto } from '../../domain/tipos';

export default function Mercaderia() {
  const sucursal = useStore((s) => s.sucursal);
  const { productos, isLoading, isCreating, isUpdating, create, update } =
    useProductos();
  const [showForm, setShowForm] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const categorias = [
    { id: '1', nombre: 'iPhone' },
    { id: '2', nombre: 'Samsung' },
    { id: '3', nombre: 'Accesorios' },
    { id: '4', nombre: 'Otros' },
  ];

  const handleAddProducto = () => {
    setEditingProducto(null);
    setShowForm(true);
  };

  const handleEditProducto = (producto: Producto) => {
    setEditingProducto(producto);
    setShowForm(true);
  };

  const handleFormSubmit = (data: any) => {
    setErrorMsg('');
    setSuccessMsg('');

    const productoData = {
      ...data,
      sucursal_id: sucursal?.id,
      estado: 'en_stock',
    };

    if (editingProducto) {
      update(
        { id: editingProducto.id, updates: productoData },
        {
          onSuccess: () => {
            setSuccessMsg('✅ Producto actualizado correctamente');
            setShowForm(false);
            setTimeout(() => setSuccessMsg(''), 2000);
          },
          onError: (err: any) => {
            setErrorMsg(`❌ Error: ${err.message}`);
          },
        }
      );
    } else {
      create(productoData, {
        onSuccess: () => {
          setSuccessMsg('✅ Producto creado correctamente');
          setShowForm(false);
          setTimeout(() => setSuccessMsg(''), 2000);
        },
        onError: (err: any) => {
          setErrorMsg(`❌ Error: ${err.message}`);
        },
      });
    }
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

  const totalValorizado = productos.reduce(
    (sum, p) => sum + p.costo_unitario * (p.id ? 1 : 0),
    0
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Mercadería
        </h1>
        <div className="flex gap-3">
          <button className="btn-secondary">📥 Descargar Stock</button>
          <button onClick={handleAddProducto} className="btn-primary">
            ➕ Nuevo Producto
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Total Productos
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {productos.length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Valorizado Estimado
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${totalValorizado.toFixed(2)}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Sucursal
          </p>
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

      {/* Form Modal */}
      {showForm && (
        <ProductoForm
          producto={editingProducto || undefined}
          categorias={categorias}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
          isLoading={isCreating || isUpdating}
        />
      )}
    </div>
  );
}
