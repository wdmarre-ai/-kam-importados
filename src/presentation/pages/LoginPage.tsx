import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../data/repo';
import { useStore } from '../../store';
import ImpulsaCredit from '../components/Shared/ImpulsaCredit';

export default function LoginPage() {
  const navigate = useNavigate();
  const setUser = useStore((s) => s.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await auth.login(email, password);
      if (authError) throw authError;

      if (data.user) {
        setUser(data.user);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-white to-gray-50 dark:from-kam-dark dark:to-gray-900">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <div className="w-16 h-16 bg-kam-gold bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-kam-gold">KAM</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              KAM Importados
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sistema de Gestión
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full"
                placeholder="usuario@ejemplo.com"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field w-full"
                placeholder="••••••••"
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full font-semibold"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>¿No tenés cuenta? Contactá al administrador</p>
          </div>
        </div>

        {/* Brand */}
        <div className="text-center mt-8 text-gray-600 dark:text-gray-400 text-sm">
          <p>© 2026 KAM Importados. Todos los derechos reservados.</p>
        </div>

        <div className="flex justify-center mt-6">
          <ImpulsaCredit />
        </div>
      </div>
    </div>
  );
}
