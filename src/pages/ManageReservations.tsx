import { useEffect, useState } from 'react';
import { ReservationService } from '../services/reservationService';
import { DataTable, Column } from '../components/DataTable';
import '../index.css';

interface ManageReservationsProps {
  onBack: () => void;
  onNewReservation: () => void;
}

export default function ManageReservations({ onBack, onNewReservation }: ManageReservationsProps) {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const data = await ReservationService.getReservations();
      setReservations(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las reservas.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'confirmada':
      case 'check-in':
        return '#10b981'; // Green
      case 'pendiente':
        return '#f59e0b'; // Yellow
      case 'cancelada':
        return '#ef4444'; // Red
      default:
        return '#cbd5e1'; // Gray
    }
  };

  const columns: Column<any>[] = [
    { header: 'Código', render: (res: any) => <span style={{ fontWeight: '500' }}>{res.codigo_reserva || '-'}</span> },
    {
      header: 'Cliente',
      render: (res: any) => res.clientes?.razon_social || `ID: ${res.fk_cliente}`
    },
    {
      header: 'Entrada',
      render: (res: any) => <span style={{ color: 'var(--text-secondary)' }}>{res.fecha_entrada ? new Date(res.fecha_entrada).toLocaleDateString() : '-'}</span>
    },
    {
      header: 'Salida',
      render: (res: any) => <span style={{ color: 'var(--text-secondary)' }}>{res.fecha_salida ? new Date(res.fecha_salida).toLocaleDateString() : '-'}</span>
    },
    {
      header: 'Estado',
      render: (res: any) => (
        <span style={{ 
          padding: '4px 10px', 
          borderRadius: '20px', 
          fontSize: '12px', 
          fontWeight: '600',
          backgroundColor: `${getStatusColor(res.estado)}20`,
          color: getStatusColor(res.estado),
          border: `1px solid ${getStatusColor(res.estado)}40`
        }}>
          {res.estado || 'No especificado'}
        </span>
      )
    },
    { 
      header: 'Origen', 
      render: (res: any) => <span style={{ color: 'var(--text-secondary)' }}>{res.origen || '-'}</span> 
    },
    {
      header: 'Total Est.',
      render: (res: any) => <span style={{ fontWeight: '600' }}>{res.total_estimado ? `$${Number(res.total_estimado).toLocaleString()}` : '-'}</span>
    }
  ];

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ marginBottom: '8px', fontSize: '28px', textAlign: 'left' }}>Gestión de Reservas</h1>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'left', margin: 0 }}>Administra las reservas del hotel</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={onBack} className="login-btn" style={{ width: 'auto', padding: '10px 20px', backgroundColor: 'transparent', border: '1px solid var(--glass-border)' }}>
            Volver
          </button>
          <button onClick={onNewReservation} className="login-btn" style={{ width: 'auto', padding: '10px 20px' }}>
            + Nueva Reserva
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
          data={reservations} 
          columns={columns} 
          emptyMessage="No hay reservas registradas."
          keyExtractor={(item) => item.id_reserva}
        />
      )}
    </div>
  );
}
