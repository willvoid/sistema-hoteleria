import { useEffect, useState } from 'react';
import { ClientService } from '../services/clientService';
import CreateClient from './CreateClient';
import '../index.css';

interface ManageClientsProps {
  onBack: () => void;
}

export default function ManageClients({ onBack }: ManageClientsProps) {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States para el flujo C/U
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<any | null>(null);

  useEffect(() => {
    if (!isFormOpen) {
      fetchClients();
    }
  }, [isFormOpen]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await ClientService.getClients();
      setClients(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los clientes.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewClient = () => {
    setClientToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditClient = (client: any) => {
    setClientToEdit(client);
    setIsFormOpen(true);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setClientToEdit(null);
  };

  const handleFormSaved = () => {
    setIsFormOpen(false);
    setClientToEdit(null);
  };

  if (isFormOpen) {
    return (
      <CreateClient 
        onCancel={handleFormCancel} 
        onCreated={handleFormSaved} 
        clientToEdit={clientToEdit} 
      />
    );
  }

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ marginBottom: '8px', fontSize: '28px', textAlign: 'left' }}>Directorio de Clientes</h1>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'left', margin: 0 }}>Visualiza y edita los perfiles de los clientes</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={onBack} className="login-btn" style={{ width: 'auto', padding: '10px 20px', backgroundColor: 'transparent', border: '1px solid var(--glass-border)' }}>
            Volver Al Inicio
          </button>
          <button onClick={handleNewClient} className="login-btn" style={{ width: 'auto', padding: '10px 20px' }}>
            + Nuevo Cliente
          </button>
        </div>
      </div>

      {error && (
        <div className="status-message status-error" style={{ marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <div className="loader"></div>
        </div>
      ) : (
        <div style={{ 
          background: 'rgba(0, 0, 0, 0.2)', 
          borderRadius: '16px', 
          border: '1px solid var(--glass-border)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Documento</th>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Razón Social</th>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Teléfono</th>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Correo</th>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Estado</th>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase', textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No hay clientes registrados en el sistema.
                  </td>
                </tr>
              ) : (
                clients.map((client: any) => (
                  <tr key={client.id_cliente} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                    
                    <td style={{ padding: '16px', fontWeight: '500' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block' }}>
                        {client.tipo_documento?.descripcion_tipodoc || `Tipo ID: ${client.fk_tipo_documento}`}
                      </span>
                      {client.documento || '-'}
                    </td>
                    
                    <td style={{ padding: '16px' }}>{client.razon_social || '-'}</td>
                    
                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                      {client.celular || client.telefono || '-'}
                    </td>
                    
                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                      {client.email || '-'}
                    </td>
                    
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: '600',
                        backgroundColor: client.estado_cliente === 'Activo' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: client.estado_cliente === 'Activo' ? '#10b981' : '#ef4444',
                        border: `1px solid ${client.estado_cliente === 'Activo' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
                      }}>
                        {client.estado_cliente || 'Desconocido'}
                      </span>
                    </td>
                    
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <button 
                        onClick={() => handleEditClient(client)}
                        className="login-btn"
                        style={{ 
                          width: 'auto', 
                          padding: '6px 16px', 
                          fontSize: '13px', 
                          background: 'rgba(59, 130, 246, 0.2)', 
                          color: '#60a5fa',
                          border: '1px solid rgba(59, 130, 246, 0.4)'
                        }}
                      >
                        Editar
                      </button>
                    </td>
                    
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
