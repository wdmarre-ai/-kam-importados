import { useState } from 'react';
import { useVentas } from '../hooks/useVentas';
import { useProductos } from '../hooks/useProductos';
import { useStore } from '../../store';
import POSSearch from '../components/POS/POSSearch';
import POSCart from '../components/POS/POSCart';
import type { TipoCliente, MedioPago } from '../../domain/tipos';

interface CartItem {
  productoId: string;
  imei: string;
  modelo: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

export default function Ventas() {
  const sucursal = useStore((s) => s.sucursal);
  const user = useStore((s) => s.user);
  const { ventas, createVentaCompleta, isCreating } = useVentas();
  const { productos } = useProductos();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [tipoVenta, setTipoVenta] = useState<TipoCliente>('minorista');
  const [medioPago, setMedioPago] = useState<MedioPago>('efectivo');
  const [precioDolar] = useState(900); // TODO: Hacer dinámico
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAddToCart = (producto: any) => {
    const existingItem = cartItems.find((item) => item.productoId === producto.id);

    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.productoId === producto.id
            ? {
                ...item,
                cantidad: item.cantidad + 1,
                subtotal: (item.cantidad + 1) * item.precio,
              }
            : item
        )
      );
    } else {
      const precio =
        tipoVenta === 'mayorista' ? producto.precio_mayorista : producto.precio_minorista;
      setCartItems([
        ...cartItems,
        {
          productoId: producto.id,
          imei: producto.imei,
          modelo: producto.modelo,
          cantidad: 1,
          precio,
          subtotal: precio,
        },
      ]);
    }
  };

  const handleRemoveItem = (productoId: string) => {
    setCartItems(cartItems.filter((item) => item.productoId !== productoId));
  };

  const handleChangeCantidad = (productoId: string, cantidad: number) => {
    setCartItems(
      cartItems.map((item) =>
        item.productoId === productoId
          ? {
              ...item,
              cantidad,
              subtotal: cantidad * item.precio,
            }
          : item
      )
    );
  };

  const handleCheckout = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!cartItems.length) {
      setErrorMsg('El carrito está vacío');
      return;
    }

    if (!clienteNombre.trim()) {
      setErrorMsg('Ingresá el nombre del cliente');
      return;
    }

    if (!clienteTelefono.trim()) {
      setErrorMsg('Ingresá el teléfono del cliente');
      return;
    }

    if (!user || !sucursal) {
      setErrorMsg('Error: No hay usuario o sucursal seleccionada');
      return;
    }

    createVentaCompleta(
      {
        items: cartItems.map((item) => ({
          productoId: item.productoId,
          precio: item.precio,
          cantidad: item.cantidad,
        })),
        clienteNombre: clienteNombre.trim(),
        clienteTelefono: clienteTelefono.trim(),
        tipo: tipoVenta,
        medioPago,
        precioDolar,
      },
      {
        onSuccess: () => {
          const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
          setSuccessMsg(`✅ Venta guardada correctamente. Total: $${total.toFixed(2)}`);
          setCartItems([]);
          setClienteNombre('');
          setClienteTelefono('');
          setTimeout(() => setSuccessMsg(''), 3000);
        },
        onError: (err: any) => {
          setErrorMsg(`❌ Error al guardar: ${err.message}`);
        },
      }
    );
  };

  const totalVentasMes = ventas.reduce((sum, v) => sum + v.total_pesos, 0);
  const promedioTicket = ventas.length > 0 ? totalVentasMes / ventas.length : 0;

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
        💳 Punto de Venta
      </h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Ventas del Mes
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${totalVentasMes.toFixed(2)}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Cantidad de Ventas
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {ventas.length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Ticket Promedio
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ${promedioTicket.toFixed(2)}
          </p>
        </div>
      </div>

      {/* POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Search */}
        <div className="lg:col-span-2">
          <POSSearch onProductoFound={handleAddToCart} />

          {/* Productos sugeridos */}
          <div className="mt-6 card">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📱 Productos Disponibles
            </h2>
            {productos.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No hay productos en inventario</p>
                <p className="text-sm mt-2">Creá productos en Mercadería para vender</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {productos.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleAddToCart(p)}
                    disabled={isCreating}
                    className="text-left p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-kam-gold dark:hover:border-kam-gold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="font-semibold text-sm text-gray-900 dark:text-white">
                      {p.modelo}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      IMEI: {p.imei}
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        🔋 {p.bateria_porcentaje}%
                      </span>
                      <span className="font-bold text-kam-gold">
                        ${p.precio_minorista.toFixed(2)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Cart */}
        <div className="space-y-4">
          {/* Mensajes */}
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-sm">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-green-50 dark:bg-green-900 dark:bg-opacity-20 border border-green-200 dark:border-green-800 rounded text-green-700 dark:text-green-400 text-sm">
              {successMsg}
            </div>
          )}

          {/* Datos cliente */}
          <div className="card space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">👤 Datos del Cliente</h3>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
                className="input-field w-full text-sm"
                placeholder="Nombre del cliente"
                disabled={isCreating || isCreating}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Teléfono *
              </label>
              <input
                type="tel"
                value={clienteTelefono}
                onChange={(e) => setClienteTelefono(e.target.value)}
                className="input-field w-full text-sm"
                placeholder="+54 9 1234567890"
                disabled={isCreating || isCreating}
              />
            </div>
          </div>

          {/* Carrito */}
          <POSCart
            items={cartItems}
            tipo={tipoVenta}
            medioPago={medioPago}
            precioDolar={precioDolar}
            onRemoveItem={handleRemoveItem}
            onChangeTipo={setTipoVenta}
            onChangeMedioPago={setMedioPago}
            onChangeCantidad={handleChangeCantidad}
            onCheckout={handleCheckout}
            isProcessing={isCreating}
          />
        </div>
      </div>
    </div>
  );
}
