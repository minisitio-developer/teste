import React, { useMemo, useCallback } from 'react';
import { useOutletContext, Link } from 'react-router-dom';

function formatNumber(n) {
  return Number(n || 0).toLocaleString('pt-BR');
}

export default function CampanhasPage() {
  const { data } = useOutletContext();
  const rows = data?.porId || [];

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
    const headers = ['ID', 'Descrição', 'Anúncios', 'Básicos', 'Completos', 'Capa'];
    const sep = formato === 'csv' ? ';' : '\t';
    let content = headers.join(sep) + '\n';
    rows.forEach(r => {
      content += [r.id || '-', r.descricao || '-', r.total || 0, r.basico || 0, r.completo || 0, r.capa || 0].join(sep) + '\n';
    });
    if (totals) {
      content += ['TOTAL', '', totals.total, totals.basico, totals.completo, totals.capa].join(sep) + '\n';
    }
    const blob = new Blob(["\uFEFF" + content], { type: `text/${formato === 'csv' ? 'csv' : 'tab-separated-values'};charset=utf-8` });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `campanhas.${formato}`;
    a.click();
  }, [rows, totals]);

  const exportPdf = useCallback(async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    doc.text('Campanhas', 14, 10);
    autoTable(doc, {
      startY: 15,
      head: [['ID', 'Descrição', 'Anúncios', 'Básicos', 'Completos', 'Capa']],
      body: rows.map(r => [r.id || '-', r.descricao || '-', r.total || 0, r.basico || 0, r.completo || 0, r.capa || 0]),
      foot: totals ? [['TOTAL', '', String(totals.total), String(totals.basico), String(totals.completo), String(totals.capa)]] : [],
      theme: 'grid', styles: { fontSize: 7 },
      footStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold' },
    });
    doc.save('campanhas.pdf');
  }, [rows, totals]);

  if (!rows.length) return <div className="p-3 text-muted">Nenhum dado disponível.</div>;

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="m-0 fw-bold" style={{ color: '#1a1a2e' }}>
          <i className="fa fa-bullhorn me-2" style={{ color: '#dc3545' }}></i>Campanhas
        </h5>
        <div className="d-flex gap-2 align-items-center">
          <Link to="/admin/campanha" className="btn btn-sm btn-outline-primary" style={{ borderRadius: 6, fontSize: '0.75rem' }}>
            <i className="fa fa-external-link me-1"></i>Consulta ao vivo
          </Link>
          <button className="btn btn-sm btn-outline-success" style={{ borderRadius: 6, fontSize: '0.75rem' }} onClick={() => exportar('csv')}><i className="fa fa-file-excel-o me-1"></i>CSV</button>
          <button className="btn btn-sm btn-outline-success" style={{ borderRadius: 6, fontSize: '0.75rem' }} onClick={() => exportar('xlsx')}><i className="fa fa-file-excel-o me-1"></i>XLSX</button>
          <button className="btn btn-sm btn-outline-danger" style={{ borderRadius: 6, fontSize: '0.75rem' }} onClick={exportPdf}><i className="fa fa-file-pdf-o me-1"></i>PDF</button>
        </div>
      </div>

      <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
        <div className="card-body p-0" style={{ overflowX: 'auto' }}>
          <table className="table table-striped table-hover mb-0" style={{ fontSize: '0.82rem' }}>
            <thead style={{ background: '#1a1a2e', color: '#fff' }}>
              <tr>
                <th className="p-2">ID</th>
                <th className="p-2">Descrição</th>
                <th className="p-2 text-end">Anúncios</th>
                <th className="p-2 text-end">Básicos</th>
                <th className="p-2 text-end">Completos</th>
                <th className="p-2 text-end">Capa</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="p-2"><code>{r.id || '-'}</code></td>
                  <td className="p-2">{r.descricao || '-'}</td>
                  <td className="p-2 text-end fw-semibold">{formatNumber(r.total)}</td>
                  <td className="p-2 text-end">{formatNumber(r.basico)}</td>
                  <td className="p-2 text-end">{formatNumber(r.completo)}</td>
                  <td className="p-2 text-end">{formatNumber(r.capa)}</td>
                </tr>
              ))}
              {totals && (
                <tr style={{ background: '#e9ecef', fontWeight: 700 }}>
                  <td className="p-2" colSpan={2}>TOTAL</td>
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
