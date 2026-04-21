import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import bcrypt from 'bcryptjs';
import '../index.css';

interface LoginProps {
  setUser: (user: any) => void;
}

export default function Login({ setUser }: LoginProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: dbError } = await supabase
        .from('usuario')
        .select('*')
        .or(`correo.eq.${identifier},usuario.eq.${identifier}`)
        .maybeSingle();

      if (dbError) {
        throw dbError;
      }

      if (data) {
        const isValidPassword = data.clave ? bcrypt.compareSync(password, data.clave) : false;
        
        if (isValidPassword) {
          setUser(data);
          navigate('/administracion');
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

  return (
    <div className="login-container">
      <div className="login-header">
        <div className="logo-icon">
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

      <button type="button" onClick={() => navigate('/registrarse')} className="link-btn" style={{ marginTop: '24px' }}>
        ¿No tienes cuenta? Crear un usuario
      </button>
    </div>
  );
}
