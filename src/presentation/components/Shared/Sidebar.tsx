import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../../../data/repo';
import { useStore } from '../../../store';
import ImpulsaCredit from './ImpulsaCredit';

interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  color: string;
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useStore((s) => s.logout);
  const perfil = useStore((s) => s.perfil);
  const sucursal = useStore((s) => s.sucursal);
  const [isOpen, setIsOpen] = useState(true);

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Gestión',
      path: '/',
      icon: '📊',
      color: 'bg-blue-500',
    },
    {
      id: 'ventas',
      label: 'Ventas',
      path: '/ventas',
      icon: '💳',
      color: 'bg-green-500',
    },
    {
      id: 'reparaciones',
      label: 'Reparaciones',
      path: '/reparaciones',
      icon: '🔧',
      color: 'bg-orange-500',
    },
    {
      id: 'mercaderia',
      label: 'Mercadería',
      path: '/mercaderia',
      icon: '📦',
      color: 'bg-purple-500',
    },
    {
      id: 'gastos',
      label: 'Gastos',
      path: '/gastos',
      icon: '💰',
      color: 'bg-red-500',
    },
    {
      id: 'clientes',
      label: 'Clientes',
      path: '/clientes',
      icon: '👥',
      color: 'bg-teal-500',
    },
  ];

  const handleLogout = async () => {
    await auth.logout();
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Botón fijo para mostrar/ocultar el menú: siempre en el mismo lugar, sin fondo sólido para no verse como un cuadrado pegado */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 flex items-center justify-center w-8 h-8 rounded-md text-gray-500 dark:text-gray-400 hover:bg-black hover:bg-opacity-5 dark:hover:bg-white dark:hover:bg-opacity-10 text-base"
        aria-label={isOpen ? 'Ocultar menú' : 'Abrir menú'}
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 min-w-0 flex-shrink-0 ${
          isOpen ? 'w-64' : 'w-0'
        } bg-white dark:bg-kam-dark border-r border-gray-200 dark:border-gray-700 overflow-hidden`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              {sucursal?.logo_url ? (
                <img
                  src={sucursal.logo_url}
                  alt={sucursal.nombre}
                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                sucursal?.nombre && (
                  <div className="w-10 h-10 bg-kam-gold rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {sucursal.nombre.charAt(0).toUpperCase()}
                  </div>
                )
              )}
              {sucursal?.nombre && (
                <div className="text-left flex-1 min-w-0">
                  <h1 className="font-bold text-gray-900 dark:text-white text-sm truncate">
                    {sucursal.nombre}
                  </h1>
                </div>
              )}
            </div>
            {perfil && (
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <p className="font-medium">{perfil.nombre}</p>
                <p className="text-gray-500 dark:text-gray-500 capitalize">
                  {perfil.rol}
                </p>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.id}
                to={item.path}
                className={`nav-link group ${
                  location.pathname === item.path ? 'active' : ''
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="flex-1 text-left text-sm font-medium">
                  {item.label}
                </span>
                {location.pathname === item.path && (
                  <div className="w-1 h-6 bg-kam-gold rounded-r" />
                )}
              </Link>
            ))}
          </nav>

          {/* Admin & Logout */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-2">
            {perfil?.rol === 'admin' && (
              <Link
                to="/admin"
                className={`nav-link ${
                  location.pathname === '/admin' ? 'active' : ''
                }`}
              >
                <span className="text-lg">⚙️</span>
                <span className="flex-1 text-left text-sm font-medium">
                  Administración
                </span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-20 transition-colors rounded-lg text-sm font-medium"
            >
              <span className="text-lg">🚪</span>
              <span className="flex-1 text-left">Cerrar sesión</span>
            </button>

            <ImpulsaCredit variant="compact" />
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
