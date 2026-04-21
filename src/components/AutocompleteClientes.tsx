import { useState, useRef, useEffect } from 'react';
import '../index.css';

interface Client {
  id_cliente: number;
  razon_social: string;
  documento?: string;
}

interface AutocompleteClientesProps {
  clients: Client[];
  value: string | number;
  onChange: (value: string | number) => void;
}

export default function AutocompleteClientes({ clients, value, onChange }: AutocompleteClientesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Initialize search term if value exists
  useEffect(() => {
    if (value) {
      const selectedClient = clients.find(c => c.id_cliente.toString() === value.toString());
      if (selectedClient) {
        setSearchTerm(`${selectedClient.razon_social} ${selectedClient.documento ? `(${selectedClient.documento})` : ''}`);
      } else {
        setSearchTerm('');
      }
    } else {
      setSearchTerm('');
    }
  }, [value, clients]);

  // Handle outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const filteredClients = clients.filter(c => {
    if (!searchTerm) return true;
    const searchLow = searchTerm.toLowerCase();
    const nameMatch = c.razon_social.toLowerCase().includes(searchLow);
    const docMatch = c.documento ? c.documento.toLowerCase().includes(searchLow) : false;
    return nameMatch || docMatch;
  });

  const handleSelect = (client: Client) => {
    setSearchTerm(`${client.razon_social} ${client.documento ? `(${client.documento})` : ''}`);
    onChange(client.id_cliente);
    setIsOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    // Reset selection if they type
    onChange('');
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        className="input-field"
        placeholder="Buscar cliente por nombre o documento..."
        value={searchTerm}
        onChange={handleChange}
        onFocus={() => setIsOpen(true)}
      />
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'rgb(30, 41, 59)', /* slate-800 from index.css colors */
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          marginTop: '4px',
          maxHeight: '200px',
          overflowY: 'auto',
          zIndex: 50,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
        }}>
          {filteredClients.length > 0 ? (
            filteredClients.map(client => (
              <div
                key={client.id_cliente}
                onClick={() => handleSelect(client)}
                style={{
                  padding: '10px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  color: '#f8fafc'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {client.razon_social} {client.documento ? <span style={{ color: '#94a3b8', fontSize: '0.9em' }}>({client.documento})</span> : ''}
              </div>
            ))
          ) : (
            <div style={{ padding: '10px 16px', color: '#94a3b8', fontStyle: 'italic' }}>
              No se encontraron clientes...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
