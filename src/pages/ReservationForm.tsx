import { useState, useEffect } from 'react';
import { ReservationService } from '../services/reservationService';
import AutocompleteClientes from '../components/AutocompleteClientes';
import '../index.css';

interface ReservationFormProps {
  onCancel: () => void;
  onCreated: () => void;
  currentUser: any;
  reservationToEdit?: any;
}

export default function ReservationForm({ onCancel, onCreated, currentUser, reservationToEdit }: ReservationFormProps) {
  const [formData, setFormData] = useState({
    codigo_reserva: '',
    fecha_entrada: '',
    fecha_salida: '',
    estado: 'Pendiente',
    fk_cliente: '',
    origen: 'Presencial',
    observaciones: '',
    total_estimado: ''
  });

  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const filterStates = ['Pendiente', 'Confirmada', 'Check-in', 'Check-out', 'Cancelada'];
  const origins = ['Presencial', 'Web', 'Teléfono', 'Booking', 'Airbnb', 'Otro'];

  useEffect(() => {
    if (reservationToEdit) {
      setFormData({
        codigo_reserva: reservationToEdit.codigo_reserva || '',
        fecha_entrada: reservationToEdit.fecha_entrada ? new Date(reservationToEdit.fecha_entrada).toISOString().split('T')[0] : '',
        fecha_salida: reservationToEdit.fecha_salida ? new Date(reservationToEdit.fecha_salida).toISOString().split('T')[0] : '',
        estado: reservationToEdit.estado || 'Pendiente',
        fk_cliente: reservationToEdit.fk_cliente?.toString() || '',
        origen: reservationToEdit.origen || 'Presencial',
        observaciones: reservationToEdit.observaciones || '',
        total_estimado: reservationToEdit.total_estimado?.toString() || ''
      });
    }
  }, [reservationToEdit]);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const clientList = await ReservationService.getClientsList();
        setClients(clientList);
      } catch (err: any) {
        console.error("Error al cargar clientes", err);
      }
    };
    loadClients();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!formData.fk_cliente || !formData.fecha_entrada || !formData.fecha_salida) {
      setError("Cliente y fechas son obligatorios.");
      setLoading(false);
      return;
    }

    try {
      if (reservationToEdit) {
        const updatePayload = {
          codigo_reserva: formData.codigo_reserva,
          fecha_entrada: formData.fecha_entrada,
          fecha_salida: formData.fecha_salida,
          estado: formData.estado,
          fk_cliente: parseInt(formData.fk_cliente),
          origen: formData.origen,
          observaciones: formData.observaciones,
          total_estimado: formData.total_estimado ? parseFloat(formData.total_estimado) : null
        };
        await ReservationService.updateReservation(reservationToEdit.id_reserva, updatePayload);
        setSuccess("¡Reserva actualizada exitosamente!");
      } else {
        const payload = {
          ...formData,
          fk_cliente: parseInt(formData.fk_cliente),
          fk_usuario: currentUser?.id_usuario || currentUser?.id,
          total_estimado: formData.total_estimado ? parseFloat(formData.total_estimado) : null
        };
        await ReservationService.createReservation(payload);
        setSuccess("¡Reserva registrada exitosamente!");
      }

      setTimeout(() => {
        onCreated();
      }, 1500);

    } catch (err: any) {
      setError(err.message || "Error al registrar la reserva.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <div className="login-header" style={{ marginBottom: "20px" }}>
        <h2 className="login-title">{reservationToEdit ? 'Editar Reserva' : 'Nueva Reserva'}</h2>
        <p className="login-subtitle">
          {reservationToEdit ? 'Modifica los detalles de la reserva.' : 'Ingresa los detalles de la nueva reserva.'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          
          <div className="input-group">
            <label htmlFor="codigo_reserva">Código de Reserva</label>
            <input 
              id="codigo_reserva" 
              name="codigo_reserva" 
              type="text" 
              className="input-field" 
              value={formData.codigo_reserva} 
              onChange={handleChange} 
              placeholder="Ej. RES-2026-001" 
            />
          </div>

          <div className="input-group">
            <label htmlFor="fk_cliente">Cliente / Huésped *</label>
            <AutocompleteClientes 
              clients={clients} 
              value={formData.fk_cliente} 
              onChange={(value) => setFormData(prev => ({ ...prev, fk_cliente: value.toString() }))}
            />
          </div>

          <div className="input-group">
            <label htmlFor="fecha_entrada">Fecha de Entrada *</label>
            <input 
              id="fecha_entrada" 
              name="fecha_entrada" 
              type="date" 
              className="input-field" 
              value={formData.fecha_entrada} 
              onChange={handleChange} 
              required 
              style={{ colorScheme: 'dark' }}
            />
          </div>

          <div className="input-group">
            <label htmlFor="fecha_salida">Fecha de Salida *</label>
            <input 
              id="fecha_salida" 
              name="fecha_salida" 
              type="date" 
              className="input-field" 
              value={formData.fecha_salida} 
              onChange={handleChange} 
              required 
              style={{ colorScheme: 'dark' }}
            />
          </div>

          <div className="input-group">
            <label htmlFor="estado">Estado *</label>
            <select 
              id="estado" 
              name="estado" 
              className="input-field" 
              value={formData.estado} 
              onChange={handleChange} 
              required
            >
              {filterStates.map(st => (
                <option key={st} value={st} style={{ color: "black" }}>{st}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="origen">Origen de la Reserva *</label>
            <select 
              id="origen" 
              name="origen" 
              className="input-field" 
              value={formData.origen} 
              onChange={handleChange} 
              required
            >
              {origins.map(orig => (
                <option key={orig} value={orig} style={{ color: "black" }}>{orig}</option>
              ))}
            </select>
          </div>

          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label htmlFor="total_estimado">Total Estimado ($)</label>
            <input 
              id="total_estimado" 
              name="total_estimado" 
              type="number" 
              step="0.01"
              className="input-field" 
              value={formData.total_estimado} 
              onChange={handleChange} 
              placeholder="0.00" 
            />
          </div>

          <div className="input-group" style={{ gridColumn: 'span 2' }}>
            <label htmlFor="observaciones">Observaciones</label>
            <textarea 
              id="observaciones" 
              name="observaciones" 
              className="input-field" 
              rows={3}
              value={formData.observaciones} 
              onChange={handleChange} 
              placeholder="Detalles adicionales, peticiones especiales, etc." 
              style={{ resize: 'vertical' }}
            />
          </div>

        </div>

        <div style={{ marginTop: '30px' }}>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <>
                <div className="loader"></div>
                <span>Guardando...</span>
              </>
            ) : (
              reservationToEdit ? 'Actualizar Reserva' : 'Crear Reserva'
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="status-message status-error">
          {error}
        </div>
      )}
      {success && (
        <div className="status-message status-success">
          {success}
        </div>
      )}

      <button onClick={onCancel} className="link-btn" style={{ marginTop: '20px' }}>
        Cancelar y volver
      </button>
    </div>
  );
}
