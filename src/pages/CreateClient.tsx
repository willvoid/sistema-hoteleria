import React, { useState, useEffect } from 'react';
import { ClientService } from '../services/clientService';
import '../index.css';

interface CreateClientProps {
  onCancel: () => void;
  onCreated?: () => void;
  clientToEdit?: any | null;
}

export default function CreateClient({ onCancel, onCreated, clientToEdit }: CreateClientProps) {
  const isEditing = !!clientToEdit;

  // Main form data
  const [formData, setFormData] = useState({
    razon_social: clientToEdit?.razon_social || '',
    nombre_fantasia: clientToEdit?.nombre_fantasia || '',
    documento: clientToEdit?.documento || '',
    telefono: clientToEdit?.telefono || '',
    celular: clientToEdit?.celular || '',
    direccion: clientToEdit?.direccion || '',
    nro_casa: clientToEdit?.nro_casa?.toString() || '',
    email: clientToEdit?.email || '',
    es_proveedor_del_estado: clientToEdit?.es_proveedor_del_estado || false,
    estado_cliente: clientToEdit?.estado_cliente || 'Activo',
    fk_tipo_operacion: clientToEdit?.fk_tipo_operacion?.toString() || '',
    fk_tipo_documento: clientToEdit?.fk_tipo_documento?.toString() || '',
    fk_tipo_contribuyente: clientToEdit?.fk_tipo_contribuyente?.toString() || '',
    fk_barrios: clientToEdit?.fk_barrios?.toString() || '',
  });

  // Location temporary state for cascading dropdowns
  const [locState, setLocState] = useState({
    pais: '',
    departamento: '',
    distrito: '',
    ciudad: '',
  });

  // Reference Catalogs
  const [catTipoDoc, setCatTipoDoc] = useState<any[]>([]);
  const [catTipoCont, setCatTipoCont] = useState<any[]>([]);
  const [catTipoOp, setCatTipoOp] = useState<any[]>([]);

  // Location Catalogs
  const [catPaises, setCatPaises] = useState<any[]>([]);
  const [catDepartamentos, setCatDepartamentos] = useState<any[]>([]);
  const [catDistritos, setCatDistritos] = useState<any[]>([]);
  const [catCiudades, setCatCiudades] = useState<any[]>([]);
  const [catBarrios, setCatBarrios] = useState<any[]>([]);

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initial Fetch Setup
  useEffect(() => {
    const fetchInitials = async () => {
      try {
        const [docs, conts, ops, paises] = await Promise.all([
          ClientService.getTipoDocumento(),
          ClientService.getTipoContribuyente(),
          ClientService.getTipoOperacion(),
          ClientService.getPaises(),
        ]);
        setCatTipoDoc(docs);
        setCatTipoCont(conts);
        setCatTipoOp(ops);
        setCatPaises(paises);
      } catch (err: any) {
        console.error("Error fetching initials:", err);
        setError("Error al conectar con la base de datos para obtener referenciales.");
      }
    };
    fetchInitials();
  }, []);

  // Cascading Effects
  useEffect(() => {
    if (locState.pais) {
      ClientService.getDepartamentos(Number(locState.pais)).then(setCatDepartamentos);
      // Reset child selections
      setCatDistritos([]); setCatCiudades([]); setCatBarrios([]);
      setLocState(p => ({ ...p, departamento: '', distrito: '', ciudad: '' }));
      if (!isEditing || locState.pais !== '') {
        setFormData(p => ({ ...p, fk_barrios: '' }));
      }
    }
  }, [locState.pais]);

  useEffect(() => {
    if (locState.departamento) {
      ClientService.getDistritos(Number(locState.departamento)).then(setCatDistritos);
      setCatCiudades([]); setCatBarrios([]);
      setLocState(p => ({ ...p, distrito: '', ciudad: '' }));
      setFormData(p => ({ ...p, fk_barrios: '' }));
    }
  }, [locState.departamento]);

  useEffect(() => {
    if (locState.distrito) {
      ClientService.getCiudades(Number(locState.distrito)).then(setCatCiudades);
      setCatBarrios([]);
      setLocState(p => ({ ...p, ciudad: '' }));
      setFormData(p => ({ ...p, fk_barrios: '' }));
    }
  }, [locState.distrito]);

  useEffect(() => {
    if (locState.ciudad) {
      ClientService.getBarrios(Number(locState.ciudad)).then(setCatBarrios);
      setFormData(p => ({ ...p, fk_barrios: '' }));
    }
  }, [locState.ciudad]);

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : false;

    setFormData(prev => ({
      ...prev,
      [name]: isCheckbox ? checked : value
    }));
  };

  const handleLocChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocState(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Basic Validation
    if (!formData.fk_tipo_documento || !formData.documento || !formData.razon_social) {
      setError("Documento, Tipo y Razón Social son obligatorios.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        nro_casa: formData.nro_casa ? parseInt(formData.nro_casa) : null,
        fk_tipo_documento: parseInt(formData.fk_tipo_documento),
        fk_tipo_contribuyente: formData.fk_tipo_contribuyente ? parseInt(formData.fk_tipo_contribuyente) : null,
        fk_tipo_operacion: formData.fk_tipo_operacion ? parseInt(formData.fk_tipo_operacion) : null,
        fk_barrios: formData.fk_barrios ? parseInt(formData.fk_barrios) : null,
      };

      if (isEditing) {
        await ClientService.updateClient(clientToEdit.id_cliente, payload);
        setSuccess("¡Cliente actualizado exitosamente!");
      } else {
        await ClientService.createClient(payload);
        setSuccess("¡Cliente registrado exitosamente!");
      }
      
      setTimeout(() => {
        if (onCreated) onCreated();
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al intentar guardar el cliente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="login-header" style={{ marginBottom: "20px" }}>
        <h2 className="login-title">{isEditing ? 'Editar Cliente' : 'Registrar Cliente'}</h2>
        <p className="login-subtitle">
          {isEditing 
            ? 'Actualiza los datos del cliente/huésped.' 
            : 'Añade un nuevo cliente/huésped al sistema, completando sus referencias.'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* Sección: Datos Principales */}
        <h3 className="section-title">Datos Principales</h3>
        <div className="form-grid">
          <div className="input-group">
            <label htmlFor="razon_social">Razón Social / Nombre Completo *</label>
            <input id="razon_social" name="razon_social" type="text" className="input-field" value={formData.razon_social} onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label htmlFor="nombre_fantasia">Nombre de Fantasía</label>
            <input id="nombre_fantasia" name="nombre_fantasia" type="text" className="input-field" value={formData.nombre_fantasia} onChange={handleChange} />
          </div>

          <div className="input-group">
            <label htmlFor="fk_tipo_documento">Tipo de Doc. *</label>
            <select id="fk_tipo_documento" name="fk_tipo_documento" className="input-field" value={formData.fk_tipo_documento} onChange={handleChange} required>
              <option value="">Selecciona...</option>
              {catTipoDoc.map(doc => (
                <option key={doc.cod_tipodoc} value={doc.cod_tipodoc} style={{ color: "black" }}>{doc.descripcion_tipodoc}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="documento">Nº Documento *</label>
            <input id="documento" name="documento" type="text" className="input-field" value={formData.documento} onChange={handleChange} required />
          </div>
        </div>

        <div className="divider" style={{height:'1px', background: 'rgba(255,255,255,0.1)', margin: '20px 0'}}></div>

        {/* Sección: Información Fiscal & Tipos */}
        <h3 className="section-title">Información Fiscal</h3>
        <div className="form-grid">
          <div className="input-group">
            <label htmlFor="fk_tipo_contribuyente">Tipo de Contribuyente</label>
            <select id="fk_tipo_contribuyente" name="fk_tipo_contribuyente" className="input-field" value={formData.fk_tipo_contribuyente} onChange={handleChange}>
              <option value="">Ninguno</option>
              {catTipoCont.map(cont => (
                <option key={cont.id_tipo_contribuyente} value={cont.id_tipo_contribuyente} style={{ color: "black" }}>{cont.descripcion}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="fk_tipo_operacion">Tipo de Operación</label>
            <select id="fk_tipo_operacion" name="fk_tipo_operacion" className="input-field" value={formData.fk_tipo_operacion} onChange={handleChange}>
              <option value="">Ninguna</option>
              {catTipoOp.map(op => (
                <option key={op.id_tipo_operacion} value={op.id_tipo_operacion} style={{ color: "black" }}>{op.codigo_tipo_op}</option>
              ))}
            </select>
          </div>

          <div className="input-group checkbox-group" style={{ display: 'flex', alignItems: 'center', height: '100%', gap: '10px', paddingTop: '20px' }}>
            <input id="es_proveedor_del_estado" name="es_proveedor_del_estado" type="checkbox" checked={formData.es_proveedor_del_estado} onChange={handleChange} style={{ width: '20px', height: '20px' }} />
            <label htmlFor="es_proveedor_del_estado" style={{ margin: 0, cursor: 'pointer' }}>Es proveedor del Estado</label>
          </div>
        </div>

        <div className="divider" style={{height:'1px', background: 'rgba(255,255,255,0.1)', margin: '20px 0'}}></div>

        {/* Sección: Contacto */}
        <h3 className="section-title">Contacto</h3>
        <div className="form-grid">
          <div className="input-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input id="email" name="email" type="email" className="input-field" value={formData.email} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label htmlFor="telefono">Teléfono Fijo</label>
            <input id="telefono" name="telefono" type="tel" className="input-field" value={formData.telefono} onChange={handleChange} />
          </div>
          <div className="input-group">
            <label htmlFor="celular">Celular</label>
            <input id="celular" name="celular" type="tel" className="input-field" value={formData.celular} onChange={handleChange} />
          </div>
        </div>

        <div className="divider" style={{height:'1px', background: 'rgba(255,255,255,0.1)', margin: '20px 0'}}></div>

        {/* Sección: Ubicación (Cascada) */}
        <h3 className="section-title">Ubicación Geo-espacial</h3>
        <p style={{fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px'}}>
          {isEditing && formData.fk_barrios 
            ? "El cliente ya tiene un barrio asignado. Solo modifica estos campos si deseas cambiar la ubicación actual."
            : "Selecciona la nueva ubicación del cliente."}
        </p>

        <div className="form-grid">
          <div className="input-group">
            <label htmlFor="pais">País</label>
            <select id="pais" name="pais" className="input-field" value={locState.pais} onChange={handleLocChange}>
              <option value="">Selecciona País...</option>
              {catPaises.map(p => (
                <option key={p.id_pais} value={p.id_pais} style={{ color: "black" }}>{p.pais}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="departamento">Departamento</label>
            <select id="departamento" name="departamento" className="input-field" value={locState.departamento} onChange={handleLocChange} disabled={!locState.pais}>
              <option value="">Selecciona Depto...</option>
              {catDepartamentos.map(d => (
                <option key={d.cod_depto} value={d.cod_depto} style={{ color: "black" }}>{d.nombre_depto}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="distrito">Distrito</label>
            <select id="distrito" name="distrito" className="input-field" value={locState.distrito} onChange={handleLocChange} disabled={!locState.departamento}>
              <option value="">Selecciona Distrito...</option>
              {catDistritos.map(d => (
                <option key={d.cod_distrito} value={d.cod_distrito} style={{ color: "black" }}>{d.nombre_distrito}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="ciudad">Ciudad</label>
            <select id="ciudad" name="ciudad" className="input-field" value={locState.ciudad} onChange={handleLocChange} disabled={!locState.distrito}>
              <option value="">Selecciona Ciudad...</option>
              {catCiudades.map(c => (
                <option key={c.cod_ciudades} value={c.cod_ciudades} style={{ color: "black" }}>{c.nombre_ciudad}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="fk_barrios">Barrio Final</label>
            <select id="fk_barrios" name="fk_barrios" className="input-field" value={formData.fk_barrios} onChange={handleChange} disabled={!locState.ciudad && !isEditing}>
              <option value="">Selecciona Barrio...</option>
              {/* Añadimos el barrio actual visible si estamos editando y no hemos tocado la cascada */}
              {isEditing && formData.fk_barrios && !locState.ciudad && (
                 <option value={formData.fk_barrios} style={{ color: "black" }}>Mantener barrio original (ID: {formData.fk_barrios})</option>
              )}
              {catBarrios.map(b => (
                <option key={b.cod_barrio} value={b.cod_barrio} style={{ color: "black" }}>{b.nombre_barrio}</option>
              ))}
            </select>
          </div>

          <div className="input-group span-2">
            <label htmlFor="direccion">Dirección Específica</label>
            <input id="direccion" name="direccion" type="text" className="input-field" value={formData.direccion} onChange={handleChange} placeholder="Calle, referencias, etc." />
          </div>

          <div className="input-group">
            <label htmlFor="nro_casa">Nª de Casa</label>
            <input id="nro_casa" name="nro_casa" type="number" className="input-field" value={formData.nro_casa} onChange={handleChange} />
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
              isEditing ? 'Guardar Cambios' : 'Completar Registro'
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
