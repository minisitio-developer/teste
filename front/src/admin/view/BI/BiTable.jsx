import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function formatNumber(n) {
  return Number(n || 0).toLocaleString('pt-BR');
}

export default function BiTable({
  columns = [],
  data = [],
  pageSize = 15,
  searchable = true,
  exportable = true,
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'Nenhum registro encontrado',
  className = '',
}) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let list = [...data];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(row =>
        columns.some(col => {
          const val = col.accessor ? col.accessor(row) : row[col.key];
          return val != null && String(val).toLowerCase().includes(q);
        })
      );
    }
    if (sortKey) {
      list.sort((a, b) => {
        let va = sortKey.includes('.') ? sortKey.split('.').reduce((o, k) => o?.[k], a) : a[sortKey];
        let vb = sortKey.includes('.') ? sortKey.split('.').reduce((o, k) => o?.[k], b) : b[sortKey];
        if (va == null) va = '';
        if (vb == null) vb = '';
        if (typeof va === 'string') va = va.toLowerCase();
        if (typeof vb === 'string') vb = vb.toLowerCase();
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [data, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
    setPage(0);
  };

  const SortIcon = ({ name }) => (
    <span className="ms-1" style={{ cursor: 'pointer', opacity: 0.4, userSelect: 'none', fontSize: '0.7rem' }}
      onClick={(e) => { e.stopPropagation(); handleSort(name); }}>
      {sortKey === name ? (sortDir === 'asc' ? '\u25B2' : '\u25BC') : '\u25B4'}
    </span>
  );

  const exportCSV = () => {
    if (!filtered.length) return;
    const headers = columns.map(c => c.label || c.key);
    const csv = [
      headers.join(';'),
      ...filtered.map(row =>
        columns.map(c => {
          const val = c.accessor ? c.accessor(row) : row[c.key];
          return val != null ? String(val).replace(/;/g, ',') : '';
        }).join(';')
      )
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'relatorio.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const exportExcel = () => {
    if (!filtered.length) return;
    const rows = filtered.map(row => {
      const obj = {};
      columns.forEach(c => {
        obj[c.label || c.key] = c.accessor ? c.accessor(row) : (row[c.key] ?? '');
      });
      return obj;
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatorio');
    XLSX.writeFile(wb, 'relatorio.xlsx');
  };

  const exportPDF = () => {
    if (!filtered.length) return;
    const doc = new jsPDF('landscape');
    const headers = columns.map(c => c.label || c.key);
    const body = filtered.map(row =>
      columns.map(c => {
        const val = c.accessor ? c.accessor(row) : row[c.key];
        return val != null ? String(val) : '';
      })
    );
    doc.text('Relatório', 14, 15);
    doc.autoTable({ head: [headers], body, startY: 20, styles: { fontSize: 7 }, headStyles: { fillColor: [13, 110, 253] } });
    doc.save('relatorio.pdf');
  };

  return (
    <div className={className}>
      {(searchable || exportable) && (
        <div className="d-flex flex-wrap gap-2 mb-3 align-items-center">
          {searchable && (
            <div className="position-relative flex-grow-1" style={{ maxWidth: 320 }}>
              <i className="fa fa-search position-absolute text-muted" style={{ left: 10, top: 9, fontSize: '0.8rem' }}></i>
              <input className="form-control form-control-sm ps-4" placeholder={searchPlaceholder}
                value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} />
            </div>
          )}
          {exportable && filtered.length > 0 && (
            <div className="d-flex gap-1 ms-auto">
              <button className="btn btn-sm btn-outline-success" onClick={exportCSV} title="Exportar CSV">
                <i className="fa fa-file-text-o me-1"></i>CSV
              </button>
              <button className="btn btn-sm btn-outline-primary" onClick={exportExcel} title="Exportar Excel">
                <i className="fa fa-table me-1"></i>Excel
              </button>
              <button className="btn btn-sm btn-outline-danger" onClick={exportPDF} title="Exportar PDF">
                <i className="fa fa-file-o me-1"></i>PDF
              </button>
            </div>
          )}
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table className="table table-hover table-sm mb-0" style={{ minWidth: columns.length * 100, borderCollapse: 'separate', borderSpacing: '0 2px' }}>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} className={col.className || ''}
                  style={{ ...(col.sortable !== false ? { cursor: 'pointer' } : {}), background: '#f8f9fc', color: '#1a1a2e', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.3, whiteSpace: 'nowrap', padding: '8px 12px', borderBottom: '2px solid #e9ecef' }}
                  onClick={() => col.sortable !== false && handleSort(col.key)}>
                  {col.label || col.key}
                  {col.sortable !== false && <SortIcon name={col.key} />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center text-muted py-4">{emptyMessage}</td>
              </tr>
            ) : (
              paged.map((row, idx) => (
                <tr key={row._key || idx} style={{ background: idx % 2 === 0 ? '#fff' : '#fafbfe', transition: 'background 0.15s' }}>
                  {columns.map(col => {
                    const val = col.accessor ? col.accessor(row) : row[col.key];
                    const display = col.render ? col.render(val, row) : (val != null ? (typeof val === 'number' ? formatNumber(val) : String(val)) : '-');
                    return (
                      <td key={col.key} className={col.className || ''}
                        style={{ padding: '6px 12px', fontSize: '0.82rem', verticalAlign: 'middle', borderBottom: '1px solid #f0f0f0' }}>
                        {display}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
          <small className="text-muted">{filtered.length} registro(s)</small>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${safePage === 0 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage(0)}><i className="fa fa-angle-double-left"></i></button>
              </li>
              <li className={`page-item ${safePage === 0 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage(s => Math.max(0, s - 1))}><i className="fa fa-angle-left"></i></button>
              </li>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(0, Math.min(safePage - 2, totalPages - 5));
                const p = start + i;
                return (
                  <li key={p} className={`page-item ${p === safePage ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPage(p)}>{p + 1}</button>
                  </li>
                );
              })}
              <li className={`page-item ${safePage === totalPages - 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage(s => Math.min(totalPages - 1, s + 1))}><i className="fa fa-angle-right"></i></button>
              </li>
              <li className={`page-item ${safePage === totalPages - 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage(totalPages - 1)}><i className="fa fa-angle-double-right"></i></button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
