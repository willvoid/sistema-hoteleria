import { useEffect, useState } from 'react';
import { ReservationService } from '../services/reservationService';
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
        <div style={{ 
          background: 'rgba(0, 0, 0, 0.2)', 
          borderRadius: '16px', 
          border: '1px solid var(--glass-border)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Código</th>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Cliente</th>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Entrada</th>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Salida</th>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Estado</th>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Origen</th>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '13px', textTransform: 'uppercase' }}>Total Est.</th>
              </tr>
            </thead>
            <tbody>
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No hay reservas registradas.
                  </td>
                </tr>
              ) : (
                reservations.map((res: any) => (
                  <tr key={res.id_reserva} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '16px', fontWeight: '500' }}>{res.codigo_reserva || '-'}</td>
                    {/* Fallback en caso de que el join no funcione y solo tengamos fk_cliente, o mostramos el objeto clientes */}
                    <td style={{ padding: '16px' }}>{res.clientes?.razon_social || `ID: ${res.fk_cliente}`}</td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{res.fecha_entrada ? new Date(res.fecha_entrada).toLocaleDateString() : '-'}</td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{res.fecha_salida ? new Date(res.fecha_salida).toLocaleDateString() : '-'}</td>
                    <td style={{ padding: '16px' }}>
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
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{res.origen || '-'}</td>
                    <td style={{ padding: '16px', fontWeight: '600' }}>
                      {res.total_estimado ? `$${Number(res.total_estimado).toLocaleString()}` : '-'}
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
