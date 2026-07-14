import React, { useMemo, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';

function formatNumber(n) {
  return Number(n || 0).toLocaleString('pt-BR');
}

export default function CadernosPage() {
  const { data } = useOutletContext();
  const [selectedUf, setSelectedUf] = useState('');

  const ufList = useMemo(() => {
    if (!data?.cadernosPorUf) return [];
    return [...new Set(data.cadernosPorUf.map(r => r.UF))].sort();
  }, [data]);

  const rows = useMemo(() => {
    if (!data?.cadernosPorUf) return [];
    if (!selectedUf) return data.cadernosPorUf;
    return data.cadernosPorUf.filter(r => r.UF === selectedUf);
  }, [data, selectedUf]);

  const totals = useMemo(() => {
    if (!rows.length) return null;
    return {
      total: rows.reduce((s, r) => s + Number(r.total || 0), 0),
      basico: rows.reduce((s, r) => s + Number(r.basico || 0), 0),
      completo: rows.reduce((s, r) => s + Number(r.completo || 0), 0),
    };
  }, [rows]);

  const exportar = useCallback((formato) => {
    const headers = ['UF', 'Caderno', 'Total de Perfis', 'Perfis Básicos', 'Perfis Completos'];
    const sep = formato === 'csv' ? ';' : '\t';
    let content = headers.join(sep) + '\n';
    rows.forEach(r => {
      content += [r.UF || '-', r.Caderno || '-', r.total || 0, r.basico || 0, r.completo || 0].join(sep) + '\n';
    });
    if (totals) {
      content += ['TOTAL', '', totals.total, totals.basico, totals.completo].join(sep) + '\n';
    }
    const blob = new Blob(["\uFEFF" + content], { type: `text/${formato === 'csv' ? 'csv' : 'tab-separated-values'};charset=utf-8` });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `perfis-por-caderno.${formato}`;
    a.click();
  }, [rows, totals]);

  const exportPdf = useCallback(async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    doc.text('Perfis por Caderno', 14, 10);
    autoTable(doc, {
      startY: 15,
      head: [['UF', 'Caderno', 'Total de Perfis', 'Perfis Básicos', 'Perfis Completos']],
      body: rows.map(r => [r.UF || '-', r.Caderno || '-', r.total || 0, r.basico || 0, r.completo || 0]),
      foot: totals ? [['TOTAL', '', String(totals.total), String(totals.basico), String(totals.completo)]] : [],
      theme: 'grid', styles: { fontSize: 7 },
      footStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold' },
    });
    doc.save('perfis-por-caderno.pdf');
  }, [rows, totals]);

  if (!data?.cadernosPorUf) return <div className="p-3 text-muted">Nenhum dado disponível.</div>;

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="m-0 fw-bold" style={{ color: '#1a1a2e' }}>
          <i className="fa fa-book me-2" style={{ color: '#6f42c1' }}></i>Perfis por Caderno
        </h5>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-success" style={{ borderRadius: 6, fontSize: '0.75rem' }} onClick={() => exportar('csv')}>
            <i className="fa fa-file-excel-o me-1"></i>CSV
          </button>
          <button className="btn btn-sm btn-outline-success" style={{ borderRadius: 6, fontSize: '0.75rem' }} onClick={() => exportar('xlsx')}>
            <i className="fa fa-file-excel-o me-1"></i>XLSX
          </button>
          <button className="btn btn-sm btn-outline-danger" style={{ borderRadius: 6, fontSize: '0.75rem' }} onClick={exportPdf}>
            <i className="fa fa-file-pdf-o me-1"></i>PDF
          </button>
        </div>
      </div>

      <div className="row g-2 mb-3">
        <div className="col-auto">
          <select className="form-select form-select-sm" value={selectedUf}
            onChange={e => setSelectedUf(e.target.value)}
            style={{ borderRadius: 6, fontSize: '0.82rem', minWidth: 200 }}>
            <option value="">Todas as UFs</option>
            {ufList.map(uf => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
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
                <th className="p-2 text-end">Total de Perfis</th>
                <th className="p-2 text-end">Perfis Básicos</th>
                <th className="p-2 text-end">Perfis Completos</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="p-2 fw-semibold">{r.UF || 'Sem UF'}</td>
                  <td className="p-2">{r.Caderno || '-'}</td>
                  <td className="p-2 text-end">{formatNumber(r.total)}</td>
                  <td className="p-2 text-end">{formatNumber(r.basico)}</td>
                  <td className="p-2 text-end">{formatNumber(r.completo)}</td>
                </tr>
              ))}
              {totals && (
                <tr style={{ background: '#e9ecef', fontWeight: 700 }}>
                  <td className="p-2">TOTAL</td>
                  <td className="p-2"></td>
                  <td className="p-2 text-end">{formatNumber(totals.total)}</td>
                  <td className="p-2 text-end">{formatNumber(totals.basico)}</td>
                  <td className="p-2 text-end">{formatNumber(totals.completo)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
