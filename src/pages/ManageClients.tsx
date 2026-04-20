import { useEffect, useState } from 'react';
import { ClientService } from '../services/clientService';
import CreateClient from './CreateClient';
import { DataTable, Column } from '../components/DataTable';
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

  const columns: Column<any>[] = [
    {
      header: 'Documento',
      render: (client: any) => (
        <div style={{ fontWeight: '500' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block' }}>
            {client.tipo_documento?.descripcion_tipodoc || `Tipo ID: ${client.fk_tipo_documento}`}
          </span>
          {client.documento || '-'}
        </div>
      )
    },
    {
      header: 'Razón Social',
      accessor: 'razon_social'
    },
    {
      header: 'Teléfono',
      render: (client: any) => (
        <span style={{ color: 'var(--text-secondary)' }}>
          {client.celular || client.telefono || '-'}
        </span>
      )
    },
    {
      header: 'Correo',
      render: (client: any) => (
        <span style={{ color: 'var(--text-secondary)' }}>
          {client.email || '-'}
        </span>
      )
    },
    {
      header: 'Estado',
      render: (client: any) => (
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
      )
    },
    {
      header: 'Acciones',
      align: 'center',
      render: (client: any) => (
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
      )
    }
  ];

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
        <DataTable 
          data={clients} 
          columns={columns} 
          emptyMessage="No hay clientes registrados en el sistema."
          keyExtractor={(item) => item.id_cliente}
        />
      )}
    </div>
  );
}
