import React, { useMemo, useCallback, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

function formatNumber(n) {
  return Number(n || 0).toLocaleString('pt-BR');
}

export default function AtividadesPage() {
  const { data } = useOutletContext();
  const rows = data?.porAtividade || [];

  const [topLimit, setTopLimit] = useState(20);

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => b.total - a.total);
  }, [rows]);

  const topRows = useMemo(() => {
    return sorted.slice(0, topLimit);
  }, [sorted, topLimit]);

  const maxTotal = useMemo(() => {
    return sorted.length ? sorted[0].total : 1;
  }, [sorted]);

  const totals = useMemo(() => {
    if (!rows.length) return null;
    return {
      total: rows.reduce((s, r) => s + Number(r.total || 0), 0),
      basico: rows.reduce((s, r) => s + Number(r.basico || 0), 0),
      completo: rows.reduce((s, r) => s + Number(r.completo || 0), 0),
    };
  }, [rows]);

  const exportar = useCallback((formato) => {
    const headers = ['Atividade', 'Total', 'Básicos', 'Completos'];
    const sep = formato === 'csv' ? ';' : '\t';
    let content = headers.join(sep) + '\n';
    rows.forEach(r => {
      content += [r.atividade || '-', r.total || 0, r.basico || 0, r.completo || 0].join(sep) + '\n';
    });
    if (totals) {
      content += ['TOTAL', totals.total, totals.basico, totals.completo].join(sep) + '\n';
    }
    const blob = new Blob(["\uFEFF" + content], { type: `text/${formato === 'csv' ? 'csv' : 'tab-separated-values'};charset=utf-8` });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `atividades.${formato}`;
    a.click();
  }, [rows, totals]);

  const exportPdf = useCallback(async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    doc.text('Atividades', 14, 10);
    autoTable(doc, {
      startY: 15,
      head: [['Atividade', 'Total', 'Básicos', 'Completos']],
      body: rows.map(r => [r.atividade || '-', r.total || 0, r.basico || 0, r.completo || 0]),
      foot: totals ? [['TOTAL', String(totals.total), String(totals.basico), String(totals.completo)]] : [],
      theme: 'grid', styles: { fontSize: 7 },
      footStyles: { fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold' },
    });
    doc.save('atividades.pdf');
  }, [rows, totals]);

  if (!rows.length) return <div className="p-3 text-muted">Nenhum dado disponível.</div>;

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="m-0 fw-bold" style={{ color: '#1a1a2e' }}>
          <i className="fa fa-tasks me-2" style={{ color: '#fd7e14' }}></i>Atividades
        </h5>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-success" style={{ borderRadius: 6, fontSize: '0.75rem' }} onClick={() => exportar('csv')}><i className="fa fa-file-excel-o me-1"></i>CSV</button>
          <button className="btn btn-sm btn-outline-success" style={{ borderRadius: 6, fontSize: '0.75rem' }} onClick={() => exportar('xlsx')}><i className="fa fa-file-excel-o me-1"></i>XLSX</button>
          <button className="btn btn-sm btn-outline-danger" style={{ borderRadius: 6, fontSize: '0.75rem' }} onClick={exportPdf}><i className="fa fa-file-pdf-o me-1"></i>PDF</button>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="card-header bg-white border-bottom-0 pt-3 pb-1 px-3 d-flex justify-content-between align-items-center">
              <small className="fw-semibold text-muted text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: 0.5 }}>
                <i className="fa fa-bar-chart me-1" style={{ color: '#fd7e14' }}></i> Ranking das atividades
              </small>
              <button className="btn btn-sm btn-outline-secondary" style={{ borderRadius: 6, fontSize: '0.7rem' }}
                onClick={() => setTopLimit(topLimit === 20 ? rows.length : 20)}>
                <i className={`fa fa-chevron-${topLimit === 20 ? 'down' : 'up'} me-1`}></i>
                {topLimit === 20 ? `Mostrar todas (${rows.length})` : 'Mostrar Top 20'}
              </button>
            </div>
            <div className="card-body p-3" style={{ maxHeight: 460, overflowY: 'auto' }}>
              {topRows.map((r, i) => {
                const pct = (r.total / maxTotal) * 100;
                const hue = 30 - i * 1.5;
                return (
                  <div key={r.atividade || i} className="mb-2">
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="text-truncate me-2" style={{ maxWidth: '65%' }}>
                        <span className="fw-bold me-1" style={{ color: '#888', fontSize: '0.7rem' }}>#{i + 1}</span>
                        {r.atividade || 'Sem nome'}
                      </span>
                      <span className="fw-semibold text-nowrap">{formatNumber(r.total)}</span>
                    </div>
                    <div className="progress" style={{ height: 7, borderRadius: 4, background: '#e9ecef' }}>
                      <div className="progress-bar" style={{
                        width: `${pct}%`,
                        background: `hsl(${hue < 0 ? 0 : hue}, 75%, 55%)`,
                        borderRadius: 4
                      }}></div>
                    </div>
                  </div>
                );
              })}
              {topLimit === 20 && rows.length > 20 && (
                <div className="text-center mt-2">
                  <small className="text-muted">+ {rows.length - 20} atividades restantes</small>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
        <div className="card-body p-0" style={{ overflowX: 'auto' }}>
          <table className="table table-striped table-hover mb-0" style={{ fontSize: '0.82rem' }}>
            <thead style={{ background: '#1a1a2e', color: '#fff' }}>
              <tr>
                <th className="p-2">Atividade</th>
                <th className="p-2 text-end">Total</th>
                <th className="p-2 text-end">Básicos</th>
                <th className="p-2 text-end">Completos</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="p-2" style={{ maxWidth: 350, whiteSpace: 'normal', wordBreak: 'break-word' }}>{r.atividade || '-'}</td>
                  <td className="p-2 text-end fw-semibold">{formatNumber(r.total)}</td>
                  <td className="p-2 text-end">{formatNumber(r.basico)}</td>
                  <td className="p-2 text-end">{formatNumber(r.completo)}</td>
                </tr>
              ))}
              {totals && (
                <tr style={{ background: '#e9ecef', fontWeight: 700 }}>
                  <td className="p-2">TOTAL</td>
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
