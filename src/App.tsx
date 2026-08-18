import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { auth, perfilRepo, sucursalRepo } from './data/repo';
import { useStore } from './store';
import LoginPage from './presentation/pages/LoginPage';
import Dashboard from './presentation/pages/Dashboard';
import Ventas from './presentation/pages/Ventas';
import Reparaciones from './presentation/pages/Reparaciones';
import Mercaderia from './presentation/pages/Mercaderia';
import Gastos from './presentation/pages/Gastos';
import Admin from './presentation/pages/Admin';
import Sidebar from './presentation/components/Shared/Sidebar';

const queryClient = new QueryClient();

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const setPerfil = useStore((s) => s.setPerfil);
  const setSucursal = useStore((s) => s.setSucursal);

  const cargarPerfilYSucursal = async (userId: string) => {
    const perfil = await perfilRepo.getByUserId(userId);
    if (!perfil) return;
    setPerfil(perfil);
    const sucursal = await sucursalRepo.getById(perfil.sucursal_id);
    if (sucursal) setSucursal(sucursal);
  };

  useEffect(() => {
    // Verificar usuario actual al cargar
    auth.getCurrentUser().then(async (user) => {
      setUser(user);
      if (user) await cargarPerfilYSucursal(user.id);
      setIsLoading(false);
    });

    // Suscribirse a cambios de auth
    const { data } = auth.onAuthStateChange((user) => {
      setUser(user);
      if (user) cargarPerfilYSucursal(user.id);
    });

    return () => {
      data?.subscription?.unsubscribe?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-kam-dark">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-12 h-12 border-4 border-kam-gold border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        {!user ? (
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        ) : (
          <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar />
            <main className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/ventas" element={<Ventas />} />
                <Route path="/reparaciones" element={<Reparaciones />} />
                <Route path="/mercaderia" element={<Mercaderia />} />
                <Route path="/gastos" element={<Gastos />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        )}
      </Router>
    </QueryClientProvider>
  );
}

export default App;
