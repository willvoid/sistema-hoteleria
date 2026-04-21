import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';

interface AppRouterProps {
  user: any;
  setUser: (user: any) => void;
}

export default function AppRouter({ user, setUser }: AppRouterProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login setUser={setUser} />} />
      <Route 
        path="/administracion" 
        element={
          user ? (
            <Dashboard user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
    </Routes>
  );
}
