import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import bcrypt from 'bcryptjs';

interface CreateUserProps {
  onCancel: () => void;
  onCreated?: () => void;
}

export default function CreateUser({ onCancel, onCreated }: CreateUserProps) {
  const [formData, setFormData] = useState({
    documento: '',
    nombre: '',
    correo: '',
    telefono: '',
    usuario: '',
    clave: '',
    confirmarClave: '',
    fk_tipo_doc: '',
    fk_cargo: ''
  });

  const [tiposDoc, setTiposDoc] = useState<any[]>([]);
  const [cargos, setCargos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string, currentData: any) => {
    let errorMsg = '';
    
    // Validaciones de obligatoriedad básicas
    if (['nombre', 'correo', 'documento', 'usuario', 'clave', 'confirmarClave'].includes(name) && !value) {
      return "Este campo es obligatorio.";
    }

    switch (name) {
      case 'clave':
        if (value.length > 0 && value.length < 8) {
          errorMsg = "La contraseña debe tener al menos 8 caracteres.";
        }
        break;
      case 'confirmarClave':
        if (value && value !== currentData.clave) {
          errorMsg = "Las contraseñas no coinciden.";
        }
        break;
      case 'documento':
        if (value) {
          const tipoDoc = String(currentData.fk_tipo_doc);
          if (tipoDoc === '2') {
            if (!value.includes('-')) {
              errorMsg = "El RUC (2) debe contener un guión (-).";
            } else if (value.includes(' ')) {
              errorMsg = "El RUC (2) no debe contener espacios.";
            }
          } else if (tipoDoc === '1') {
            if (value.includes(' ')) {
              errorMsg = "El documento no debe contener espacios.";
            } else if (value.includes('-')) {
              errorMsg = "El documento no debe contener guiones (-).";
            }
          }
        }
        break;
      default:
        break;
    }
    return errorMsg;
  };

  useEffect(() => {
    // Fetch Tipos de Documento and Cargos
    const fetchSelectData = async () => {
      try {
        const [docRes, cargoRes] = await Promise.all([
          supabase.from('tipo_documento').select('cod_tipodoc, descripcion_tipodoc'),
          supabase.from('cargo').select('id_cargo, descripcion_cargo')
        ]);
        
        if (docRes.error) throw docRes.error;
        if (cargoRes.error) throw cargoRes.error;

        setTiposDoc(docRes.data || []);
        setCargos(cargoRes.data || []);

        if (docRes.data?.length > 0 && cargoRes.data?.length > 0) {
          setFormData(prev => ({
            ...prev,
            fk_tipo_doc: docRes.data[0].cod_tipodoc,
            fk_cargo: cargoRes.data[0].id_cargo
          }));
        }
      } catch (err) {
        console.error("Error fetching select options:", err);
        setError("Error al cargar opciones del formulario.");
      }
    };

    fetchSelectData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      const errorMsg = validateField(name, value, newData);
      
      setFieldErrors(prevErrors => {
        const updatedErrors = { ...prevErrors, [name]: errorMsg };
        
        if (name === 'fk_tipo_doc' && newData.documento) {
          updatedErrors.documento = validateField('documento', newData.documento, newData);
        }
        
        if (name === 'clave' && newData.confirmarClave) {
          updatedErrors.confirmarClave = validateField('confirmarClave', newData.confirmarClave, newData);
        }
        
        return updatedErrors;
      });

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validar todos los campos antes de enviar
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach(key => {
      const typedKey = key as keyof typeof formData;
      const err = validateField(typedKey, formData[typedKey], formData);
      if (err) newErrors[key] = err;
    });
    setFieldErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(err => err !== '');
    if (hasErrors) {
      setError("Por favor corrige los errores en el formulario.");
      setLoading(false);
      return;
    }

    try {

      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('usuario')
        .select('id_usuario')
        .or(`correo.eq.${formData.correo},usuario.eq.${formData.usuario}`)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existingUser) {
        throw new Error("El correo o el nombre de usuario ya están en uso.");
      }

      // Encrypt password using bcryptjs
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(formData.clave, salt);

      // Prepare data for insertion
      const newUser = {
        documento: formData.documento,
        nombre: formData.nombre,
        correo: formData.correo,
        telefono: formData.telefono,
        usuario: formData.usuario,
        clave: hash, // Storing encrypted password
        fk_tipo_doc: parseInt(formData.fk_tipo_doc),
        fk_cargo: parseInt(formData.fk_cargo)
      };

      const { error: insertError } = await supabase
        .from('usuario')
        .insert([newUser]);

      if (insertError) throw insertError;

      setSuccess("¡Usuario creado exitosamente!");
      setTimeout(() => {
        if (onCreated) onCreated();
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al crear el usuario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="login-header" style={{ marginBottom: "20px" }}>
        <h2 className="login-title">Crear Usuario</h2>
        <p className="login-subtitle">Registra un nuevo usuario en el sistema</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="input-group">
            <label htmlFor="nombre">Nombre Completo</label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              className="input-field"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
            {fieldErrors.nombre && <span className="field-error">{fieldErrors.nombre}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="correo">Correo Electrónico</label>
            <input
              id="correo"
              name="correo"
              type="email"
              className="input-field"
              value={formData.correo}
              onChange={handleChange}
              required
            />
            {fieldErrors.correo && <span className="field-error">{fieldErrors.correo}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="fk_tipo_doc">Tipo de Documento</label>
            <select
              id="fk_tipo_doc"
              name="fk_tipo_doc"
              className="input-field"
              value={formData.fk_tipo_doc}
              onChange={handleChange}
              required
              style={{ appearance: 'none' }}
            >
              {tiposDoc.map(doc => (
                <option key={doc.cod_tipodoc} value={doc.cod_tipodoc} style={{ color: "black" }}>
                  {doc.descripcion_tipodoc}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="documento">Nº de Documento</label>
            <input
              id="documento"
              name="documento"
              type="text"
              className="input-field"
              value={formData.documento}
              onChange={handleChange}
              required
            />
            {fieldErrors.documento && <span className="field-error">{fieldErrors.documento}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="telefono">Teléfono</label>
            <input
              id="telefono"
              name="telefono"
              type="tel"
              className="input-field"
              value={formData.telefono}
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label htmlFor="fk_cargo">Cargo</label>
            <select
              id="fk_cargo"
              name="fk_cargo"
              className="input-field"
              value={formData.fk_cargo}
              onChange={handleChange}
              required
              style={{ appearance: 'none' }}
            >
              {cargos.map(cargo => (
                <option key={cargo.id_cargo} value={cargo.id_cargo} style={{ color: "black" }}>
                  {cargo.descripcion_cargo}
                </option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label htmlFor="usuario">Nombre de Usuario</label>
            <input
              id="usuario"
              name="usuario"
              type="text"
              className="input-field"
              value={formData.usuario}
              onChange={handleChange}
              required
            />
            {fieldErrors.usuario && <span className="field-error">{fieldErrors.usuario}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="clave">Contraseña</label>
            <input
              id="clave"
              name="clave"
              type="password"
              className="input-field"
              value={formData.clave}
              onChange={handleChange}
              required
            />
            {fieldErrors.clave && <span className="field-error">{fieldErrors.clave}</span>}
          </div>

          <div className="input-group">
            <label htmlFor="confirmarClave">Confirmar Contraseña</label>
            <input
              id="confirmarClave"
              name="confirmarClave"
              type="password"
              className="input-field"
              value={formData.confirmarClave}
              onChange={handleChange}
              required
            />
            {fieldErrors.confirmarClave && <span className="field-error">{fieldErrors.confirmarClave}</span>}
          </div>
        </div>

        <button type="submit" className="login-btn" disabled={loading} style={{ marginTop: '10px' }}>
          {loading ? (
            <>
              <div className="loader"></div>
              <span>Guardando...</span>
            </>
          ) : (
            'Crear Usuario'
          )}
        </button>
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

      <button onClick={onCancel} className="link-btn">
        Volver al inicio de sesión
      </button>
    </div>
  );
}
