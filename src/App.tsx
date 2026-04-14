import { useState } from 'react';
import { supabase } from './services/supabaseClient';
import CreateUser from './pages/CreateUser';
import Dashboard from './pages/Dashboard';
import bcrypt from 'bcryptjs';
import './index.css';

function App() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [identifier, setIdentifier] = useState(''); // can be email or username
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Buscamos por correo o por usuario exacto sin filtrar la clave aún
      const { data, error: dbError } = await supabase
        .from('usuario')
        .select('*')
        .or(`correo.eq.${identifier},usuario.eq.${identifier}`)
        .maybeSingle();

      if (dbError) {
        throw dbError;
      }

      if (data) {
        // Verificamos la contraseña encriptada usando bcryptjs
        const isValidPassword = data.clave ? bcrypt.compareSync(password, data.clave) : false;
        
        if (isValidPassword) {
          // Login exitoso
          setUser(data);
        } else {
          throw new Error('Credenciales incorrectas. Verifica tu usuario y contraseña.');
        }
      } else {
        throw new Error('Credenciales incorrectas. Verifica tu usuario y contraseña.');
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIdentifier('');
    setPassword('');
  };

  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  if (isRegistering) {
    return <CreateUser onCancel={() => setIsRegistering(false)} onCreated={() => setIsRegistering(false)} />;
  }

  return (
    <div className="login-container">
      <div className="login-header">
        <div className="logo-icon">
          {/* Simple building/hotel icon SVG */}
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18"></path>
            <path d="M9 8h1"></path>
            <path d="M9 12h1"></path>
            <path d="M9 16h1"></path>
            <path d="M14 8h1"></path>
            <path d="M14 12h1"></path>
            <path d="M14 16h1"></path>
            <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path>
          </svg>
        </div>
        <h2 className="login-title">Hotel San Martín</h2>
        <p className="login-subtitle">Ingresa a tu cuenta para continuar</p>
      </div>

      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label htmlFor="identifier">Usuario o Correo</label>
          <input
            id="identifier"
            type="text"
            className="input-field"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="ej. administrador / admin@hotel.com"
            required
            autoComplete="username"
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? (
            <>
              <div className="loader"></div>
              <span>Ingresando...</span>
            </>
          ) : (
            'Iniciar Sesión'
          )}
        </button>
      </form>

      {error && (
        <div className="status-message status-error">
          {error}
        </div>
      )}

      <button onClick={() => setIsRegistering(true)} className="link-btn" style={{ marginTop: '24px' }}>
        ¿No tienes cuenta? Crear un usuario
      </button>
    </div>
  );
}

export default App;
