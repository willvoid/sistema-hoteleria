import React, { ReactNode } from 'react';

export interface Column<T = any> {
  header: string;
  accessor?: keyof T | string;
  render?: (item: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
  keyExtractor: (item: T) => string | number;
}

export function DataTable<T>({ 
  data, 
  columns, 
  emptyMessage = 'No hay datos disponibles.', 
  keyExtractor 
}: DataTableProps<T>) {
  return (
    <div style={{ 
      background: 'rgba(0, 0, 0, 0.2)', 
      borderRadius: '16px', 
      border: '1px solid var(--glass-border)',
      overflow: 'hidden',
      width: '100%'
    }}>
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)' }}>
              {columns.map((col, index) => (
                <th key={index} style={{ 
                  padding: '16px', 
                  color: 'var(--text-secondary)', 
                  fontWeight: '600', 
                  fontSize: '13px', 
                  textTransform: 'uppercase',
                  textAlign: col.align || 'left',
                  whiteSpace: 'nowrap'
                }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={keyExtractor(item)} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                  {columns.map((col, index) => (
                    <td key={index} style={{ padding: '16px', textAlign: col.align || 'left' }}>
                      {col.render ? col.render(item) : (col.accessor ? (item as any)[col.accessor] || '-' : '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
