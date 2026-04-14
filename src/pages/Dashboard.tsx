import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  CalendarDays, 
  LogOut, 
  Menu, 
  X,
  TrendingUp
} from 'lucide-react';
import ManageClients from './ManageClients';
import ManageReservations from './ManageReservations';
import ReservationForm from './ReservationForm';

interface User {
  id: number;
  nombre: string;
  correo: string;
  cargo: string;
  // otras propiedades
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'clientes' | 'reservas'>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddingReservation, setIsAddingReservation] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navigateTo = (tab: 'home' | 'clientes' | 'reservas') => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false); // Close menu on mobile after navigation
    if (tab !== 'reservas') {
      setIsAddingReservation(false); // Reset reservation sub-state if navigating away
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile Topbar */}
      <div className="mobile-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="sidebar-logo" style={{ width: '32px', height: '32px' }}>
            <Building2 size={18} />
          </div>
          <span className="sidebar-title">San Martín</span>
        </div>
        <button className="menu-toggle" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Building2 size={24} />
          </div>
          <h2 className="sidebar-title">Hotel San Martín</h2>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => navigateTo('home')}
          >
            <Building2 className="icon" size={20} />
            <span>Inicio</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'clientes' ? 'active' : ''}`}
            onClick={() => navigateTo('clientes')}
          >
            <Users className="icon" size={20} />
            <span>Clientes</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'reservas' ? 'active' : ''}`}
            onClick={() => navigateTo('reservas')}
          >
            <CalendarDays className="icon" size={20} />
            <span>Reservas</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {user.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info">
              <span className="user-name">{user.nombre || 'Usuario'}</span>
              <span className="user-role">{user.cargo || 'Personal'}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isMobileMenuOpen && (
        <div 
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 15
          }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="dashboard-content">
        {activeTab === 'home' && (
          <div className="module-container" style={{ background: 'transparent', border: 'none', padding: 0 }}>
            <div className="dashboard-header">
              <h1>¡Hola, {user.nombre}!</h1>
              <p>Bienvenido al sistema de gestión. Aquí tienes un resumen.</p>
            </div>
            
            <div className="stats-grid">
              <div className="stat-card" onClick={() => navigateTo('reservas')} style={{ cursor: 'pointer' }}>
                <div className="stat-card-glow"></div>
                <div className="stat-icon blue">
                  <CalendarDays size={24} />
                </div>
                <div className="stat-info">
                  <div className="stat-label">Reservas Activas</div>
                  <div className="stat-value">12</div>
                </div>
              </div>
              
              <div className="stat-card" onClick={() => navigateTo('clientes')} style={{ cursor: 'pointer' }}>
                <div className="stat-card-glow"></div>
                <div className="stat-icon purple">
                  <Users size={24} />
                </div>
                <div className="stat-info">
                  <div className="stat-label">Total Clientes</div>
                  <div className="stat-value">145</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-card-glow"></div>
                <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                  <TrendingUp size={24} />
                </div>
                <div className="stat-info">
                  <div className="stat-label">Ocupación</div>
                  <div className="stat-value">75%</div>
                </div>
              </div>
            </div>

            {/* Quick Actions or Info (Placeholder for future) */}
            <div className="module-container" style={{ marginTop: '20px' }}>
              <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Acciones Rápidas</h2>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <button 
                  className="login-btn" 
                  style={{ width: 'auto', padding: '12px 24px' }}
                  onClick={() => { navigateTo('reservas'); setIsAddingReservation(true); }}
                >
                  Nueva Reserva
                </button>
                <button 
                  className="login-btn" 
                  style={{ width: 'auto', padding: '12px 24px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--glass-border)' }}
                  onClick={() => navigateTo('clientes')}
                >
                  Registrar Cliente
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'clientes' && (
          <div className="module-container">
            <ManageClients onBack={() => navigateTo('home')} />
          </div>
        )}

        {activeTab === 'reservas' && (
          <div className="module-container">
            {isAddingReservation ? (
              <ReservationForm 
                onCancel={() => setIsAddingReservation(false)} 
                onCreated={() => setIsAddingReservation(false)} 
                currentUser={user} 
              />
            ) : (
              <ManageReservations 
                onBack={() => navigateTo('home')} 
                onNewReservation={() => setIsAddingReservation(true)} 
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
