import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { masterPath } from '../../../config/config';

function formatNumber(n) {
  return Number(n || 0).toLocaleString('pt-BR');
}

export default function PerfisAtividade() {
  const { data } = useOutletContext();
  const [ufList, setUfList] = useState([]);
  const [cadernoList, setCadernoList] = useState([]);
  const [atividadeList, setAtividadeList] = useState([]);

  const [selectedUfs, setSelectedUfs] = useState([]);
  const [selectedCadernos, setSelectedCadernos] = useState([]);
  const [selectedAtividades, setSelectedAtividades] = useState([]);
  const [pageSize, setPageSize] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const [ufSearch, setUfSearch] = useState('');
  const [cadernoSearch, setCadernoSearch] = useState('');
  const [atividadeSearch, setAtividadeSearch] = useState('');

  const apiUrl = masterPath.url;

  function extractArray(res) {
    if (Array.isArray(res)) return res;
    if (res?.data && Array.isArray(res.data)) return res.data;
    return [];
  }

  useEffect(() => {
    fetch(`${apiUrl}/ufs`).then(r => r.json()).then(d => setUfList(extractArray(d))).catch(() => {});
    fetch(`${apiUrl}/cadernos`).then(r => r.json()).then(d => setCadernoList(extractArray(d))).catch(() => {});
    fetch(`${apiUrl}/atividades`).then(r => r.json()).then(d => setAtividadeList(extractArray(d))).catch(() => {});
  }, []);

  const fetchData = useCallback(async (page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      selectedUfs.forEach(u => params.append('uf', u));
      selectedCadernos.forEach(c => params.append('caderno', c));
      selectedAtividades.forEach(a => params.append('atividade', a));
      params.set('limit', pageSize);
      params.set('page', page || 1);
      const res = await fetch(`${apiUrl}/admin/bi/perfis-por-atividade?${params}`);
      const json = await res.json();
      if (json.success) {
        setRows(json.rows);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedUfs, selectedCadernos, selectedAtividades, pageSize]);

  useEffect(() => {
    fetchData(1);
    setCurrentPage(1);
  }, [selectedUfs, selectedCadernos, selectedAtividades, pageSize]);

  const filteredUfs = useMemo(() => {
    const s = ufSearch.toLowerCase();
    return ufList.filter(u => !s || u.sigla_uf?.toLowerCase().includes(s) || u.nome_uf?.toLowerCase().includes(s));
  }, [ufList, ufSearch]);

  const filteredCadernos = useMemo(() => {
    const s = cadernoSearch.toLowerCase();
    return cadernoList.filter(c => !s || c.nomeCaderno?.toLowerCase().includes(s));
  }, [cadernoList, cadernoSearch]);

  const filteredAtividades = useMemo(() => {
    const s = atividadeSearch.toLowerCase();
    return atividadeList.filter(a => !s || a.nomeAmigavel?.toLowerCase().includes(s) || a.atividade?.toLowerCase().includes(s));
  }, [atividadeList, atividadeSearch]);

  const totals = useMemo(() => {
    if (!rows.length) return null;
    return {
      total: rows.reduce((s, r) => s + Number(r.total || 0), 0),
      basico: rows.reduce((s, r) => s + Number(r.basico || 0), 0),
      completo: rows.reduce((s, r) => s + Number(r.completo || 0), 0),
      capa: rows.reduce((s, r) => s + Number(r.capa || 0), 0),
    };
  }, [rows]);

  const exportar = useCallback((formato) => {
    const headers = ['UF', 'Caderno', 'Atividade', 'Total de Perfis', 'Perfis Básicos', 'Perfis Completos', 'Capa'];
    const separator = formato === 'csv' ? ';' : '\t';

    let content = headers.join(separator) + '\n';
    rows.forEach(row => {
      content += [
        row.codUf || '',
        row.nomeCaderno || '',
        row.nomeAmigavel || '',
        row.total || 0,
        row.basico || 0,
        row.completo || 0,
        row.capa || 0,
      ].join(separator) + '\n';
    });

    if (totals) {
      content += [
        'TOTAL', '', '', totals.total, totals.basico, totals.completo, totals.capa
      ].join(separator) + '\n';
    }

    const mime = formato === 'csv' ? 'text/csv' : 'application/vnd.ms-excel';
    const ext = formato === 'csv' ? 'csv' : 'xlsx';
    const blob = new Blob(["\uFEFF" + content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `perfis-por-atividade.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [rows, totals]);

  const exportPdf = useCallback(async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    doc.setFontSize(10);
    doc.text('Perfis por Atividade', 14, 10);
    autoTable(doc, {
      startY: 15,
      head: [['UF', 'Caderno', 'Atividade', 'Total', 'Básicos', 'Completos', 'Capa']],
      body: rows.map(r => [r.codUf || '', r.nomeCaderno || '', r.nomeAmigavel || '', r.total || 0, r.basico || 0, r.completo || 0, r.capa || 0]),
      foot: totals ? [['TOTAL', '', '', String(totals.total), String(totals.basico), String(totals.completo), String(totals.capa)]] : [],
      theme: 'grid',
      styles: { fontSize: 7 },
      footStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold' },
    });
    doc.save('perfis-por-atividade.pdf');
  }, [rows, totals]);

  function MultiSelect({ label, items, selected, onChange, search, onSearchChange, displayKey, valueKey }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
      function handler(e) {
        if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      }
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
      <div ref={ref} style={{ position: 'relative', minWidth: 180 }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#555', marginBottom: 2 }}>{label}</label>
        <div
          onClick={() => setOpen(!open)}
          style={{
            border: '1px solid #ccc', borderRadius: 6, padding: '5px 8px', cursor: 'pointer',
            background: '#fff', minHeight: 34, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: '0.82rem'
          }}
        >
          <span style={{ color: selected.length ? '#333' : '#999' }}>
            {selected.length ? `${selected.length} selecionado(s)` : 'Todos'}
          </span>
          <i className={`fa fa-chevron-${open ? 'up' : 'down'}`} style={{ fontSize: '0.7rem', color: '#888' }}></i>
        </div>
        {open && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1050,
            background: '#fff', border: '1px solid #ccc', borderRadius: 6, marginTop: 2,
            maxHeight: 260, overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <div style={{ padding: '4px 6px', borderBottom: '1px solid #eee' }}>
              <input
                type="text" placeholder="Buscar..." value={search}
                onChange={e => onSearchChange(e.target.value)}
                style={{
                  width: '100%', border: '1px solid #ddd', borderRadius: 4, padding: '4px 6px',
                  fontSize: '0.78rem', outline: 'none'
                }}
              />
            </div>
            <div style={{ padding: '4px 6px', borderBottom: '1px solid #eee' }}>
              <label style={{ fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <input
                  type="checkbox" checked={selected.length === items.length && items.length > 0}
                  onChange={e => {
                    if (e.target.checked && items.length) onChange(items.map(i => valueKey ? i[valueKey] : i));
                    else onChange([]);
                  }}
                />
                Selecionar todos
              </label>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {items.map((item, idx) => {
                const val = valueKey ? item[valueKey] : item;
                const lbl = displayKey ? item[displayKey] : String(item);
                return (
                  <label key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px',
                    cursor: 'pointer', fontSize: '0.78rem'
                  }}>
                    <input
                      type="checkbox" checked={selected.includes(val)}
                      onChange={e => {
                        if (e.target.checked) onChange([...selected, val]);
                        else onChange(selected.filter(v => v !== val));
                      }}
                    />
                    {lbl}
                  </label>
                );
              })}
              {items.length === 0 && (
                <div style={{ padding: '8px', color: '#999', fontSize: '0.75rem', textAlign: 'center' }}>Nenhum item</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  const totalPages = 1;

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="m-0 fw-bold" style={{ color: '#1a1a2e' }}>
            <i className="fa fa-tasks me-2" style={{ color: '#fd7e14' }}></i>Perfis por Atividade
          </h5>
          <small className="text-muted">UF + Caderno + Atividade com filtros</small>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-success" style={{ borderRadius: 6, fontSize: '0.75rem' }}
            onClick={() => exportar('csv')}>
            <i className="fa fa-file-excel-o me-1"></i>CSV
          </button>
          <button className="btn btn-sm btn-outline-success" style={{ borderRadius: 6, fontSize: '0.75rem' }}
            onClick={() => exportar('xlsx')}>
            <i className="fa fa-file-excel-o me-1"></i>XLSX
          </button>
          <button className="btn btn-sm btn-outline-danger" style={{ borderRadius: 6, fontSize: '0.75rem' }}
            onClick={exportPdf}>
            <i className="fa fa-file-pdf-o me-1"></i>PDF
          </button>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-3 mb-3 align-items-end">
        <MultiSelect
          label="UF"
          items={filteredUfs}
          selected={selectedUfs}
          onChange={setSelectedUfs}
          search={ufSearch}
          onSearchChange={setUfSearch}
          displayKey="nome_uf"
          valueKey="sigla_uf"
        />
        <MultiSelect
          label="Caderno"
          items={filteredCadernos}
          selected={selectedCadernos}
          onChange={setSelectedCadernos}
          search={cadernoSearch}
          onSearchChange={setCadernoSearch}
          displayKey="nomeCaderno"
          valueKey="nomeCaderno"
        />
        <MultiSelect
          label="Atividade"
          items={filteredAtividades}
          selected={selectedAtividades}
          onChange={setSelectedAtividades}
          search={atividadeSearch}
          onSearchChange={setAtividadeSearch}
          displayKey="nomeAmigavel"
          valueKey="atividade"
        />
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#555', marginBottom: 2 }}>Qtd por página</label>
          <select className="form-select form-select-sm" value={pageSize}
            onChange={e => setPageSize(Number(e.target.value))}
            style={{ borderRadius: 6, fontSize: '0.82rem', cursor: 'pointer' }}>
            <option value={100}>100</option>
            <option value={200}>200</option>
            <option value={500}>500</option>
          </select>
        </div>
      </div>

      <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
        <div className="card-body p-0" style={{ overflowX: 'auto' }}>
          <table className="table table-striped table-hover mb-0" style={{ fontSize: '0.82rem' }}>
            <thead style={{ background: '#1a1a2e', color: '#fff' }}>
              <tr>
                <th className="p-2">UF</th>
                <th className="p-2">Caderno</th>
                <th className="p-2">Atividade</th>
                <th className="p-2 text-end">Total de Perfis</th>
                <th className="p-2 text-end">Perfis Básicos</th>
                <th className="p-2 text-end">Perfis Completos</th>
                <th className="p-2 text-end">Capa</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center p-3">
                  <button className="buttonload"><i className="fa fa-spinner fa-spin"></i> Carregando...</button>
                </td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="text-center p-3 text-muted">Nenhum resultado. Selecione filtros.</td></tr>
              ) : rows.map((row, i) => (
                <tr key={i}>
                  <td className="p-2 fw-semibold">{row.codUf || '-'}</td>
                  <td className="p-2">{row.nomeCaderno || '-'}</td>
                  <td className="p-2">{row.nomeAmigavel || '-'}</td>
                  <td className="p-2 text-end fw-semibold">{formatNumber(row.total)}</td>
                  <td className="p-2 text-end">{formatNumber(row.basico)}</td>
                  <td className="p-2 text-end">{formatNumber(row.completo)}</td>
                  <td className="p-2 text-end">{formatNumber(row.capa)}</td>
                </tr>
              ))}
              {totals && rows.length > 0 && (
                <tr style={{ background: '#e9ecef', fontWeight: 700 }}>
                  <td className="p-2" colSpan={3} style={{ fontSize: '0.85rem' }}>TOTAL</td>
                  <td className="p-2 text-end">{formatNumber(totals.total)}</td>
                  <td className="p-2 text-end">{formatNumber(totals.basico)}</td>
                  <td className="p-2 text-end">{formatNumber(totals.completo)}</td>
                  <td className="p-2 text-end">{formatNumber(totals.capa)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
