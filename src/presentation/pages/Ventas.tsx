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
  const { ventas } = useVentas();
  const { productos } = useProductos();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [tipoVenta, setTipoVenta] = useState<TipoCliente>('minorista');
  const [medioPago, setMedioPago] = useState<MedioPago>('efectivo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [precioDolar] = useState(900); // TODO: Hacer dinámico

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
    if (!cartItems.length || !user || !sucursal) return;

    setIsProcessing(true);
    try {
      const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

      // TODO: Crear venta en Supabase
      console.log('Creando venta:', {
        total,
        items: cartItems,
        tipoVenta,
        medioPago,
        usuario: user.id,
        sucursal: sucursal.id,
      });

      setCartItems([]);
    } catch (error) {
      console.error('Error al procesar venta:', error);
    } finally {
      setIsProcessing(false);
    }
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
                    disabled={isProcessing}
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
        <div>
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
            isProcessing={isProcessing}
          />
        </div>
      </div>
    </div>
  );
}
